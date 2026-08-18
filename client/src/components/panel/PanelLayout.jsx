import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth.jsx";
import NotificationBell from "./NotificationBell.jsx";
import { Icons } from "./icons.jsx";

function buildNavItems(role) {
  if (role === "artist") {
    return [
      { to: "/panel", end: true, label: "Dashboard", icon: Icons.grid },
      { to: "/panel/artworks", end: false, label: "My Artworks", icon: Icons.image },
      { to: "/panel/orders", end: false, label: "Orders", icon: Icons.bag },
      { to: "/panel/requests", end: false, label: "Requests", icon: Icons.clipboard },
      { to: "/panel/messages", end: false, label: "Messages", icon: Icons.chat },
      { to: "/panel/notifications", end: false, label: "Notifications", icon: Icons.bell },
      { to: "/panel/reports", end: false, label: "Reports", icon: Icons.flag },
      { to: "/panel/settings", end: false, label: "Settings", icon: Icons.settings },
    ];
  }
  return [
    { to: "/panel", end: true, label: "Dashboard", icon: Icons.grid },
    { to: "/panel/orders", end: false, label: "My Orders", icon: Icons.bag },
    { to: "/panel/favourites", end: false, label: "Favourites", icon: Icons.heart },
    { to: "/panel/messages", end: false, label: "Messages", icon: Icons.chat },
    { to: "/panel/notifications", end: false, label: "Notifications", icon: Icons.bell },
    { to: "/panel/settings", end: false, label: "Profile Settings", icon: Icons.settings },
  ];
}

function Brand({ collapsed }) {
  return (
    <Link
      to="/panel"
      className={`flex flex-col ${collapsed ? "items-center" : ""}`}
    >
      <span className="font-display text-lg font-semibold tracking-[0.28em] text-plum">
        CHITRA
      </span>
      {!collapsed && <span className="mt-1 h-px w-8 bg-rose" />}
    </Link>
  );
}

export default function PanelLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isArtist = user?.role === "artist";
  const navItems = buildNavItems(user?.role);
  const panelTitle = isArtist ? "Artist panel" : "Customer panel";

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) =>
    `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-lavender/70 font-semibold text-plum"
        : "text-plum-600/70 hover:bg-lavender/40 hover:text-plum"
    }`;

  const linkDot = (isActive) => (
    <span
      className={`absolute top-1/2 left-0 h-4 w-[3px] -translate-y-1/2 rounded-full bg-rose transition-opacity ${
        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
      }`}
    />
  );

  const sidebarInner = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-5">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={linkClass}
          title={collapsed ? item.label : undefined}
          onClick={() => setMobileOpen(false)}
        >
          {({ isActive }) => (
            <>
              {linkDot(isActive)}
              <span
                className={`shrink-0 transition-colors ${
                  isActive ? "text-rose" : "text-plum-600/60"
                }`}
              >
                {item.icon}
              </span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  const userChip = (
    <div className="flex items-center gap-3 rounded-lg border border-plum/10 bg-white/70 p-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-rose-soft bg-blush text-sm font-semibold text-plum">
        {user?.avatar ? (
          <img src={user.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          (user?.name || "U").charAt(0).toUpperCase()
        )}
      </span>
      {!collapsed && (
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-plum">{user?.name}</span>
          <span className="block text-[11px] text-ink-muted">{panelTitle}</span>
        </span>
      )}
    </div>
  );

  const sidebarBottom = (
    <div className="space-y-1 border-t border-plum/10 p-3">
      <Link
        to="/"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-plum-600/70 transition hover:bg-lavender/40 hover:text-plum"
        title={collapsed ? "Home" : undefined}
      >
        <span className="shrink-0">{Icons.home}</span>
        {!collapsed && <span>Home</span>}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose transition hover:bg-blush hover:text-plum"
        title={collapsed ? "Log out" : undefined}
      >
        <span className="shrink-0">{Icons.logout}</span>
        {!collapsed && <span>Log out</span>}
      </button>
      {userChip}
    </div>
  );

  const desktopSidebar = (
    <aside
      className={`relative hidden shrink-0 flex-col border-r border-plum/10 bg-ivory transition-all duration-200 lg:flex ${
        collapsed ? "lg:w-[76px]" : "lg:w-60"
      }`}
    >
      <div
        className={`flex h-16 items-center border-b border-plum/10 ${
          collapsed ? "justify-center" : "justify-between"
        } px-4`}
      >
        <Brand collapsed={collapsed} />
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="rounded-lg p-1.5 text-plum-600/60 transition hover:bg-lavender/40 hover:text-plum"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>
      <div className="flex flex-1 flex-col">
        {sidebarInner}
        {sidebarBottom}
      </div>
      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border border-plum/15 bg-white text-plum-600 shadow-sm transition hover:text-plum"
          aria-label="Expand sidebar"
          title="Expand sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}
    </aside>
  );

  const mobileSidebar = (
    <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-plum-900/25 backdrop-blur-sm transition-opacity duration-200 ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`absolute top-0 left-0 flex h-full w-64 flex-col bg-ivory shadow-xl transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-plum/10 px-4">
          <Brand />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-plum-600/60 hover:bg-lavender/40 hover:text-plum"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-1 flex-col">
          {sidebarInner}
          {sidebarBottom}
        </div>
      </aside>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream text-plum">
      <div className="relative flex min-h-screen">
        {desktopSidebar}
        {mobileSidebar}
        <div className="relative flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-plum/10 bg-ivory/85 px-4 backdrop-blur">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-plum-600 transition hover:bg-lavender/50 lg:hidden"
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="truncate font-display text-lg font-semibold text-plum">
                {user?.name || "Welcome"}
              </p>
              <p className="truncate text-[11px] text-ink-muted">
                {panelTitle} · {isArtist ? "manage your art" : "track your collection"}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <NotificationBell />
              <Link
                to="/panel/settings"
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-rose-soft bg-blush text-sm font-semibold text-plum"
                aria-label="Profile settings"
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user?.name || "U").charAt(0).toUpperCase()
                )}
              </Link>
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
