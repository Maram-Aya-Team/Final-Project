const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:5000" : "");

const assertApiBaseUrl = () => {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }
};

const GOOGLE_AUTH_URL = API_BASE_URL ? `${API_BASE_URL}/auth/google` : "";

export { API_BASE_URL, GOOGLE_AUTH_URL, assertApiBaseUrl };
