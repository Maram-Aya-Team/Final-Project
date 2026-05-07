const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');

const isGoogleOAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CALLBACK_URL
);

const requireGoogleOAuth = (req, res, next) => {
  if (!isGoogleOAuthConfigured) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured on server',
    });
  }
  return next();
};
//POST
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

// Google OAuth
router.get('/google', requireGoogleOAuth, passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback',
  requireGoogleOAuth,
  passport.authenticate('google', { session: false, failureRedirect: '/auth/failed' }),
  authController.googleCallback
);
router.get('/failed', (req, res) => res.status(401).json({ success: false, message: 'Google authentication failed' }));

module.exports = router;
