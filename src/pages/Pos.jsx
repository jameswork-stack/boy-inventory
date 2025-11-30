import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import "../styles/pos.css";
import { FaShoppingCart, FaSearch, FaTimes, FaPlus, FaMinus } from "react-icons/fa";

// 🔹 Log Function with Firestore timestamp
const addLog = async (action, details) => {
  await addDoc(collection(db, "logs"), {
    action,
    details,
    timestamp: serverTimestamp(), // 🔥 Firestore Timestamp
  });
};

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Fetch Products
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const items = [];
    querySnapshot.forEach((docItem) => {
      items.push({ id: docItem.id, ...docItem.data() });
    });
    setProducts(items);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Add to Cart
  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter((item) => item.id !== id));

  const updateQuantity = (id, qty) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, qty: Number(qty) } : item
      )
    );
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.qty * Number(item.price),
    0
  );

  // 🔹 Save Sale Transaction
  const handleSale = async () => {
    if (!customerName.trim()) {
      alert("Please enter customer name.");
      return;
    }

    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const transactionData = {
      customerName,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        total: item.qty * Number(item.price),
      })),
      totalAmount,
      timestamp: serverTimestamp(), // 🔥 Firestore Timestamp
    };

    // Save transaction
    await addDoc(collection(db, "transactions"), transactionData);
    await addLog("SALE", `Sold items to ${customerName} | Total ₱${totalAmount}`);

    // 🔄 Update stock
    for (const item of cart) {
      const productRef = doc(db, "products", item.id);
      await updateDoc(productRef, {
        stock: Number(item.stock) - item.qty,
      });

      await addLog(
        "STOCK_UPDATE",
        `Stock updated for ${item.name}: -${item.qty} units`
      );
    }

    alert("Transaction saved successfully!");
    setCart([]);
    setCustomerName("");
    fetchProducts();
  };

  // 🔍 Filtering Logic
  const categories = ["All", ...new Set(products.map((p) => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="pos-container">
      <h2>Point of Sale System</h2>

      {/* Customer Info Section */}
      <div className="customer-info">
        <label>Customer Information</label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Enter customer name"
          required
        />
      </div>

      <div className="pos-layout">
        {/* Products Section */}
        <div className="product-list">
          {/* Search & Filter */}
          <div className="filter-section">
            <div className="search-box">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search" 
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map((category, i) => (
                <option key={i} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-info">
                    <h4>{product.name}</h4>
                    <div className="product-details">
                      <span className="price">₱{Number(product.price).toFixed(2)}</span><br></br>
                      <span className={`stock ${product.stock <= 0 ? 'out-of-stock' : ''}`}>
                        {product.stock <= 0 ? 'Out of Stock' : `${product.stock} in stock`}
                      </span>
                    </div>
                    <p className="category">{product.category}</p>
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    disabled={product.stock <= 0}
                    className="add-to-cart-btn"
                  >
                    <FaShoppingCart /> Add to Cart
                  </button>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No products found matching your search.</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="cart-section">
          <h3>
            <FaShoppingCart /> Cart
          </h3>
          
          {cart.length === 0 ? (
            <div className="empty-state">
              <p>Your cart is empty</p>
              <p>Add products to get started</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => (
                      <tr key={item.id}>
                        <td className="item-name">{item.name}</td>
                        <td className="item-qty">
                          <div className="quantity-controls">
                            <button 
                              onClick={() => updateQuantity(item.id, Math.max(1, item.qty - 1))}
                              className="qty-btn"
                            >
                              <FaMinus size={10} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={item.stock + item.qty}
                              value={item.qty}
                              onChange={(e) => updateQuantity(item.id, Math.min(Number(e.target.value), item.stock + item.qty))}
                            />
                            <button 
                              onClick={() => updateQuantity(item.id, item.qty + 1)}
                              className="qty-btn"
                              disabled={item.qty >= (item.stock + item.qty)}
                            >
                              <FaPlus size={10} />
                            </button>
                          </div>
                        </td>
                        <td className="item-price">₱{Number(item.price).toFixed(2)}</td>
                        <td className="item-total">₱{(item.qty * Number(item.price)).toFixed(2)}</td>
                        <td className="item-remove">
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="remove-btn"
                            title="Remove item"
                          >
                            <FaTimes />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="cart-summary">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₱{totalAmount.toFixed(2)}</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total</span>
                  <span>₱{totalAmount.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handleSale} 
                  className="invoice-btn"
                  disabled={cart.length === 0 || !customerName.trim()}
                >
                  Complete Sale
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default POS;
