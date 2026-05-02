const mongoose = require('mongoose');
const { Schema } = mongoose;
const UserSchema = new Schema({
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      default: null, //لمستخدمي جوجل فقط
    },
    name: { type: String, trim: true, maxlength: 100 },
    avatar: { type: String, default: null },
    googleId: { type: String, default: null, sparse: true },
    isEmailVerified: { type: Boolean, default: false },
    role: {
      type: String,
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
    isBanned: { type: Boolean, default: false },
    bannedReason: { type: String, default: null },
    // عدد محاولات تسجيل الدخول الفاشلة
    loginAttempts: { type: Number, default: 0 },
    // وقت فك الحظر المؤقت
    lockUntil: { type: Date, default: null },
    // إعدادات الإشعارات
    notificationPreferences: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
    },
    //FCM
    fcmToken: { type: String, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
);

UserSchema.index({ email: 1 }, { unique: true });
const User = mongoose.model('User', UserSchema);

const EmailOTPSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,},
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, },
    //هاش للـ OTP
    otpHash: { type: String, required: true },
    purpose: {
      type: String,
      enum: ['email_verification', 'login', 'password_reset', 'email_change', 'two_factor'],
      required: true,
      index: true,},
    // عدد محاولات الإدخال الخاطئة
    attempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    isUsed: { type: Boolean, default: false },
    usedAt: { type: Date, default: null },
    requestedFromIp: { type: String, required: true },
    // ينتهي بعد 10 دقائق  TTL index يحذفه تلقائيًا
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000),
    },
  },
  { timestamps: true, versionKey: false }
);

EmailOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
EmailOTPSchema.index({ email: 1, purpose: 1, isUsed: 1 });

const EmailOTP = mongoose.model('EmailOTP', EmailOTPSchema);

//refreshToken schema 
const RefreshTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,},

    tokenHash: { type: String, required: true, unique: true },
    deviceInfo: {
      userAgent: String,
      platform: String,
      deviceId: String,},

    ip: { type: String, required: true },
    fcmToken: { type: String, default: null },
    lastUsedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true, index: true },
    revokedReason: {
      type: String,
      enum: ['logout', 'rotation', 'security_alert', 'admin_action', 'expired', null],
      default: null,},

    expiresAt: { type: Date, required: true },
    rotationCount: { type: Number, default: 0 },},

  { timestamps: true, versionKey: false }
);

RefreshTokenSchema.index({ expiresAt:1 }, { expireAfterSeconds: 0 });
RefreshTokenSchema.index({ user:1, isActive:1 });
RefreshTokenSchema.index({ tokenHash:1 }, { unique: true });

const RefreshToken = mongoose.model('RefreshToken', RefreshTokenSchema);

module.exports = { User, EmailOTP, RefreshToken };