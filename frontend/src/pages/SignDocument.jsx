import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const PREVIEW_WIDTH = 700;
const PREVIEW_HEIGHT = 850;
const MARKER_WIDTH = 160;
const MARKER_HEIGHT = 70;

function SignDocument() {
  const sigRef = useRef(null);
  const boxRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const selectedDocument = location.state?.document;

  const [x, setX] = useState(100);
  const [y, setY] = useState(100);
  const [page, setPage] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const startDrag = () => setDragging(true);
  const stopDrag = () => setDragging(false);

  const handleMouseMove = (e) => {
    if (!dragging || !boxRef.current) return;

    const rect = boxRef.current.getBoundingClientRect();

    let newX = e.clientX - rect.left - MARKER_WIDTH / 2;
    let newY = e.clientY - rect.top - MARKER_HEIGHT / 2;

    newX = Math.max(0, Math.min(newX, PREVIEW_WIDTH - MARKER_WIDTH));
    newY = Math.max(0, Math.min(newY, PREVIEW_HEIGHT - MARKER_HEIGHT));

    setX(Math.round(newX));
    setY(Math.round(newY));
  };

  const clearSignature = () => {
    sigRef.current.clear();
  };

  const saveSignature = async () => {
    if (!selectedDocument) {
      setMessage("Document not found");
      return;
    }

    if (sigRef.current.isEmpty()) {
      setMessage("Please draw your signature first");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const signatureImage = sigRef.current.toDataURL("image/png");

      await API.post(
        "/signatures/sign",
        {
          documentId: selectedDocument._id,
          signatureImage,
          x,
          y,
          page,
          previewWidth: PREVIEW_WIDTH,
          previewHeight: PREVIEW_HEIGHT,
          markerWidth: MARKER_WIDTH,
          markerHeight: MARKER_HEIGHT,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Document signed successfully");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Signing failed");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedDocument) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Navbar />
          <div className="table-card">
            <h3>No document selected</h3>
            <p>Go back to dashboard and click Sign.</p>
          </div>
        </main>
      </div>
    );
  }

  const filePath = selectedDocument.fileUrl.replaceAll("\\", "/");

  return (
    <div className="app-layout" onMouseUp={stopDrag}>
      <Sidebar />

      <main className="main-content">
        <Navbar />

        <div className="sign-layout">
          <div className="pdf-preview-card">
            <h3>{selectedDocument.title}</h3>

            <div
              ref={boxRef}
              className="pdf-sign-box"
              onMouseMove={handleMouseMove}
            >
              <iframe
                title="PDF Preview"
                src={`http://localhost:5000/${filePath}`}
                className="pdf-frame-sign"
              />

              <div
                className="sign-placeholder"
                onMouseDown={startDrag}
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  width: `${MARKER_WIDTH}px`,
                  height: `${MARKER_HEIGHT}px`,
                }}
              >
                Sign Here
              </div>
            </div>
          </div>

          <div className="signature-card">
            <h3>Draw Signature</h3>
            <p>Drag the “Sign Here” box on PDF, then draw signature.</p>

            <div className="position-grid">
              <label>
                X Position
                <input
                  type="number"
                  value={x}
                  onChange={(e) => setX(Number(e.target.value))}
                />
              </label>

              <label>
                Y Position
                <input
                  type="number"
                  value={y}
                  onChange={(e) => setY(Number(e.target.value))}
                />
              </label>

              <label>
                Page
                <input
                  type="number"
                  value={page}
                  min="1"
                  onChange={(e) => setPage(Number(e.target.value))}
                />
              </label>
            </div>

            <div className="signature-box">
              <SignatureCanvas
                ref={sigRef}
                penColor="black"
                canvasProps={{
                  width: 420,
                  height: 200,
                  className: "signature-canvas",
                }}
              />
            </div>

            {message && <div className="upload-message">{message}</div>}

            <div className="signature-actions">
              <button type="button" onClick={clearSignature}>
                Clear
              </button>

              <button type="button" onClick={saveSignature} disabled={loading}>
                {loading ? "Signing..." : "Save Signature"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SignDocument;