import { useEffect, useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import API from "../api/axios";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import DocumentTable from "../components/DocumentTable";

function Dashboard() {
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

        <div className="dashboard-heading">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of your documents and activity</p>
          </div>
        </div>

        <section className="stats-grid">
          <StatCard
            title="Total Documents"
            value={total}
            subtitle="All uploaded documents"
            icon={FileText}
            color="purple"
          />

          <StatCard
            title="Pending Signatures"
            value={pending}
            subtitle="Awaiting signatures"
            icon={Clock}
            color="orange"
          />

          <StatCard
            title="Signed Documents"
            value={signed}
            subtitle="Successfully signed"
            icon={CheckCircle}
            color="green"
          />

          <StatCard
            title="Rejected Documents"
            value={rejected}
            subtitle="Rejected documents"
            icon={XCircle}
            color="red"
          />
        </section>

        <DocumentTable documents={documents} onDelete={deleteDocument} />
      </main>
    </div>
  );
}

export default Dashboard;