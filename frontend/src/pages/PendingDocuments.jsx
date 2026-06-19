import { useEffect, useState } from "react";
import { Eye, Download, PenLine, Mail, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const BACKEND_URL = "https://signflow-document-signature-app.onrender.com";

function PendingDocuments() {
  const [documents, setDocuments] = useState([]);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    const res = await API.get("/docs", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const pendingDocs = (res.data.documents || []).filter(
      (doc) => doc.status === "Pending"
    );

    setDocuments(pendingDocs);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleView = (doc) => {
    const filePath = doc.fileUrl.replaceAll("\\", "/");
    window.open(`${BACKEND_URL}/${filePath}`, "_blank");
  };

  const handleDownload = async (doc) => {
    const res = await fetch(`${BACKEND_URL}/api/docs/${doc._id}/download-original`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("Download failed");
      return;
    }

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

  const handleSign = (doc) => {
    navigate("/sign", { state: { document: doc } });
  };

  const handleInvite = async (doc) => {
    const email = prompt("Enter signer email:");
    if (!email) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/docs/${doc._id}/invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invite failed");
        return;
      }

      alert("Email invite sent successfully!");
    } catch (error) {
      console.error("Invite Error:", error);
      alert("Email invite failed");
    }
  };

  const totalSize = documents.reduce(
    (sum, doc) => sum + Math.round((doc.fileSize || 0) / 1024),
    0
  );

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar />

        <div className="pending-hero">
          <div>
            <h1>Pending Documents</h1>
            <p>Documents waiting for signature completion.</p>
          </div>

          <div className="pending-hero-icon">
            <Clock size={42} />
          </div>
        </div>

        <div className="rejected-summary-grid">
          <div className="rejected-summary-card">
            <span>Total Pending</span>
            <h2>{documents.length}</h2>
          </div>

          <div className="rejected-summary-card">
            <span>Total Size</span>
            <h2>{totalSize} KB</h2>
          </div>

          <div className="rejected-summary-card">
            <span>Status</span>
            <h2>Pending</h2>
          </div>
        </div>

        <div className="rejected-doc-grid">
          {documents.length === 0 ? (
            <div className="rejected-empty">No pending documents yet.</div>
          ) : (
            documents.map((doc) => (
              <div className="rejected-doc-card" key={doc._id}>
                <div className="rejected-doc-top">
                  <div className="rejected-pdf-badge">PDF</div>
                  <span className="status">Pending</span>
                </div>

                <h3>{doc.title}</h3>

                <p>
                  Uploaded on {new Date(doc.createdAt).toLocaleDateString()} ·{" "}
                  {Math.round(doc.fileSize / 1024)} KB
                </p>

                <div className="rejected-actions">
                  <button onClick={() => handleView(doc)}>
                    <Eye size={16} />
                    View
                  </button>

                  <button onClick={() => handleDownload(doc)}>
                    <Download size={16} />
                    Download
                  </button>

                  <button onClick={() => handleSign(doc)}>
                    <PenLine size={16} />
                    Sign
                  </button>

                  <button onClick={() => handleInvite(doc)}>
                    <Mail size={16} />
                    Invite
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

export default PendingDocuments;