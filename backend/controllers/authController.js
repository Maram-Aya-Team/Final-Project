const User=require("../models/userSchema");
const bcrypt=require("bcrypt");
const generateToken=require("../utils/generateToken");
const authService = require("../services/auth.service");
// استرجاع IP من الريكويست
const getIP = (req) =>
  req.ip ||
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
  req.socket?.remoteAddress ||
  'unknown';

const authController = {
  async register(req, res, next) {
    try {
      const { name, email, password, city } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }

      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        city
      });

      await user.save();

      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: "Registered successfully",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  async googleCallback(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Google authentication failed",
        });
      }

      const token = generateToken(req.user);

      return res.redirect(
        `${process.env.FRONTEND_URL}/auth-success?token=${token}`
      );
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Error processing Google login",
      });
    }
  },
  
  // POST /auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }

      const result = await authService.login(
        email,
        password,
        getIP(req),
        req.headers['user-agent'] || 'unknown'
      );
      // لو OTP مطلوب
      if (result.status === 'otp_required') {
        return res.status(200).json(result);
      }

      //cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 يوم
      });

      return res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  },
  //POST /auth/verify-otp
  async verifyOTP(req, res, next) {
    try {
      const { email, otp, purpose } = req.body;

      if (!email || !otp || !purpose) {
        return res.status(400).json({ message: 'email, otp, and purpose are required' });
      }

      const result = await authService.verifyOTP(
        email,
        otp,
        purpose,
        getIP(req),
        req.headers['user-agent'] || 'unknown'
      );

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  },
  //POST /auth/refresh-token
  async refreshToken(req, res, next) {
    try {
      // استرجاع الريفريش توكن من الكوكيز
      const rawRefreshToken = req.cookies?.refreshToken;

      const result = await authService.refreshTokens(
        rawRefreshToken,
        getIP(req),
        req.headers['user-agent'] || 'unknown'
      );

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ accessToken: result.accessToken });
    } catch (err) {
      next(err);
    }
  },
//POST /auth/logout
  async logout(req, res, next) {
    try {
      const rawRefreshToken = req.cookies?.refreshToken;
      await authService.logout(rawRefreshToken);

      res.clearCookie('refreshToken');
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;