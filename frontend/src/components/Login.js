import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Button } from "antd"; 
import { Ticket } from 'lucide-react'; 
import AuthContext from "../context/AuthContext"; 

const Login = () => {
  const { login } = useContext(AuthContext); 
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); 
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(""); 
    try {
      await login(username, password); 
      navigate("/"); 
    } catch (error) {
      setError("Invalid credentials"); 
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        {/* Header with Icon and Title */}
        <div className="flex items-center mb-6">
          <Ticket className="w-8 h-8 mr-2 text-purple-600" /> {/* Icon with styling */}
          <h1 className="text-2xl font-semibold text-purple-600">TicketWispher</h1>
        </div>

        <h2 className="text-xl font-bold mb-4">Login</h2>

        {/* Username Input */}
        <Input
          className="mb-4"
          size="large" 
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        {/* Password Input */}
        <Input
          className="mb-4"
          size="large" 
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Error Message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <Button
          type="primary"
          className="w-full"
          onClick={handleLogin} 
        >
          Login
        </Button>
      </div>
    </div>
  );
};

export default Login;
