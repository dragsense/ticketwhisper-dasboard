import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd"; // Import the Spin component
import AuthContext from "../context/AuthContext"; 

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext); 

  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Spin size="large" tip="Loading..." />
    </div>
  );

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
