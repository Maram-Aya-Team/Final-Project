const nodemailer = require('nodemailer');

// إعداد الـ transporter مرة وحدة
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// نصوص الـ OTP حسب الغرض
const purposeConfig = {
  email_verification: {
    subject: 'Verify your FoundIt JO account',
    action: 'verify your email address',
  },
  login: {
    subject: 'Your FoundIt JO login code',
    action: 'log in to your account',
  },
  password_reset: {
    subject: 'Reset your FoundIt JO password',
    action: 'reset your password',
  },
  email_change: {
    subject: 'Confirm your new email - FoundIt JO',
    action: 'confirm your new email',
  },
  two_factor: {
    subject: 'Two-factor authentication code - FoundIt JO',
    action: 'complete sign-in',
  },
};

const emailService = {
  async sendOTP(email, otp, purpose) {
    const config = purposeConfig[purpose] || purposeConfig.login;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; background: #f8fafc; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #152B5B; font-size: 28px; margin: 0;">
            Found<span style="color: #22C55E;">It</span> JO
          </h1>
        </div>

        <div style="background: #ffffff; border-radius: 12px; padding: 28px; text-align: center;">
          <p style="color: #475569; font-size: 15px; margin-bottom: 24px;">
            Use the code below to ${config.action}:
          </p>

          <div style="background: #eff6ff; border: 2px dashed #2563EB; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <span style="font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #2563EB;">
              ${otp}
            </span>
          </div>

          <p style="color: #94a3b8; font-size: 13px;">
            This code expires in <strong>10 minutes</strong>.<br/>
            If you did not request this, please ignore this email.
          </p>
        </div>

        <p style="text-align: center; color: #cbd5e1; font-size: 12px; margin-top: 20px;">
          FoundIt JO Platform — Jordan's Lost & Found Network
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `FoundIt JO <${process.env.EMAIL_USER}>`,
      to: email,
      subject: config.subject,
      html,
    });
  },
};

module.exports = emailService;