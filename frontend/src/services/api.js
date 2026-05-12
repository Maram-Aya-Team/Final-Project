import { API_BASE_URL, assertApiBaseUrl } from "../config/runtime";

const isBrowser = typeof window !== "undefined";

const getAccessToken = () => (isBrowser ? localStorage.getItem("accessToken") : null);

const saveAccessToken = (token) => {
  if (!isBrowser || !token) return;
  localStorage.setItem("accessToken", token);
};

const readResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (!text) return null;

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  return { message: text };
};

const refreshAccessToken = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) return null;

  const data = await readResponseBody(response);
  const newToken = data?.accessToken;

  if (newToken) {
    saveAccessToken(newToken);
    return newToken;
  }

  return null;
};

const shouldSkipRefresh = (endpoint) => endpoint.startsWith("/auth/");

export const apiRequest = async (endpoint, options = {}, retry = true) => {
  assertApiBaseUrl();
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: "include",
  });

  if (response.status === 401 && retry && !shouldSkipRefresh(endpoint)) {
    const refreshedToken = await refreshAccessToken();

    if (refreshedToken) {
      return apiRequest(endpoint, options, false);
    }
  }

  const data = await readResponseBody(response);

  if (!response.ok) {
    const errorMessage = data?.message || "حدث خطأ أثناء تنفيذ الطلب";
    throw new Error(errorMessage);
  }

  return data;
};

export { API_BASE_URL };
