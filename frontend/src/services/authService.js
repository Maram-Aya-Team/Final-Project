import { apiRequest } from "./api";

export const registerUser = (userData) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = (userData) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const verifyOtp = (data) => {
  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const logoutUser = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
};