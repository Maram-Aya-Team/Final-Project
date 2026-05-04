const emailService = {
  async sendOTP(email, otp, purpose) {
    console.log("OTP email:", { email, otp, purpose });
    return true;
  },
};

module.exports = emailService;