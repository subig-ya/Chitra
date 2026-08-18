import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import NotificationBell from "../components/panel/NotificationBell.jsx";
import { PanelNavProvider } from "../components/panel/PanelNavContext.jsx";
import { Icons } from "../components/panel/icons.jsx";
import PanelDashboard from "../pages/panel/PanelDashboard.jsx";
import PanelDashboardArtist from "../pages/panel/PanelDashboardArtist.jsx";
import PanelOrders from "../pages/panel/PanelOrders.jsx";
import PanelNotifications from "../pages/panel/PanelNotifications.jsx";
import PanelSettings from "../pages/panel/PanelSettings.jsx";

function buildNavItems(role) {
  if (role === "artist") {
    return [
      { key: "dashboard", label: "Dashboard", icon: Icons.grid },
      { key: "orders", label: "Orders", icon: Icons.bag },
      { key: "notifications", label: "Notifications", icon: Icons.bell },
      { key: "settings", label: "Settings", icon: Icons.settings },
    ];
  }
  return [
    { key: "dashboard", label: "Dashboard", icon: Icons.grid },
    { key: "orders", label: "My Orders", icon: Icons.bag },
    { key: "notifications", label: "Notifications", icon: Icons.bell },
    { key: "settings", label: "Profile Settings", icon: Icons.settings },
  ];
}

function PanelContent({ view }) {
  const { user } = useAuth();
  const isArtist = user?.role === "artist";

  switch (view) {
    case "orders":
      return <PanelOrders />;
    case "notifications":
      return <PanelNotifications />;
    case "settings":
      return <PanelSettings />;
    case "dashboard":
    default:
      return isArtist ? <PanelDashboardArtist /> : <PanelDashboard />;
  }
}

export default function PanelDrawer({ open, onClose }) {
  const { user, logout } = useAuth();
  const [view, setView] = useState("dashboard");

  const isArtist = user?.role === "artist";
  const panelTitle = isArtist ? "Artist panel" : "Customer panel";
  const navItems = buildNavItems(user?.role);

  if (!open) return null;

  const navigateTo = (key) => {
    setView(key);
  };

  const linkClass = (active) =>
    `group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
      active
        ? "bg-lavender/70 font-semibold text-plum"
        : "text-plum-600/70 hover:bg-lavender/40 hover:text-plum"
    }`;

  const activeDot = (active) => (
    <span
      className={`absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-rose transition-opacity ${
        active ? "opacity-100" : "opacity-0 group-hover:opacity-50"
      }`}
    />
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-plum-900/25 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* drawer */}
      <aside className="relative ml-auto flex h-full w-full max-w-lg flex-col border-l border-plum/10 bg-cream shadow-2xl transition-transform">
        {/* header */}
        <div className="flex h-16 items-center justify-between border-b border-plum/10 px-4">
          <span className="font-display text-lg font-semibold tracking-[0.2em] text-plum">
            CHITRA
          </span>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-plum-600/60 transition hover:bg-lavender/40 hover:text-plum"
              aria-label="Close panel"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* sidebar nav */}
          <nav className="flex w-48 shrink-0 flex-col gap-1 border-r border-plum/10 bg-ivory px-3 py-4">
            {navItems.map((item) => {
              const active = view === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigateTo(item.key)}
                  className={linkClass(active)}
                >
                  {activeDot(active)}
                  <span className={`shrink-0 transition-colors ${active ? "text-rose" : "text-plum-600/60"}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            <div className="mt-auto space-y-1 border-t border-plum/10 pt-3">
              <Link
                to="/"
                onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-plum-600/70 transition hover:bg-lavender/40 hover:text-plum"
              >
                <span className="shrink-0">{Icons.home}</span>
                <span>Home</span>
              </Link>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose transition hover:bg-blush hover:text-plum"
              >
                <span className="shrink-0">{Icons.logout}</span>
                <span>Log out</span>
              </button>
            </div>
          </nav>

          {/* content */}
          <main className="min-w-0 flex-1 overflow-y-auto px-6 py-6">
            <PanelNavProvider navigateTo={navigateTo}>
              <PanelContent view={view} />
            </PanelNavProvider>
          </main>
        </div>

        {/* user chip */}
        <div className="flex items-center gap-3 border-t border-plum/10 px-4 py-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-rose-soft bg-blush text-sm font-semibold text-plum">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              (user?.name || "U").charAt(0).toUpperCase()
            )}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-plum">{user?.name}</span>
            <span className="block text-[11px] text-ink-muted">{panelTitle}</span>
          </span>
        </div>
      </aside>
    </div>
  );
}
