"use client";

import { createContext, useContext, useState } from "react";
import { loginUser, logoutUser, registerUser } from "../services/authService";

const AuthContext = createContext(null);

const getSavedUser = () => {
  const rawUser = localStorage.getItem("user");

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

const persistSession = (token, user) => {
  if (token) localStorage.setItem("accessToken", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSavedUser());
  const [accessToken, setAccessToken] = useState(() =>
    localStorage.getItem("accessToken"),
  );
  const [loading] = useState(false);

  const applyAuthResponse = (data) => {
    const token = data?.accessToken || data?.token;
    const nextUser = data?.user || null;

    if (token) {
      persistSession(token, nextUser);
      setAccessToken(token);
    }

    if (nextUser) {
      setUser(nextUser);
    }

    return data;
  };

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    return applyAuthResponse(data);
  };

  const register = async (payload) => {
    const data = await registerUser(payload);
    return applyAuthResponse(data);
  };

  const logout = async () => {
    await logoutUser();

    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        isAuthenticated: !!accessToken,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
