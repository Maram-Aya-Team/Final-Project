const emailService = {
  async sendOTP(email, purpose = 'login') {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, purpose, resendOTP: true }),
    });

    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || 'Failed to send OTP');
      error.status = response.status;
      throw error;
    }

    return data;
  },
};

export default emailService;
