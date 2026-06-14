import { useState } from "react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function UploadDocument() {
  const [title, setTitle] = useState("");
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!pdf) {
      setMessage("Please select a PDF file");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("pdf", pdf);

      const res = await API.post("/docs/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(res.data.message);
      setTitle("");
      setPdf(null);

      document.getElementById("pdfInput").value = "";
    } catch (error) {
      setMessage(error.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <Navbar />

        <div className="upload-wrapper">
          <div className="upload-box">
            <h2>Upload New Document</h2>
            <p>Select a PDF file and upload it for signing.</p>

            <form onSubmit={handleUpload}>
              <label>Document Title</label>

              <input
                type="text"
                placeholder="Enter document title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <label>Select PDF</label>

              <input
                id="pdfInput"
                type="file"
                accept="application/pdf"
                onChange={(e) => setPdf(e.target.files[0])}
              />

              <button type="submit">
                {loading ? "Uploading..." : "Upload Document"}
              </button>
            </form>

            {message && (
              <div className="upload-message">
                {message}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default UploadDocument;