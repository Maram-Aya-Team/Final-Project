const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // المعلومات الأساسية للحساب
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, unique: true, lowercase: true },
  password: { 
    type: String, 
    default: null, 
    validate: { validator: (v) => v === null || v.length >= 6, message: "Password must be at least 6 characters" } 
  },
  phone: { type: String, trim: true },
  city: { 
    type: String, trim: true,
    enum: ['Amman','Irbid','Zarqa','Ajloun','Jerash','Mafraq','Balqa','Madaba','Karak','Tafilah','Maan','Aqaba'] 
  },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // تفاصيل البروفايل الشخصي
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true, maxlength: 30 },
  bio: { type: String, trim: true, maxlength: 300, default: '' },
  avatar: { type: String, default: null },
  cover: { type: String, default: null },
  socialLinks: {
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    facebook: { type: String, default: '' },
    linkedin: { type: String, default: '' }
  },
  privacy: {
    showPhone: { type: Boolean, default: false },
    showEmail: { type: Boolean, default: false },
    showActivity: { type: Boolean, default: true }
  },
  notificationPrefs: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    matches: { type: Boolean, default: true },
    messages: { type: Boolean, default: true },
    system: { type: Boolean, default: true }
  },
  stats: {
    totalPosts: { type: Number, default: 0 },
    lostPosts: { type: Number, default: 0 },
    foundPosts: { type: Number, default: 0 },
    resolvedPosts: { type: Number, default: 0 }
  },
  googleId: { type: String, default: null, sparse: true },
  isEmailVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  bannedReason: { type: String, default: null },
  lastLoginAt: { type: Date, default: null },
  lastLoginIp: { type: String, default: null },
  fcmToken: { type: String, default: null },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: null },

  savedPosts: [{
    postType: { type: String, enum: ['lost', 'found'] },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    savedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true, versionKey: false });
userSchema.index({ email: 1 });
userSchema.index({ username: 1 }, { sparse: true });

module.exports = mongoose.model('User', userSchema);