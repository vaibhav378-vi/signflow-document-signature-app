import { useEffect, useState } from "react";
import {
  Activity,
  Upload,
  Eye,
  Download,
  PenLine,
  Trash2,
  Share2,
  Mail,
  XCircle,
  Clock,
} from "lucide-react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState("all");

  const token = localStorage.getItem("token");

  const fetchLogs = async (docId = "all") => {
    const url = docId === "all" ? "/audit" : `/audit/${docId}`;

    const res = await API.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setLogs(res.data.logs || []);
  };

  const fetchDocuments = async () => {
    const res = await API.get("/docs", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setDocuments(res.data.documents || []);
  };

  useEffect(() => {
    fetchDocuments();
    fetchLogs();
  }, []);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setSelectedDoc(value);
    fetchLogs(value);
  };

  const getIcon = (action) => {
    if (action.includes("UPLOAD")) return <Upload size={18} />;
    if (action.includes("VIEW")) return <Eye size={18} />;
    if (action.includes("DOWNLOAD")) return <Download size={18} />;
    if (action.includes("SIGN")) return <PenLine size={18} />;
    if (action.includes("DELETE")) return <Trash2 size={18} />;
    if (action.includes("SHARE")) return <Share2 size={18} />;
    if (action.includes("EMAIL")) return <Mail size={18} />;
    if (action.includes("REJECT")) return <XCircle size={18} />;
    return <Activity size={18} />;
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar />

        <div className="audit-hero">
          <div>
            <h1>Audit Timeline</h1>
            <p>
              Track who performed each action, when it happened, and from which
              IP address.
            </p>
          </div>

          <div className="audit-hero-icon">
            <Activity size={42} />
          </div>
        </div>

        <div className="audit-controls">
          <div>
            <label>Filter by Document</label>
            <select value={selectedDoc} onChange={handleFilterChange}>
              <option value="all">All Documents</option>
              {documents.map((doc) => (
                <option key={doc._id} value={doc._id}>
                  {doc.title}
                </option>
              ))}
            </select>
          </div>

          <div className="audit-count">
            <Clock size={18} />
            {logs.length} audit records
          </div>
        </div>

        <div className="audit-timeline">
          {logs.length === 0 ? (
            <div className="audit-empty">No audit logs found.</div>
          ) : (
            logs.map((log) => (
              <div className="audit-item" key={log._id}>
                <div className="audit-icon">{getIcon(log.action)}</div>

                <div className="audit-content">
                  <div className="audit-top">
                    <h3>{log.action.replaceAll("_", " ")}</h3>
                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                  </div>

                  <p>{log.message}</p>

                  <div className="audit-meta">
                    <span>Document: {log.document?.title || "N/A"}</span>
                    <span>Status: {log.document?.status || "N/A"}</span>
                    <span>IP: {log.ipAddress || "Unknown"}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default AuditLogs;