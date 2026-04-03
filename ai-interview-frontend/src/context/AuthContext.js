import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Ensure axios uses the API base URL for all requests (even without a token)
axios.defaults.baseURL = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      axios.defaults.baseURL = API_URL;
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      delete axios.defaults.headers.common["Authorization"];
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("/auth/profile");
      setUser(response.data.user);
    } catch (error) {
      console.error(
        "Error fetching profile:",
        error?.response || error.message || error,
      );
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Login failed";
      console.error("Login error:", error?.response || error?.message || error);
      return {
        success: false,
        message,
      };
    }
  };

  const register = async (
    name,
    email,
    password,
    targetRole,
    experienceLevel,
  ) => {
    try {
      // Validation
      if (!name || !email || !password) {
        return {
          success: false,
          message: "Name, email, and password are required",
        };
      }

      if (password.length < 6) {
        return {
          success: false,
          message: "Password must be at least 6 characters",
        };
      }

      const response = await axios.post("/auth/register", {
        name,
        email,
        password,
        targetRole,
        experienceLevel,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      const message =
        error.response?.data?.message || error.message || "Registration failed";
      console.error(
        "Registration error:",
        error?.response || error?.message || error,
      );
      return {
        success: false,
        message: message,
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put("/auth/profile", profileData);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Update failed",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
