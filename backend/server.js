require('dotenv').config();

const express= require('express');
const mongoose= require('mongoose');
const cookieParser = require('cookie-parser');
const helmet= require('helmet');
const morgan= require('morgan');
const cors= require('cors');
const authRoutes = require('./routes/auth.routes');
const app= express();
const PORT = process.env.PORT || 5000;

//security
app.use(helmet());
app.set('trust proxy', 1);
//parsers
app.use(express.json());
app.use(cookieParser());
//corse
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PATCH', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
//logging
app.use(morgan('dev'));
//routes
app.use('/auth', authRoutes);
//health
app.get('/', (req, res) => {
  res.json({ success: true, message: 'FoundIt JO Backend is running' });
});
//404
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
//err handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
  });
});
//db+start
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
})
.catch((err) => {
  console.error(' MongoDB connection failed:', err.message);
  process.exit(1);
});

module.exports = app;