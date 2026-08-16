import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Chitra<span className="text-amber-600">.</span>
        </Link>

        <nav className="flex items-center gap-2">
          <NavLink to="/shop" className={navLinkClass} end>
            Browse artists
          </NavLink>
          {user && user.role === "artist" && (
            <NavLink to="/requests" className={navLinkClass}>
              Requests
            </NavLink>
          )}
          {user && user.role === "buyer" && (
            <NavLink to="/requests" className={navLinkClass}>
              My requests
            </NavLink>
          )}
          {user && (
            <NavLink to="/orders" className={navLinkClass}>
              Orders
            </NavLink>
          )}
          {user && user.role === "admin" && (
            <NavLink to="/admin" className={navLinkClass}>
              Admin
            </NavLink>
          )}
          {!user ? (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Log in
              </NavLink>
              <Link
                to="/register"
                className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <NavLink to="/profile" className={navLinkClass}>
                {user.name}
              </NavLink>
              <button
                onClick={handleLogout}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
              >
                Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
