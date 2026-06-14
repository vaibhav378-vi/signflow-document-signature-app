import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Clock,
  CheckCircle,
  ClipboardList,
  LogOut,
  PenLine,
  XCircle,
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Upload Document", path: "/upload", icon: Upload },
    { name: "My Documents", path: "/documents", icon: FileText },
    { name: "Pending", path: "/pending", icon: Clock },
    { name: "Signed", path: "/signed", icon: CheckCircle },
    { name: "Rejected", path: "/rejected", icon: XCircle },
    { name: "Audit Logs", path: "/audit", icon: ClipboardList },
  ];

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <PenLine size={24} />
        </div>
        <div>
          <h2>SignFlow</h2>
          <p>Digital Signature</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${active ? "active" : ""}`}
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <button className="logout-btn" onClick={logout}>
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;