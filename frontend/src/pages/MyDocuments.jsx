import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  FolderOpen,
} from "lucide-react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DocumentTable from "../components/DocumentTable";

function MyDocuments() {
  const [documents, setDocuments] = useState([]);

  const fetchDocuments = async () => {
    const token = localStorage.getItem("token");

    const res = await API.get("/docs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDocuments(res.data.documents || []);
  };

  const deleteDocument = async (id) => {
    const confirmDelete = window.confirm("Delete this document?");
    if (!confirmDelete) return;

    const token = localStorage.getItem("token");

    await API.delete(`/docs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchDocuments();
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const total = documents.length;
  const pending = documents.filter((d) => d.status === "Pending").length;
  const signed = documents.filter((d) => d.status === "Signed").length;
  const rejected = documents.filter((d) => d.status === "Rejected").length;

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar />

        <div className="mydocs-hero">
          <div>
            <h1>My Documents</h1>
            <p>Search, filter, sign, share, and manage all uploaded documents.</p>
          </div>

          <div className="mydocs-hero-icon">
            <FolderOpen size={42} />
          </div>
        </div>

        <div className="mydocs-summary-grid">
          <div className="mydocs-summary-card">
            <div className="mydocs-icon purple">
              <FileText size={24} />
            </div>
            <span>Total</span>
            <h2>{total}</h2>
          </div>

          <div className="mydocs-summary-card">
            <div className="mydocs-icon orange">
              <Clock size={24} />
            </div>
            <span>Pending</span>
            <h2>{pending}</h2>
          </div>

          <div className="mydocs-summary-card">
            <div className="mydocs-icon green">
              <CheckCircle size={24} />
            </div>
            <span>Signed</span>
            <h2>{signed}</h2>
          </div>

          <div className="mydocs-summary-card">
            <div className="mydocs-icon red">
              <XCircle size={24} />
            </div>
            <span>Rejected</span>
            <h2>{rejected}</h2>
          </div>
        </div>

        <DocumentTable documents={documents} onDelete={deleteDocument} />
      </main>
    </div>
  );
}

export default MyDocuments;