import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import jsPDF from "jspdf";
import "../styles/transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const user = JSON.parse(localStorage.getItem("loggedInUser")); // 👈 Get logged-in user

  const fetchTransactions = async () => {
    const querySnapshot = await getDocs(collection(db, "transactions"));
    const items = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      let transactionDate;
      if (data.timestamp?.toDate) {
        transactionDate = data.timestamp.toDate();
      } else if (data.date?.toDate) {
        transactionDate = data.date.toDate();
      } else if (data.date) {
        transactionDate = new Date(data.date);
      } else {
        transactionDate = new Date();
      }

      items.push({
        id: doc.id,
        ...data,
        date: transactionDate,
      });
    });

    items.sort((a, b) => b.date - a.date);
    setTransactions(items);
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // 🗑 Delete Receipt (Only Admin)
  const handleDeleteReceipt = async (id) => {
    if (user?.role !== "Admin") { // 👈 Fix: Correct role check
      alert("Only Admin can delete transactions!");
      return;
    }

    if (window.confirm("Are you sure you want to delete this receipt?")) {
      await deleteDoc(doc(db, "transactions", id));
      setTransactions((prev) => prev.filter((item) => item.id !== id));
      alert("Receipt deleted successfully!");
    }
  };

  // 📄 PDF Generator
  const generateReceiptPDF = async (transaction) => {
    const doc = new jsPDF();
    const logo = new Image();
    logo.src = "/images/logo.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 10, 10, 30, 30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Boy Paint Center Toledo", 105, 20, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text("Brgy. Poblacion, Toledo City, Cebu", 105, 28, { align: "center" });

      doc.line(10, 42, 200, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Sales Receipt", 105, 55, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Customer Name: ${transaction.customerName}`, 14, 70);
      doc.text(
        `Date: ${transaction.date ? transaction.date.toLocaleString() : "N/A"}`,
        14,
        78
      );

      let yPos = 95;
      doc.line(10, yPos - 5, 200, yPos - 5);

      doc.setFont("helvetica", "bold");
      doc.text("Item", 14, yPos);
      doc.text("Qty", 80, yPos);
      doc.text("Price", 120, yPos);
      doc.text("Total", 160, yPos);
      yPos += 8;

      doc.setFont("helvetica", "normal");
      transaction.items.forEach((item) => {
        doc.text(item.name || "N/A", 14, yPos);
        doc.text(String(item.qty || 0), 80, yPos);
        doc.text(`₱${Number(item.price).toFixed(0)}`, 120, yPos);
        doc.text(`₱${Number(item.total).toFixed(0)}`, 160, yPos);
        yPos += 8;
      });

      yPos += 12;
      doc.setFont("helvetica", "bold");
      doc.text(`Total Amount: ₱${Number(transaction.totalAmount).toFixed(0)}`, 14, yPos);

      doc.save(`Receipt_${transaction.id}.pdf`);
    };
  };

  return (
    <div className="transactions-container">
      <h2>Transactions</h2>

      {transactions.length > 0 ? (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Date</th>
              <th>Total (₱)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((trans) => (
              <tr key={trans.id}>
                <td>{trans.customerName}</td>
                <td>{trans.date ? trans.date.toLocaleString() : "N/A"}</td>
                <td>₱{Number(trans.totalAmount).toFixed(0)}</td>
                <td>
                  <button onClick={() => setSelectedReceipt(trans)} className="view-receipt-btn">
                    View
                  </button>
                  <button onClick={() => generateReceiptPDF(trans)} className="download-btn">
                    PDF
                  </button>

                  {/* Only Admin can see Delete button */}
                  {user?.role === "Admin" && (
                    <button
                      onClick={() => handleDeleteReceipt(trans.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No transactions found.</p>
      )}

      {/* Receipt Preview Modal */}
      {selectedReceipt && (
        <div className="receipt-modal">
          <div className="receipt-modal-content">
            <h3>Receipt Preview</h3>
            <p><strong>Customer:</strong> {selectedReceipt.customerName}</p>
            <p><strong>Date:</strong> {selectedReceipt.date.toLocaleString()}</p>

            <table className="receipt-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedReceipt.items.map((item, index) => (
                  <tr key={index}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>₱{item.price}</td>
                    <td>₱{item.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h4>Total Amount: ₱{selectedReceipt.totalAmount}</h4>

            <div className="modal-actions">
              <button onClick={() => generateReceiptPDF(selectedReceipt)} className="download-btn">
                Download PDF
              </button>
              <button onClick={() => setSelectedReceipt(null)} className="close-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
