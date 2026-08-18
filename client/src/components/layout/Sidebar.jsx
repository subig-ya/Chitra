import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../lib/auth.jsx";

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
    isActive
      ? "bg-lavender/70 font-semibold text-plum"
      : "text-plum-600/70 hover:bg-lavender/40 hover:text-plum"
  }`;

const activeDot = (isActive) => (
  <span
    className={`absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-rose transition-opacity ${
      isActive ? "opacity-100" : "opacity-0"
    }`}
  />
);

function Divider() {
  return <div className="my-2 border-t border-plum/10" />;
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const isArtist = user?.role === "artist";

  return (
    <>
      {/* mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-plum-900/20 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      {/* sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col border-r border-plum/10 bg-ivory transition-transform duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* brand */}
        <div className="flex h-16 items-center justify-between border-b border-plum/10 px-5">
          <Link to="/feed" className="flex items-baseline gap-0.5" onClick={onClose}>
            <span className="font-display text-lg font-semibold tracking-[0.18em] text-plum">
              Chitra
            </span>
            <span className="h-1 w-1 rounded-full bg-rose" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-plum-600/50 transition hover:bg-lavender/40 hover:text-plum lg:hidden"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* nav */}
        <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-4">
          <NavLink to="/feed" end className={linkClass} onClick={onClose}>
            {({ isActive }) => (
              <>
                {activeDot(isActive)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                  <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" />
                </svg>
                <span>Feed</span>
              </>
            )}
          </NavLink>
          <NavLink to="/shop" className={linkClass} onClick={onClose}>
            {({ isActive }) => (
              <>
                {activeDot(isActive)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <span>Shop</span>
              </>
            )}
          </NavLink>
          <NavLink to="/artists" className={linkClass} onClick={onClose}>
            {({ isActive }) => (
              <>
                {activeDot(isActive)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                <span>Artists</span>
              </>
            )}
          </NavLink>
          <NavLink to="/collections" className={linkClass} onClick={onClose}>
            {({ isActive }) => (
              <>
                {activeDot(isActive)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                </svg>
                <span>Collections</span>
              </>
            )}
          </NavLink>
          <NavLink to="/stories" className={linkClass} onClick={onClose}>
            {({ isActive }) => (
              <>
                {activeDot(isActive)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                  <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
                </svg>
                <span>Stories</span>
              </>
            )}
          </NavLink>

          <Divider />

          <NavLink to="/requests" className={linkClass} onClick={onClose}>
            {({ isActive }) => (
              <>
                {activeDot(isActive)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span>{isArtist ? "Requests" : "My Requests"}</span>
              </>
            )}
          </NavLink>
          <NavLink to="/orders" className={linkClass} onClick={onClose}>
            {({ isActive }) => (
              <>
                {activeDot(isActive)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
                </svg>
                <span>Orders</span>
              </>
            )}
          </NavLink>
          <NavLink to="/messages" className={linkClass} onClick={onClose}>
            {({ isActive }) => (
              <>
                {activeDot(isActive)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                <span>Messages</span>
              </>
            )}
          </NavLink>
          <NavLink to="/wishlist" className={linkClass} onClick={onClose}>
            {({ isActive }) => (
              <>
                {activeDot(isActive)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
                <span>Wishlist</span>
              </>
            )}
          </NavLink>
          <NavLink to="/cart" className={linkClass} onClick={onClose}>
            {({ isActive }) => (
              <>
                {activeDot(isActive)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
                </svg>
                <span>Cart</span>
              </>
            )}
          </NavLink>

          <Divider />

          <NavLink to="/profile" className={linkClass} onClick={onClose}>
            {({ isActive }) => (
              <>
                {activeDot(isActive)}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <span>My Profile</span>
              </>
            )}
          </NavLink>
          {isArtist && (
            <NavLink to="/artworks/mine" className={linkClass} onClick={onClose}>
              {({ isActive }) => (
                <>
                  {activeDot(isActive)}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span>My Artworks</span>
                </>
              )}
            </NavLink>
          )}
          {user?.role === "admin" && (
            <NavLink to="/admin" className={linkClass} onClick={onClose}>
              {({ isActive }) => (
                <>
                  {activeDot(isActive)}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`h-[18px] w-[18px] shrink-0 ${isActive ? "text-rose" : "text-plum-600/50"}`}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Admin</span>
                </>
              )}
            </NavLink>
          )}

          <div className="mt-auto">
            <Divider />
            <button
              type="button"
              onClick={async () => { await logout(); onClose(); }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-plum-600/70 transition hover:bg-lavender/40 hover:text-rose"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px] shrink-0">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Log out</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
}
