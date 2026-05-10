import { apiRequest } from "./api";

export const registerUser = (userData) =>
  apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const loginUser = (userData) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const verifyOtp = (data) =>
  apiRequest("/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const logoutUser = async () => {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } catch {
    // ignore
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  }
};
