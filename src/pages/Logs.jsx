import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/logs.css";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  const fetchLogs = async () => {
    const querySnapshot = await getDocs(collection(db, "logs"));
    const logsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setLogs(logsData);
  };

  const handleDelete = async (id) => {
    if (user?.role !== "Admin") {
      alert("⛔ Only Admin can delete logs!");
      return;
    }
    if (window.confirm("Are you sure you want to delete this log?")) {
      await deleteDoc(doc(db, "logs", id));
      fetchLogs();
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="logs-container">
      <h2>📜 Activity Logs</h2>

      {logs.length === 0 ? (
        <p>No logs available.</p>
      ) : (
        <div className="logs-list">
          {logs.map((log) => (
            <div className="log-card" key={log.id}>
              <div className="log-header">
                <strong>🔹 {log.action}</strong>
                {user?.role === "Admin" && (
                  <button className="delete-log-btn" onClick={() => handleDelete(log.id)}>
                    🗑 Delete
                  </button>
                )}
              </div>

              <p><strong>📝 Details:</strong> {log.details}</p>
              <p><strong>📅 Date:</strong> {log.timestamp?.toDate().toLocaleString() || "No Date"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Logs;
