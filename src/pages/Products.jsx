import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import "../styles/products.css";
import { FiEdit, FiTrash2, FiPlus, FiX, FiSearch, FiFilter } from "react-icons/fi";

// 🔹 Log Function
const addLog = async (action, details) => {
  await addDoc(collection(db, "logs"), {
    action,
    details,
    timestamp: serverTimestamp(),
  });
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    detail: "",
    category: "",
    price: "",
    stock: "",
  });
  const [editId, setEditId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // 🔐 Get logged-in user & role
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const role = user?.role;

  // 📌 Fetch Products
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const items = querySnapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
    setProducts(items);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const resetForm = () => {
    setForm({ name: "", detail: "", category: "", price: "", stock: "" });
  };

  // 📝 Add / Update Product
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editId) {
      const productRef = doc(db, "products", editId);
      const oldData = products.find((p) => p.id === editId);
      await updateDoc(productRef, form);
      await addLog("Update Product", `Updated ${oldData.name}`);
      setEditId(null);
    } else {
      await addDoc(collection(db, "products"), {
        ...form,
        createdAt: serverTimestamp(),
      });
      await addLog("Add Product", `Added ${form.name} | ${form.category}`);
    }

    resetForm();
    fetchProducts();
  };

  // 🛠 Edit Product
  const handleEdit = (product) => {
    setForm(product);
    setEditId(product.id);
  };

  // ❌ Cancel Update
  const handleCancelUpdate = () => {
    resetForm();
    setEditId(null);
  };

  // 🗑️ Delete Product → Admin Only
  const handleDelete = async (id, name) => {
    if (role !== "Admin") {
      alert("⛔ Only Admins can delete products!");
      return;
    }
    if (window.confirm(`Delete product "${name}"?`)) {
      await deleteDoc(doc(db, "products", id));
      await addLog("Delete Product", `Deleted ${name}`);
      fetchProducts();
    }
  };

  // 🔍 Filtering
  const categories = ["All", ...new Set(products.map((p) => p.category))];
  const filteredProducts = products
    .filter((p) => selectedCategory === "All" || p.category === selectedCategory)
    .filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="product-container">
      <header className="page-header">
        <h1>Product Management</h1>
      </header>

      {/* Add / Edit Form */}
      <div className="card">
        <h2>{editId ? "Edit Product" : "Add New Product"}</h2>
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <input type="text" placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input type="text" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            <textarea placeholder="Description" value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })} required />
          </div>

          <div className="form-actions">
            <button type="submit">{editId ? <><FiEdit /> Update Product</> : <><FiPlus /> Add Product</>}</button>
            {editId && <button type="button" onClick={handleCancelUpdate}><FiX /> Cancel</button>}
          </div>
        </form>
      </div>

      {/* Product Table */}
      <div className="card">
        <div className="table-header">
          <h2>Product Inventory</h2>
          <div className="filters">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {categories.filter((cat) => cat !== "All").map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <table className="product-table">
          <thead>
            <tr>
              <th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.name}<br /><small>{product.detail}</small></td>
                <td>{product.category}</td>
                <td>₱{parseFloat(product.price).toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>
                  <button onClick={() => handleEdit(product)}><FiEdit /></button>
                  {role === "Admin" && (
                    <button onClick={() => handleDelete(product.id, product.name)} className="danger">
                      <FiTrash2 />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
