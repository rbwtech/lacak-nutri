import { createContext, useContext, useState, useEffect } from "react";
import api from "../config/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token && storedUser !== "undefined") {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.clear();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password, recaptchaToken) => {
    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
        recaptcha_token: recaptchaToken,
      });
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (e) {
      let errorMessage = "Login failed";
      if (e.response && e.response.data) {
        const detail = e.response.data.detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          errorMessage = detail.map((err) => err.msg).join(", ");
        }
      }
      throw new Error(errorMessage);
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await api.post("/auth/register", userData);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      return data;
    } catch (e) {
      let errorMessage = "Registration failed";
      if (e.response && e.response.data) {
        const detail = e.response.data.detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail) && detail.length > 0) {
          errorMessage = detail.map((err) => err.msg).join(", ");
        }
      }
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/login";
  };

  const updateProfile = async (profileData) => {
    try {
      setUser(profileData);
    } catch (error) {
      console.error("Update profile context error", error);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const { data } = await api.post("/auth/change-password", passwordData);
      return data;
    } catch (error) {
      console.error("Change password failed", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
