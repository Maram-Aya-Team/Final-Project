const ALLOWED_OTP_PURPOSES = new Set([
  'email_verification',
  'login',
  'password_reset',
  'email_change',
  'two_factor',
]);

module.exports = { ALLOWED_OTP_PURPOSES };
