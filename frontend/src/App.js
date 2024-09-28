import React, { useContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Adjust path as necessary
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import Dashboard from "./components/Dashboard";
import WebsitesList from "./components/WebsitesList";
import ScrapeData from "./components/ScrapeData";
import UsersManagement from "./components/UsersManagement";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";

import AuthContext from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <MainContent />
      </Router>
    </AuthProvider>
  );
}

function MainContent() {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className="App bg-purple-100">
      {isAuthenticated && <Navbar />}

      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/websites"
          element={
            <ProtectedRoute>
              <WebsitesList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scrape"
          element={
            <ProtectedRoute>
              <ScrapeData />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <UsersManagement />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
