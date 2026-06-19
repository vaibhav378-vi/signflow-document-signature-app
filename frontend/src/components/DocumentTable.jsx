import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Download,
  PenLine,
  Trash2,
  Search,
  Share2,
  Mail,
  XCircle,
} from "lucide-react";

const BACKEND_URL = "https://signflow-document-signature-app.onrender.com";

function DocumentTable({ documents, onDelete }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const getViewPath = (doc) => {
    const filePath =
      doc.status === "Signed" && doc.signedFileUrl
        ? doc.signedFileUrl
        : doc.fileUrl;

    return filePath.replaceAll("\\", "/");
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSearch = doc.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter = filter === "All" || doc.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [documents, search, filter]);

  const handleView = (doc) => {
    window.open(`${BACKEND_URL}/${getViewPath(doc)}`, "_blank");
  };

  const handleDownload = async (doc) => {
    try {
      const url =
        doc.status === "Signed" && doc.signedFileUrl
          ? `${BACKEND_URL}/api/docs/${doc._id}/download-signed`
          : `${BACKEND_URL}/api/docs/${doc._id}/download-original`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        alert("Download failed");
        return;
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download =
        doc.status === "Signed" && doc.signedFileName
          ? doc.signedFileName
          : doc.fileName;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download Error:", error);
      alert("Download failed. Check console.");
    }
  };

  const handleSign = (doc) => {
    navigate("/sign", { state: { document: doc } });
  };

  const handleShare = async (doc) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/docs/${doc._id}/share`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to generate share link");
        return;
      }

      try {
        await navigator.clipboard.writeText(data.shareUrl);
        alert("Public signing link copied!");
      } catch {
        alert(`Public signing link:\n${data.shareUrl}`);
      }
    } catch (error) {
      console.error("Share Error:", error);
      alert("Share failed. Check console.");
    }
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

      console.log("Invite Response:", data);

      if (!res.ok) {
        alert(data.message || "Invite failed");
        return;
      }

      alert("Email sent successfully!");
    } catch (error) {
      console.error("Invite Error:", error);
      alert("Email invite failed. Check console.");
    }
  };

  const handleReject = async (doc) => {
    const reason = prompt("Enter reject reason:");

    if (!reason) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/docs/${doc._id}/reject`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Reject failed");
        return;
      }

      alert("Document rejected successfully");
      window.location.reload();
    } catch (error) {
      console.error("Reject Error:", error);
      alert("Reject failed. Check console.");
    }
  };

  return (
    <div className="table-card">
      <div className="document-toolbar">
        <div className="document-tabs">
          {["All", "Pending", "Signed", "Rejected"].map((tab) => (
            <button
              key={tab}
              className={filter === tab ? "tab-active" : ""}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="document-tools">
          <div className="document-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Signed">Signed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="table-header">
        <h3>Recent Documents</h3>
        <span>{filteredDocuments.length} documents</span>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>Status</th>
              <th>Size</th>
              <th>Uploaded</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-cell">
                  No matching documents found
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc) => (
                <tr key={doc._id}>
                  <td className="doc-title">
                    <div className="doc-name">
                      <span className="pdf-badge">PDF</span>
                      <div>
                        <strong>{doc.title}</strong>
                        <small>
                          Uploaded on{" "}
                          {new Date(doc.createdAt).toLocaleDateString()} ·{" "}
                          {Math.round(doc.fileSize / 1024)} KB
                        </small>

                        {doc.status === "Rejected" && doc.rejectReason && (
                          <small className="reject-reason">
                            Reason: {doc.rejectReason}
                          </small>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <span
                      className={`status ${
                        doc.status === "Signed"
                          ? "signed-status"
                          : doc.status === "Rejected"
                          ? "rejected-status"
                          : ""
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>

                  <td>{Math.round(doc.fileSize / 1024)} KB</td>

                  <td>{new Date(doc.createdAt).toLocaleDateString()}</td>

                  <td className="action-buttons">
                    <button onClick={() => handleView(doc)} title="View">
                      <Eye size={16} />
                    </button>

                    <button onClick={() => handleDownload(doc)} title="Download">
                      <Download size={16} />
                    </button>

                    {doc.status === "Pending" && (
                      <>
                        <button
                          className="sign-btn"
                          onClick={() => handleSign(doc)}
                          title="Sign"
                        >
                          <PenLine size={16} />
                        </button>

                        <button
                          className="reject-btn"
                          onClick={() => handleReject(doc)}
                          title="Reject"
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}

                    <button onClick={() => handleShare(doc)} title="Copy Link">
                      <Share2 size={16} />
                    </button>

                    <button onClick={() => handleInvite(doc)} title="Email Invite">
                      <Mail size={16} />
                    </button>

                    <button
                      className="danger-btn"
                      onClick={() => onDelete(doc._id)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DocumentTable;