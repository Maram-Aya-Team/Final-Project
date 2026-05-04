const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {'Content-Type': 'application/json',...options.headers,},
    credentials: 'include', // استقبال و ارسال الكوكيز
    ...options,
  };
 
  // إضافة التوكن للطلبات إذا كان موجود
  const accessToken =typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
 
  if (accessToken && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  const response = await fetch(url, config);
  const data = await response.json();
 
  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred.');
    error.status = response.status;
    error.data = data;
    throw error;} return data;
};
// API functions
export const authAPI = {

    async login(email, password) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },
 
  /*التحقق من ال otp*/
  async verifyOTP(email, otp, purpose = 'login') {
    return apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp, purpose }),
    });
  },
 
  /* اعادة ارسال ال OTP*/
  async resendOTP(email, purpose = 'login') {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, resendOTP: true }),
    });
  },
 
  /*تحديد الاكسس توكن*/
  async refreshToken() {
    return apiRequest('/auth/refresh-token', {
      method: 'POST',
    });
  },
  async logout() {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};
 
export default authAPI;