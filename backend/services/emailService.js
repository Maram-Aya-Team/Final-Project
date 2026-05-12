const logger = require("../utils/logger");

const emailService = {
  async sendOTP(email, otp, purpose) {
    logger.info("OTP email requested", { email, purpose });
    logger.debug("OTP value generated", { otp, purpose });
    return true;
  },
};

module.exports = emailService;
