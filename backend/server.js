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
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const claimRoutes = require('./routes/claimRoutes');
const mapsRoutes = require('./routes/mapsRoutes');
const matchRoutes = require('./routes/matchRoutes');
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminDashboardRoutes=require("./routes/adminDashboardRoutes");
const adminReportRoutes = require("./routes/adminReportRoutes");
const adminFraudRoutes = require("./routes/adminFraudRoutes");
const { initNotificationSocket } = require('./sockets/notificationHandler');
const { bindSocketServer } = require('./sockets/feedHandler');
const chatSocket = require("./sockets/chatSocket");
const logger = require("./utils/logger");
const { parseAllowedOrigins, isOriginAllowed } = require("./utils/cors");
require("./config/google");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";
const configuredOrigins = parseAllowedOrigins({ allowLocalFallback: false });

if (isProduction && configuredOrigins.length === 0) {
  logger.error("Failed to start: set CORS_ORIGINS or FRONTEND_URL in production");
  process.exit(1);
}

const corsOrigins = isProduction
  ? configuredOrigins
  : parseAllowedOrigins();

app.use(express.json({ limit: '10mb' }));



app.use(helmet());
app.set('trust proxy', 1);
app.use(cookieParser());
app.use(morgan(isProduction ? "combined" : "dev"));
app.use(cors({
  origin(origin, callback) {
    if (isOriginAllowed(origin, corsOrigins)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET','POST','DELETE','PATCH','PUT'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use("/conversations", conversationRoutes);
app.use("/messages", messageRoutes);
app.use("/admin/dashboard", adminDashboardRoutes);
app.use("/admin/reports", adminReportRoutes);
app.use("/admin/fraud", adminFraudRoutes);
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/notifications', notificationRoutes);
app.use('/profile', profileRoutes);
app.use('/claims', claimRoutes);
app.use('/maps', mapsRoutes);
app.use('/matches', matchRoutes);
app.get('/healthz', (req, res) => res.status(200).json({ ok: true }));

app.get('/', (req, res) => res.json({ success: true, message: 'FoundIt JO Backend ✅' }));
app.use((req, res) => res.status(404).json({ message: 'الرابط غير موجود' }));
app.use((err, req, res, next) => {
  logger.error("SERVER_ERROR", { message: err.message, stack: err.stack });
  res.status(err.status || 500).json({ message: err.message || 'خطأ داخلي في السيرفر' });
});
const io = new Server(server, {
  cors: { origin: corsOrigins, credentials: true },
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
initNotificationSocket(io);
bindSocketServer(io);
chatSocket(io);

const mongoUri = process.env.DATABASE_URL || process.env.MONGO_URI;

if (!mongoUri) {
  logger.error("Failed to start: MongoDB connection requires DATABASE_URL or MONGO_URI");
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => {
    logger.info("Connected to MongoDB");
    server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
  })
  .catch(err => {
    logger.error("MongoDB connection failed", { message: err.message });
    process.exit(1);
  });

module.exports = { app, server, io };
