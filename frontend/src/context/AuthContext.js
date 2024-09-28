import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = React.useState(!isAuthenticated);

  // Check if the user is logged in when the app loads
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/admin/session");

        if (response.data?.status) setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/admin/login", {
        username,
        password,
      });
      if (response.data?.status) {
        setIsAuthenticated(true);
      }
    } catch (error) {
      throw new Error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    await axios.post("/api/admin/logout");
    setIsAuthenticated(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
