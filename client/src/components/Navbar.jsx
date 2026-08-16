import { useQuery } from "@tanstack/react-query";
import { Link, NavLink, useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
  }`;

function CartIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get("/cart")).data,
    enabled: Boolean(user),
    staleTime: 30_000,
  });
  const cartCount =
    cart?.cart?.items?.reduce((n, i) => n + (i.quantity || 1), 0) || 0;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (user?.role === "artist") {
    return (
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
          <Link to="/" className="flex items-baseline gap-1 text-xl font-bold tracking-tight">
            Chitra<span className="text-amber-600">.</span>
          </Link>
          <nav className="flex items-center gap-1.5">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            {user.avatar && (
              <Link
                to="/panel"
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-slate-200"
                aria-label="Artist panel"
              >
                <img src={user.avatar} alt="" className="h-full w-full object-cover" />
              </Link>
            )}
            {!user.avatar && (
              <NavLink to="/panel" className={navLinkClass}>
                {user.name.split(" ")[0]}
              </NavLink>
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
            >
              Log out
            </button>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="flex items-baseline gap-1 text-xl font-bold tracking-tight">
          Chitra<span className="text-amber-600">.</span>
        </Link>

        <nav className="flex items-center gap-1.5">
          <NavLink to="/shop" className={navLinkClass} end>
            Shop
          </NavLink>
          <NavLink to="/artists" className={navLinkClass} end>
            Artists
          </NavLink>
          <NavLink to="/collections" className={navLinkClass} end>
            Collections
          </NavLink>
          <NavLink to="/stories" className={navLinkClass} end>
            Stories
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
              <NavLink
                to="/messages"
                className={navLinkClass}
                aria-label="Messages"
              >
                Messages
              </NavLink>
              <NavLink
                to="/wishlist"
                className={navLinkClass}
                aria-label="Wishlist"
              >
                Wishlist
              </NavLink>
              <NavLink
                to="/cart"
                className="relative rounded-lg px-2.5 py-1.5 text-slate-600 transition hover:bg-slate-100"
                aria-label={`Cart, ${cartCount} items`}
              >
                <CartIcon />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-600 px-1 text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </NavLink>
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
