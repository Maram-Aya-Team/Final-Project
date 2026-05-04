const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require("../models/userSchema");
const EmailOTP = require("../models/email-otp.schema");
const RefreshToken = require("../models/refresh-token.schema");
const emailService = require('./email.service');

const sha256 = (text) =>
  crypto.createHash('sha256').update(text).digest('hex');
 
const generateOTP = () =>
  crypto.randomInt(100000, 1000000).toString();

const generateRefreshToken = () =>
  crypto.randomBytes(40).toString('hex');

const authService = {

  async login(email, password, ip, userAgent) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user)      throw { status: 401, message: 'Invalid email or password' };
    if (user.isBanned) throw { status: 403, message: 'User is banned' };
    if (!user.password) throw { status: 400, message: 'Use Google login instead' };

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw { status: 401, message: 'Invalid email or password' };

    // إذا الإيميل مش مفعل، ابعت OTP
    if (!user.isEmailVerified) {
      await authService.sendOTP(normalizedEmail, 'email_verification', ip, user._id);
      return { status: 'otp_required', email: normalizedEmail, reason: 'email_not_verified' };
    }

    const tokens = await authService.issueTokens(user, ip, userAgent);
    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    await user.save();

    return {
      ...tokens,
      user: { id: user._id, email: user.email, name: user.name },
    };
  },

  async sendOTP(email, purpose, ip, userId = null) {
    const normalizedEmail = email.toLowerCase();

    // نلغي أي OTP قديم لنفس الغرض
    await EmailOTP.updateMany(
      { email: normalizedEmail, purpose, isUsed: false },
      { isUsed: true, usedAt: new Date() }
    );

    const otp = generateOTP();
    const otpHash = sha256(otp);

    await EmailOTP.create({
      email: normalizedEmail,
      user: userId,
      otpHash,
      purpose,
      requestedFromIp: ip || 'unknown',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await emailService.sendOTP(email, otp, purpose);
    return { sent: true };
  },

  async verifyOTP(email, otp, purpose, ip, userAgent) {
    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await EmailOTP.findOne({
      email: normalizedEmail,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) throw { status: 400, message: 'Invalid or expired code' };

    const inputHash = sha256(otp.toString().trim());
    if (inputHash !== otpRecord.otpHash) throw { status: 400, message: 'Invalid verification code' };

    await EmailOTP.findByIdAndUpdate(otpRecord._id, {
      isUsed: true,
      usedAt: new Date(),
    });

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) throw { status: 404, message: 'User not found' };

    if (purpose === 'email_verification') {
      user.isEmailVerified = true;
    }

    user.lastLoginAt = new Date();
    user.lastLoginIp = ip;
    await user.save();

    const tokens = await authService.issueTokens(user, ip, userAgent);
    return {
      ...tokens,
      user: { id: user._id, email: user.email, name: user.name },
    };
  },

  async issueTokens(user, ip, userAgent) {
    const accessToken = jwt.sign(
      { sub: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const rawRefreshToken = generateRefreshToken();
    const tokenHash = sha256(rawRefreshToken);

    await RefreshToken.create({
      user: user._id,
      tokenHash,
      ip,
      deviceInfo: { userAgent },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return { accessToken, refreshToken: rawRefreshToken };
  },

  async refreshTokens(rawRefreshToken, ip, userAgent) {
    if (!rawRefreshToken) throw { status: 401, message: 'Refresh token required' };

    const tokenHash = sha256(rawRefreshToken);
    const session = await RefreshToken.findOne({ tokenHash, isActive: true });

    if (!session) throw { status: 401, message: 'Invalid refresh token' };
    if (session.expiresAt < new Date()) throw { status: 401, message: 'Session expired' };

    session.isActive = false;
    await session.save();

    const user = await User.findById(session.user);
    if (!user) throw { status: 401, message: 'User not found' };

    return await authService.issueTokens(user, ip, userAgent);
  },

  async logout(rawRefreshToken) {
    if (!rawRefreshToken) return;
    const tokenHash = sha256(rawRefreshToken);
    await RefreshToken.findOneAndUpdate({ tokenHash }, { isActive: false });
  },
};

module.exports = authService;