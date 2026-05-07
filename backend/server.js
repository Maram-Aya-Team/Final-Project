require('dotenv').config();
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// استيراد الـ Routes والـ Handlers
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const { initNotificationSocket } = require('./sockets/notificationHandler');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// إعدادات الحماية والـ Parsers
app.use(helmet());
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// إعدادات CORS للسماح للفرونت إند بالوصول
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET','POST','DELETE','PATCH','PUT'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ربط المسارات (Routes)
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/notifications', notificationRoutes);
app.use('/profile', profileRoutes);

// فحص حالة السيرفر
app.get('/', (req, res) => res.json({ success: true, message: 'FoundIt JO Backend ✅' }));

// معالجة الروابط غير الموجودة (404)
app.use((req, res) => res.status(404).json({ message: 'الرابط غير موجود' }));

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({ message: err.message || 'خطأ داخلي في السيرفر' });
});

// إعداد Socket.io مع حماية الـ JWT
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true },
  transports: ['websocket','polling'],
});

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.sub || decoded.id;
      socket.isAuth = true;
    } else {
      socket.isAuth = false;
    }
    next();
  } catch {
    socket.isAuth = false;
    next();
  }
});

// تشغيل الـ Sockets والربط مع قواعد البيانات
initNotificationSocket(io);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB failed:', err.message);
    process.exit(1);
  });

module.exports = { app, server, io };