const mongoose = require('mongoose');
const { Schema } = mongoose;
const crypto = require('crypto');

const EmailOTPSchema = new Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  otpHash: {
    type: String,
    required: true
  },

  purpose: {
    type: String,
    enum: [
      'email_verification',
      'login',
      'password_reset',
      'email_change',
      'two_factor'
    ],
    required: true,
    index: true
  },

  attempts: {
    type: Number,
    default: 0
  },

  maxAttempts: {
    type: Number,
    default: 5
  },

  isUsed: {
    type: Boolean,
    default: false
  },

  usedAt: {
    type: Date,
    default: null
  },

  requestedFromIp: {
    type: String,
    required: true
  },

  //انتهاء صلاحية OTP
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000)
  }
},{
  timestamps: true,
  versionKey: false
});

//حذف OTPs المنتهية تلقائيًا
EmailOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
EmailOTPSchema.index({ email: 1, purpose: 1, isUsed: 1 });
//يساعد في rate limiting
EmailOTPSchema.index({ email: 1, createdAt: -1 });

module.exports = mongoose.model('EmailOTP', EmailOTPSchema);