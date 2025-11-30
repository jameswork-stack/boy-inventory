import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/dashboard.css";
import {
  FiPackage,
  FiAlertTriangle,
  FiDollarSign,
  FiTrendingUp,
  FiRefreshCw,
} from "react-icons/fi";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);

  // Revenue States
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);

  // Selected time filter (daily, weekly, monthly, total)
  const [selectedPeriod, setSelectedPeriod] = useState("daily");

  // Color Palette
  const COLORS = [
    "#FF5733",
    "#33B5FF",
    "#33FF57",
    "#FF33A8",
    "#FFC300",
    "#8E44AD",
    "#FF8C00",
    "#2ECC71",
    "#3498DB",
    "#E74C3C",
  ];

  // 📦 Fetch Products
  const fetchProductsData = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });

    setProducts(items);
    setTotalProducts(items.length);

    const lowStock = items.filter((product) => Number(product.stock) < 5);
    setLowStockCount(lowStock.length);
  };

  // 💰 Fetch Revenue
  const fetchRevenueData = async () => {
    const transSnap = await getDocs(collection(db, "transactions"));
    let total = 0,
      daily = 0,
      weekly = 0,
      monthly = 0;

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    transSnap.forEach((doc) => {
      const data = doc.data();
      const amount = Number(data.totalAmount || 0);
      const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : null;

      if (timestamp) {
        total += amount;

        if (timestamp.toDateString() === today.toDateString()) daily += amount;
        if (timestamp >= startOfWeek) weekly += amount;
        if (timestamp >= startOfMonth) monthly += amount;
      }
    });

    setTotalRevenue(total.toFixed(2));
    setDailyRevenue(daily.toFixed(2));
    setWeeklyRevenue(weekly.toFixed(2));
    setMonthlyRevenue(monthly.toFixed(2));
  };

  // Load Data
  useEffect(() => {
    fetchProductsData();
    fetchRevenueData();
  }, []);

  // 📌 Select value based on dropdown
  const getDisplayedRevenue = () => {
    switch (selectedPeriod) {
      case "daily":
        return dailyRevenue;
      case "weekly":
        return weeklyRevenue;
      case "monthly":
        return monthlyRevenue;
      default:
        return totalRevenue;
    }
  };

  const formatNumber = (num) => {
    return Number(num).toLocaleString();
  };

  const topProducts = [...products]
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 5);

  return (
    <div className="dashboard-container">
      <header className="page-header">
        <h1>Dashboard Overview</h1>
        <p>Key metrics and insights for your paint inventory</p>
      </header>

      {/* Summary Cards */}
      <div className="dashboard-grid">

        {/* Total Products */}
        <div className="card">
          <div className="card-header">
            <FiPackage className="card-icon" />
            <h3>Total Products</h3>
          </div>
          <div className="card-content">
            <span className="card-value">{formatNumber(totalProducts)}</span>
            <span className="card-label">Products in stock</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card alert">
          <div className="card-header">
            <FiAlertTriangle className="card-icon" />
            <h3>Low Stock Alerts</h3>
          </div>
          <div className="card-content">
            <span className="card-value">{formatNumber(lowStockCount)}</span>
            <span className="card-label">Items need restocking</span>
          </div>
        </div>

        {/* Single Revenue Card with Dropdown */}
        <div className="card revenue">
          <div className="card-header">
            <FiDollarSign className="card-icon" />
            <h3>Revenue</h3>

            <select
              className="period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="daily">Today</option>
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="total">Lifetime</option>
            </select>
          </div>

          <div className="card-content">
            <span className="card-value">
              ₱{formatNumber(getDisplayedRevenue())}
            </span>
            <span className="card-label">
              {selectedPeriod === "daily"
                ? "Today's Sales"
                : selectedPeriod === "weekly"
                ? "Weekly Sales"
                : selectedPeriod === "monthly"
                ? "Monthly Sales"
                : "Lifetime Sales"}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts">
        <div className="card chart-card">
          <div className="card-header">
            <h3>Stock Levels Overview</h3>
            <div className="chart-actions">
              <button className="btn-icon" title="Refresh data">
                <FiRefreshCw size={16} />
              </button>
            </div>
          </div>
          <div className="chart-container">
            {products.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={topProducts}
                  margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stock" name="Stock Level">
                    {topProducts.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div>No data available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
