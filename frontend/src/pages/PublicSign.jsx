import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import SignatureCanvas from "react-signature-canvas";
import API from "../api/axios";

const BACKEND_URL =
  "https://signflow-document-signature-app.onrender.com";

const PREVIEW_WIDTH = 700;
const PREVIEW_HEIGHT = 720;
const MARKER_WIDTH = 160;
const MARKER_HEIGHT = 70;

function PublicSign() {
  const { token } = useParams();
  const sigRef = useRef(null);
  const boxRef = useRef(null);

  const [document, setDocument] = useState(null);
  const [message, setMessage] = useState("Loading document...");
  const [signerName, setSignerName] = useState("");
  const [x, setX] = useState(100);
  const [y, setY] = useState(100);
  const [page, setPage] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPublicDocument();
  }, []);

  const fetchPublicDocument = async () => {
    try {
      const res = await API.get(`/docs/public/${token}`);
      setDocument(res.data.document);
      setMessage("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Invalid public link");
    }
  };

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

  const savePublicSignature = async () => {
    if (!signerName.trim()) {
      setMessage("Please enter your name");
      return;
    }

    if (sigRef.current.isEmpty()) {
      setMessage("Please draw your signature");
      return;
    }

    try {
      setLoading(true);

      const signatureImage = sigRef.current.toDataURL("image/png");

      const res = await API.post("/signatures/public-sign", {
        token,
        signerName,
        signatureImage,
        x,
        y,
        page,
        previewWidth: PREVIEW_WIDTH,
        previewHeight: PREVIEW_HEIGHT,
        markerWidth: MARKER_WIDTH,
        markerHeight: MARKER_HEIGHT,
      });

      setMessage(res.data.message || "Document signed successfully");
      setDocument(res.data.document);
    } catch (error) {
      setMessage(error.response?.data?.message || "Signing failed");
    } finally {
      setLoading(false);
    }
  };

  if (!document) {
    return (
      <div className="public-page">
        <div className="public-card">
          <h1>SignFlow</h1>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  const filePath =
    document.status === "Signed" && document.signedFileUrl
      ? document.signedFileUrl.replaceAll("\\", "/")
      : document.fileUrl.replaceAll("\\", "/");

  return (
    <div className="public-page" onMouseUp={stopDrag}>
      <div className="public-sign-layout">
        <div className="public-pdf-card">
          <h1>SignFlow Public Signing</h1>
          <p>Review the document, place signature, then submit.</p>

          <h3>{document.title}</h3>

          <div
            ref={boxRef}
            className="public-pdf-box"
            onMouseMove={handleMouseMove}
          >
            <iframe
              title="Public Document"
              src={`${BACKEND_URL}/${filePath}`}
              className="public-pdf-frame"
            />

            {document.status !== "Signed" && (
              <div
                className="public-sign-placeholder"
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
            )}
          </div>
        </div>

        <div className="public-sign-card">
          <h2>
            {document.status === "Signed"
              ? "Document Signed"
              : "Complete Signature"}
          </h2>

          {document.status === "Signed" ? (
            <>
              <p>This document has been signed successfully.</p>

              <button
                onClick={() =>
                  window.open(`${BACKEND_URL}/${filePath}`, "_blank")
                }
              >
                View Signed PDF
              </button>
            </>
          ) : (
            <>
              <label>Your Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
              />

              <label>Page</label>

              <input
                type="number"
                min="1"
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
              />

              <div className="public-signature-box">
                <SignatureCanvas
                  ref={sigRef}
                  penColor="black"
                  canvasProps={{
                    width: 360,
                    height: 180,
                    className: "signature-canvas",
                  }}
                />
              </div>

              {message && <p className="public-message">{message}</p>}

              <div className="public-actions">
                <button onClick={clearSignature}>Clear</button>

                <button onClick={savePublicSignature} disabled={loading}>
                  {loading ? "Signing..." : "Submit Signature"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PublicSign;