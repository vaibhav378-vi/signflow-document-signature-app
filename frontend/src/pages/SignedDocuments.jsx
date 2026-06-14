import { useEffect, useState } from "react";
import { Eye, Download, Share2, CheckCircle } from "lucide-react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function SignedDocuments() {
  const [documents, setDocuments] = useState([]);
  const token = localStorage.getItem("token");

  const fetchDocuments = async () => {
    const res = await API.get("/docs", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const signedDocs = (res.data.documents || []).filter(
      (doc) => doc.status === "Signed"
    );

    setDocuments(signedDocs);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleView = (doc) => {
    const filePath = (doc.signedFileUrl || doc.fileUrl).replaceAll("\\", "/");
    window.open(`http://localhost:5000/${filePath}`, "_blank");
  };

  const handleDownload = async (doc) => {
    const res = await fetch(
      `http://localhost:5000/api/docs/${doc._id}/download-signed`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = doc.signedFileName || `signed-${doc.fileName}`;
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  };

  const handleShare = async (doc) => {
    const res = await fetch(`http://localhost:5000/api/docs/${doc._id}/share`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Share failed");
      return;
    }

    await navigator.clipboard.writeText(data.shareUrl);
    alert("Signed document share link copied!");
  };

  const totalSize = documents.reduce(
    (sum, doc) => sum + Math.round((doc.fileSize || 0) / 1024),
    0
  );

  const lastSigned =
    documents.length > 0
      ? new Date(documents[0].updatedAt).toLocaleDateString()
      : "N/A";

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar />

        <div className="signed-hero">
          <div>
            <h1>Signed Documents</h1>
            <p>All completed and legally signed PDFs in one place.</p>
          </div>

          <div className="signed-hero-icon">
            <CheckCircle size={42} />
          </div>
        </div>

        <div className="signed-summary-grid">
          <div className="signed-summary-card">
            <span>Total Signed</span>
            <h2>{documents.length}</h2>
          </div>

          <div className="signed-summary-card">
            <span>Total Size</span>
            <h2>{totalSize} KB</h2>
          </div>

          <div className="signed-summary-card">
            <span>Last Signed</span>
            <h2>{lastSigned}</h2>
          </div>
        </div>

        <div className="signed-doc-grid">
          {documents.length === 0 ? (
            <div className="signed-empty">No signed documents yet.</div>
          ) : (
            documents.map((doc) => (
              <div className="signed-doc-card" key={doc._id}>
                <div className="signed-doc-top">
                  <div className="signed-pdf-badge">PDF</div>
                  <span className="signed-badge">Signed</span>
                </div>

                <h3>{doc.title}</h3>

                <p>
                  Signed on {new Date(doc.updatedAt).toLocaleDateString()} ·{" "}
                  {Math.round(doc.fileSize / 1024)} KB
                </p>

                <div className="signed-actions">
                  <button onClick={() => handleView(doc)}>
                    <Eye size={16} />
                    View
                  </button>

                  <button onClick={() => handleDownload(doc)}>
                    <Download size={16} />
                    Download
                  </button>

                  <button onClick={() => handleShare(doc)}>
                    <Share2 size={16} />
                    Share
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

export default SignedDocuments;