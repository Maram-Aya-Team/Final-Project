const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
//POST
router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);

module.exports = router;