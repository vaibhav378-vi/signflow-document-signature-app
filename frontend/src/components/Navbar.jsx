import { UserCircle } from "lucide-react";

function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="navbar">
      <div>
        <h2>Welcome back, {user?.name || "User"}</h2>
        <p>Manage, sign, and track your documents securely.</p>
      </div>

      <div className="user-profile">
        <UserCircle size={26} />
        <span>{user?.name || "User"}</span>
      </div>
    </header>
  );
}

export default Navbar;