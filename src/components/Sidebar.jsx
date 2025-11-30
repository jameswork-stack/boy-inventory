import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/layout.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const handleLogout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <ul>
        <li><NavLink to="/" end>Dashboard</NavLink></li>
        <li><NavLink to="/products">Products</NavLink></li>
        <li><NavLink to="/pos">Point of Sale</NavLink></li>
        <li><NavLink to="/transactions">Transactions</NavLink></li>
        <li><NavLink to="/logs">Logs</NavLink></li>
      </ul>

      {/* 👤 User Info Section */}
      {user && (
        <div className="user-info">
          <p><strong>{user.username}</strong></p>
          <p className="role-label">{user.role.toUpperCase()}</p>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
