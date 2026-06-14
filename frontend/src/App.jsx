import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadDocument from "./pages/UploadDocument";
import MyDocuments from "./pages/MyDocuments";
import PendingDocuments from "./pages/PendingDocuments";
import SignedDocuments from "./pages/SignedDocuments";
import AuditLogs from "./pages/AuditLogs";
import SignDocument from "./pages/SignDocument";
import PublicSign from "./pages/PublicSign";
import RejectedDocuments from "./pages/RejectedDocuments";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadDocument />} />
        <Route path="/documents" element={<MyDocuments />} />
        <Route path="/pending" element={<PendingDocuments />} />
        <Route path="/signed" element={<SignedDocuments />} />
        <Route path="/audit" element={<AuditLogs />} />
        <Route path="/sign" element={<SignDocument />} />
        <Route path="/public-sign/:token" element={<PublicSign />} />
        <Route path="/rejected" element={<RejectedDocuments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;