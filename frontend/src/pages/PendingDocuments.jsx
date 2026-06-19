import { useEffect, useState } from "react";
import { Eye, Download, RotateCcw, XCircle } from "lucide-react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function RejectedDocuments() {
  const [documents, setDocuments] = useState([]);
  const token = localStorage.getItem("token");

  const fetchDocuments = async () => {
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

  const handleView = (doc) => {
    const filePath = doc.fileUrl.replaceAll("\\", "/");
    window.open(`https://signflow-document-signature-app.onrender.com/${filePath}`, "_blank");
  };

  const handleDownload = async (doc) => {
    const res = await fetch(
      `https://signflow-document-signature-app.onrender.com/api/docs/${doc._id}/download-original`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = doc.fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  const totalSize = documents.reduce(
    (sum, doc) => sum + Math.round((doc.fileSize || 0) / 1024),
    0
  );

  const lastRejected =
    documents.length > 0
      ? new Date(documents[0].rejectedAt || documents[0].updatedAt).toLocaleDateString()
      : "N/A";

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar />

        <div className="rejected-hero">
          <div>
            <h1>Rejected Documents</h1>
            <p>Documents that were declined with rejection reasons.</p>
          </div>

          <div className="rejected-hero-icon">
            <XCircle size={42} />
          </div>
        </div>

        <div className="rejected-summary-grid">
          <div className="rejected-summary-card">
            <span>Total Rejected</span>
            <h2>{documents.length}</h2>
          </div>

          <div className="rejected-summary-card">
            <span>Total Size</span>
            <h2>{totalSize} KB</h2>
          </div>

          <div className="rejected-summary-card">
            <span>Last Rejected</span>
            <h2>{lastRejected}</h2>
          </div>
        </div>

        <div className="rejected-doc-grid">
          {documents.length === 0 ? (
            <div className="rejected-empty">No rejected documents yet.</div>
          ) : (
            documents.map((doc) => (
              <div className="rejected-doc-card" key={doc._id}>
                <div className="rejected-doc-top">
                  <div className="rejected-pdf-badge">PDF</div>
                  <span className="rejected-badge">Rejected</span>
                </div>

                <h3>{doc.title}</h3>

                <p>
                  Rejected on{" "}
                  {new Date(doc.rejectedAt || doc.updatedAt).toLocaleDateString()} ·{" "}
                  {Math.round(doc.fileSize / 1024)} KB
                </p>

                <div className="rejected-reason-box">
                  <strong>Reason</strong>
                  <span>{doc.rejectReason || "No reason provided"}</span>
                </div>

                <div className="rejected-actions">
                  <button onClick={() => handleView(doc)}>
                    <Eye size={16} />
                    View
                  </button>

                  <button onClick={() => handleDownload(doc)}>
                    <Download size={16} />
                    Download
                  </button>

                  <button onClick={() => alert("Re-upload or edit flow can be added next.")}>
                    <RotateCcw size={16} />
                    Re-submit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default RejectedDocuments;