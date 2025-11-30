import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import logo from "/images/logo.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const accounts = [
    { username: "admin@inventory.com", password: "admin123", role: "Admin" },
    { username: "staff@inventory.com", password: "staff123", role: "Staff" },
  ];

  const handleLogin = (e) => {
    e.preventDefault();

    const user = accounts.find(
      (acc) => acc.username === username && acc.password === password
    );

    if (user) {
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      navigate("/");
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="logo" style={{ width: "180px" }} />
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to access inventory dashboard</p>

        {error && <p className="login-error">{error}</p>}

        <form className="login-form" onSubmit={handleLogin}>
          <input
            type="text"
            className="login-input"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
