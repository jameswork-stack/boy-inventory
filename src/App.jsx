import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Pointofsale from "./pages/Pos";
import Stocks from "./pages/Transactions";
import Logs from "./pages/Logs";
import Login from "./pages/Login";
import "./styles/layout.css";

const App = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const hideLayout = location.pathname === "/login";

  return (
    <div className={!hideLayout ? "app-layout" : ""}>
      {/* Sidebar (Show only when logged in and not on Login page) */}
      {!hideLayout && <Sidebar />}

      {/* Main content area */}
      <div className={!hideLayout ? "content-area" : ""}>
        {!hideLayout && <Navbar />}

        <div className="page-content">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={user ? <Dashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/products"
              element={user ? <Products /> : <Navigate to="/login" />}
            />
            <Route
              path="/pos"
              element={user ? <Pointofsale /> : <Navigate to="/login" />}
            />
            <Route
              path="/transactions"
              element={user ? <Stocks /> : <Navigate to="/login" />}
            />
            <Route
              path="/logs"
              element={user ? <Logs /> : <Navigate to="/login" />}
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;
