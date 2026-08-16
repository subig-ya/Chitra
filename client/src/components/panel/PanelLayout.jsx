import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/auth.jsx";
import NotificationBell from "./NotificationBell.jsx";

const ICONS = {
  grid: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),
  bag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  ),
  clipboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M4 4h16v16H4z" />
      <path d="M4 10h16" />
      <path d="M8 15h3" />
    </svg>
  ),
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22v-7" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
};

function buildNavItems(role) {
  if (role === "artist") {
    return [
      { to: "/panel", end: true, label: "Overview", icon: ICONS.grid },
      { to: "/panel/artworks", end: false, label: "My Artworks", icon: ICONS.image },
      { to: "/panel/orders", end: false, label: "Orders", icon: ICONS.bag },
      { to: "/panel/requests", end: false, label: "Requests", icon: ICONS.clipboard },
      { to: "/panel/messages", end: false, label: "Messages", icon: ICONS.chat },
      { to: "/panel/notifications", end: false, label: "Notifications", icon: ICONS.bell },
      { to: "/panel/reports", end: false, label: "Reports", icon: ICONS.flag },
      { to: "/panel/settings", end: false, label: "Settings", icon: ICONS.settings },
    ];
  }
  return [
    { to: "/panel", end: true, label: "Dashboard", icon: ICONS.grid },
    { to: "/panel/orders", end: false, label: "My Orders", icon: ICONS.bag },
    { to: "/panel/favourites", end: false, label: "Favourites", icon: ICONS.heart },
    { to: "/panel/messages", end: false, label: "Messages", icon: ICONS.chat },
    { to: "/panel/notifications", end: false, label: "Notifications", icon: ICONS.bell },
    { to: "/panel/settings", end: false, label: "Profile Settings", icon: ICONS.settings },
  ];
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
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      isActive
        ? "bg-slate-900 text-white"
        : "text-slate-600 hover:bg-slate-100"
    }`;

  const sidebarInner = (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={linkClass}
          title={collapsed ? item.label : undefined}
          onClick={() => setMobileOpen(false)}
        >
          <span className="shrink-0">{item.icon}</span>
          {!collapsed && <span className="truncate">{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  );

  const sidebarBottom = (
    <div className="border-t border-slate-200 p-3">
      <Link
        to="/"
        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          <path d="M9 22V12h6v10" />
        </svg>
        {!collapsed && <span>Home</span>}
      </Link>
      <button
        type="button"
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0" aria-hidden="true">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
        {!collapsed && <span>Log out</span>}
      </button>
    </div>
  );

  const desktopSidebar = (
    <aside
      className={`hidden shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200 lg:flex ${
        collapsed ? "lg:w-[68px]" : "lg:w-64"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
        <Link
          to="/panel"
          className={`flex items-baseline gap-1 font-bold tracking-tight ${
            collapsed ? "text-lg" : "text-xl"
          }`}
        >
          Chitra<span className="text-amber-600">.</span>
        </Link>
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M9 18l6-6-6-6" />
            </svg>
          )}
        </button>
      </div>
      <div className="flex flex-1 flex-col">
        {sidebarInner}
        {sidebarBottom}
      </div>
    </aside>
  );

  const mobileSidebar = (
    <div className={`fixed inset-0 z-50 lg:hidden ${mobileOpen ? "" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${
          mobileOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />
      <aside
        className={`absolute top-0 left-0 flex h-full w-64 flex-col bg-white shadow-xl transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
          <Link to="/panel" onClick={() => setMobileOpen(false)} className="text-xl font-bold tracking-tight">
            Chitra<span className="text-amber-600">.</span>
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        {desktopSidebar}
        {mobileSidebar}
        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-slate-200 bg-white/95 px-4 backdrop-blur">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.name}
              </p>
              <p className="truncate text-[11px] text-slate-400">
                {panelTitle}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <NotificationBell />
              {user?.avatar && (
                <Link
                  to="/panel/settings"
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-slate-200"
                  aria-label="Settings"
                >
                  <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                </Link>
              )}
            </div>
          </header>
          <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
