const mongoose = require('mongoose');
const { Schema } = mongoose;
const crypto = require('crypto');

const RefreshTokenSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  tokenHash: {
    type: String,
    required: true,
    unique: true
  },

  deviceInfo: {
    userAgent: String,
    platform: String,
    deviceId: String,
    appVersion: String
  },

  ip: {
    type: String,
    required: true
  },

  loginLocation: {
    country: String,
    city: String
  },

  fcmToken: {
    type: String,
    default: null
  },

  lastUsedAt: {
    type: Date,
    default: Date.now
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  revokedReason: {
    type: String,
    enum: ['logout','rotation','security_alert','admin_action','expired'],
    default: null
  },

  expiresAt: {
    type: Date,
    required: true
  },

  rotationCount: {
    type: Number,
    default: 0
  }
},{
  timestamps: true,
  versionKey: false
});

//حذف التوكنات المنتهية تلقائيًا
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
//فيتش الجلسات النشطة للمستخدم بسرعة
RefreshTokenSchema.index({ user: 1, isActive: 1 });
// التحقق السريع من التوكن
RefreshTokenSchema.index({ tokenHash: 1 }, { unique: true });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);