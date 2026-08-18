import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../lib/api.js";
import { useAuth } from "../../lib/auth.jsx";
import { timeAgo } from "../../lib/time.js";
import { usePanelNav } from "../../components/panel/PanelNavContext.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import { Icons } from "../../components/panel/icons.jsx";

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

const BAR = {
  awaiting_payment: "border-l-rose",
  in_progress: "border-l-lilac",
  delivered: "border-l-rose-soft",
  revision_requested: "border-l-rose",
  completed: "border-l-plum-600",
  disputed: "border-l-rose",
  cancelled: "border-l-mauve",
};

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export default function PanelDashboard() {
  const { user } = useAuth();
  const { navigateTo } = usePanelNav();

  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get("/orders")).data,
  });
  const orders = ordersData?.data || [];

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get("/cart")).data,
  });

  const { data: notifData } = useQuery({
    queryKey: ["notif-dashboard"],
    queryFn: async () => (await api.get("/notifications?limit=4")).data,
    refetchInterval: 15_000,
  });

  const count = (s) => orders.filter((o) => o.status === s).length;
  const inProgress = count("in_progress") + count("revision_requested");
  const awaitingDelivery = count("delivered");
  const pendingPayment = count("awaiting_payment");
  const spent = orders
    .filter((o) => ["completed", "in_progress", "delivered", "revision_requested"].includes(o.status))
    .reduce((n, o) => n + (o.agreedPrice || 0), 0);
  const cartCount =
    cartData?.cart?.items?.reduce((n, i) => n + (i.quantity || 1), 0) || 0;
  const recentOrders = orders.slice(0, 5);
  const recentNotifs = notifData?.data || [];

  const stats = [
    { label: "Orders in progress", value: inProgress, view: "orders", icon: Icons.clock },
    { label: "Awaiting delivery", value: awaitingDelivery, view: "orders", icon: Icons.truck },
    { label: "Pending payment", value: pendingPayment, view: "orders", icon: Icons.wallet },
    { label: "Total spent", value: rs(spent), view: "orders", icon: Icons.bag },
    { label: "In cart", value: cartCount, to: "/cart", icon: Icons.cart },
  ];

  const quickActions = [
    { label: "Continue shopping", to: "/shop", icon: Icons.search },
    { label: "View my cart", to: "/cart", icon: Icons.cart },
    { label: "Message an artist", to: "/messages", icon: Icons.chat },
    { label: "View notifications", view: "notifications", icon: Icons.bell },
    { label: "Update your profile", view: "settings", icon: Icons.settings },
  ];

  const firstName = (user?.name || "there").split(" ")[0];

  return (
    <div className="space-y-10">
      {/* header */}
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <p className="flex items-center gap-3 text-[0.68rem] font-medium tracking-[0.34em] text-rose uppercase">
            <span className="h-px w-8 bg-rose" />
            Customer dashboard
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-plum sm:text-4xl">
            {greeting()}, {firstName}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">
            Track your orders, favourites and notifications in one calm place.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-lg border border-plum/20 px-5 py-2.5 text-sm font-medium text-plum transition hover:border-rose hover:text-rose"
        >
          {Icons.search}
          Browse artworks
        </Link>
      </section>

      {/* stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map((s) => {
          if (s.view) {
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => navigateTo(s.view)}
                className="group rounded-xl border border-plum/10 bg-ivory p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-rose/40 hover:shadow-sm"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lavender/70 text-plum-600 transition-colors duration-300 group-hover:bg-blush group-hover:text-plum">
                  {s.icon}
                </span>
                <p className="mt-3 text-xs font-medium text-ink-muted">{s.label}</p>
                <p className="mt-0.5 truncate font-display text-lg font-semibold text-plum">
                  {s.value}
                </p>
              </button>
            );
          }
          return (
            <Link
              key={s.label}
              to={s.to}
              className="group rounded-xl border border-plum/10 bg-ivory p-4 transition duration-300 hover:-translate-y-0.5 hover:border-rose/40 hover:shadow-sm"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lavender/70 text-plum-600 transition-colors duration-300 group-hover:bg-blush group-hover:text-plum">
                {s.icon}
              </span>
              <p className="mt-3 text-xs font-medium text-ink-muted">{s.label}</p>
              <p className="mt-0.5 truncate font-display text-lg font-semibold text-plum">
                {s.value}
              </p>
            </Link>
          );
        })}
      </div>

      {/* recent orders */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-plum">Recent orders</h2>
          <button
            type="button"
            onClick={() => navigateTo("orders")}
            className="inline-flex items-center gap-1 text-sm font-medium text-rose transition hover:text-plum"
          >
            View all {Icons.arrowRight}
          </button>
        </div>
        {recentOrders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-plum/20 bg-ivory p-10 text-center text-sm text-ink-muted">
            You haven't ordered anything yet. Head to the shop to find something you love.
          </p>
        ) : (
          <div className="space-y-2.5">
            {recentOrders.map((o) => (
              <Link
                key={o._id}
                to={`/orders/${o._id}`}
                className={`group flex items-center justify-between gap-3 rounded-xl border border-plum/10 border-l-2 bg-ivory p-4 pl-5 transition duration-300 hover:border-rose/40 hover:shadow-sm ${
                  BAR[o.status] || "border-l-plum-600"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-plum">
                    {o.packageTitle || "Commission"} ·{" "}
                    <span className="text-ink-soft">{o.artistId?.name || "Artist"}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {rs(o.agreedPrice)} · {timeAgo(o.createdAt)}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* notifications + quick actions */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* notifications */}
        <section className="lg:col-span-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-plum">Notifications</h2>
            <button
              type="button"
              onClick={() => navigateTo("notifications")}
              className="inline-flex items-center gap-1 text-sm font-medium text-rose transition hover:text-plum"
            >
              View all {Icons.arrowRight}
            </button>
          </div>
          {recentNotifs.length === 0 ? (
            <p className="rounded-xl border border-dashed border-plum/20 bg-ivory p-8 text-center text-sm text-ink-muted">
              No notifications yet.
            </p>
          ) : (
            <div className="space-y-2">
              {recentNotifs.map((n) => (
                <button
                  key={n._id}
                  type="button"
                  onClick={() => navigateTo("notifications")}
                  className={`flex w-full items-start gap-3 rounded-xl border bg-ivory p-3.5 text-left transition hover:border-rose/40 ${
                    n.readAt ? "border-plum/10" : "border-rose/30 bg-blush/30"
                  }`}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-lavender/70 text-plum-600">
                    {Icons.bell}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium text-plum">{n.title}</span>
                      <span className="text-[11px] text-ink-muted">{timeAgo(n.createdAt)}</span>
                    </span>
                    {n.message && (
                      <span className="mt-0.5 block truncate text-xs text-ink-soft">{n.message}</span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* quick actions */}
        <section className="lg:col-span-4">
          <h2 className="mb-4 font-display text-xl font-semibold text-plum">Quick actions</h2>
          <div className="space-y-2">
            {quickActions.map((a) => {
              if (a.view) {
                return (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => navigateTo(a.view)}
                    className="group flex w-full items-center justify-between gap-3 rounded-lg border border-plum/10 bg-ivory px-4 py-3 text-left transition hover:border-rose/40 hover:bg-blush/40"
                  >
                    <span className="flex min-w-0 items-center gap-3 text-sm font-medium text-plum">
                      <span className="shrink-0 text-plum-600/70 transition-colors group-hover:text-rose">
                        {a.icon}
                      </span>
                      <span className="truncate">{a.label}</span>
                    </span>
                    <span className="shrink-0 text-rose opacity-0 transition-opacity group-hover:opacity-100">
                      {Icons.arrowRight}
                    </span>
                  </button>
                );
              }
              return (
                <Link
                  key={a.label}
                  to={a.to}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-plum/10 bg-ivory px-4 py-3 transition hover:border-rose/40 hover:bg-blush/40"
                >
                  <span className="flex min-w-0 items-center gap-3 text-sm font-medium text-plum">
                    <span className="shrink-0 text-plum-600/70 transition-colors group-hover:text-rose">
                      {a.icon}
                    </span>
                    <span className="truncate">{a.label}</span>
                  </span>
                  <span className="shrink-0 text-rose opacity-0 transition-opacity group-hover:opacity-100">
                    {Icons.arrowRight}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
