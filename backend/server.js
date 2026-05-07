require('dotenv').config();
const http = require('http'); // عشان السوكت
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const passport = require("./config/google");
const authRoutes = require("./routes/authRoutes");
const postsRoutes = require("./routes/postRoutes"); 
const { initSocket } = require('./sockets/feedHandler');

const app = express();
const server = http.createServer(app); // تحويل Express لـ HTTP Server
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.set('trust proxy', 1);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan('dev'));
app.use(passport.initialize());
app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.get('/', (req, res) => {
  res.json({ success: true, message: 'FoundIt JO Backend ✅', timestamp: new Date() });
});
app.use((req, res) => {
  res.status(404).json({ message: 'المسار غير موجود' });
});
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ message: err.message || 'خطأ داخلي في السيرفر' });
});
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  // تشغيل السوكت بعد التأكد من اتصال القاعدة
  initSocket(server);
  server.listen(PORT, () => {
    console.log(`Server + Socket.io running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('MongoDB failed:', err.message);
  process.exit(1);
});

module.exports = { app, server };
