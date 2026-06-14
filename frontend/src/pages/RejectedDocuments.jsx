import { useEffect, useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DocumentTable from "../components/DocumentTable";

function RejectedDocuments() {
  const [documents, setDocuments] = useState([]);

  const fetchDocuments = async () => {
    const token = localStorage.getItem("token");

    const res = await API.get("/docs", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const rejectedDocs = (res.data.documents || []).filter(
      (doc) => doc.status === "Rejected"
    );

    setDocuments(rejectedDocs);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar />

        <div className="dashboard-heading">
          <h1>Rejected Documents</h1>
          <p>Documents rejected with reasons and status history.</p>
        </div>

        <DocumentTable documents={documents} onDelete={fetchDocuments} />
      </main>
    </div>
  );
}

export default RejectedDocuments;