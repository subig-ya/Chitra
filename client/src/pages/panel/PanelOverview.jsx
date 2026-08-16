import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../../lib/api.js";
import { useAuth } from "../../lib/auth.jsx";
import { timeAgo } from "../../lib/time.js";
import StatusBadge from "../../components/StatusBadge.jsx";

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

export default function PanelOverview() {
  const { user } = useAuth();
  const isArtist = user?.role === "artist";

  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get("/orders")).data,
  });
  const orders = ordersData?.data || [];

  const { data: artworksData } = useQuery({
    queryKey: ["my-artworks"],
    queryFn: async () => (await api.get("/artworks/me")).data,
    enabled: isArtist,
  });
  const artworks = artworksData?.data || [];

  const { data: convData } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => (await api.get("/conversations")).data,
  });
  const conversations = convData?.data || [];

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get("/cart")).data,
    enabled: !isArtist,
  });

  const { data: meData } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
    enabled: !isArtist,
  });

  const unreadMessages = conversations.reduce((n, c) => n + (c.unread || 0), 0);
  const count = (s) => orders.filter((o) => o.status === s).length;

  let stats;
  let recentOrders;
  let quickActions;
  let cta;

  if (isArtist) {
    const pending = count("awaiting_payment") + count("in_progress");
    const inProgress = count("in_progress") + count("revision_requested");
    const awaitingApproval = count("delivered");
    const escrow = orders
      .filter((o) =>
        ["awaiting_payment", "in_progress", "delivered", "revision_requested", "disputed"].includes(
          o.status
        )
      )
      .reduce((n, o) => n + (o.agreedPrice || 0), 0);
    const liveArtworks = artworks.filter((a) => a.isVerified).length;

    stats = [
      { label: "Orders in progress", value: inProgress, to: "/panel/orders" },
      { label: "Awaiting delivery", value: awaitingApproval, to: "/panel/orders" },
      { label: "Pending payment", value: pending, to: "/panel/orders" },
      { label: "Escrow value", value: rs(escrow), to: "/panel/orders" },
      { label: "Live artworks", value: liveArtworks, to: "/panel/artworks" },
      { label: "Unread messages", value: unreadMessages, to: "/panel/messages" },
    ];
    recentOrders = orders.slice(0, 5).map((o) => ({
      _id: o._id,
      title: o.packageTitle || "Commission",
      other: o.buyerId?.name || "Collector",
      amount: o.agreedPrice,
      status: o.status,
      createdAt: o.createdAt,
    }));
    cta = { label: "+ List an artwork", to: "/panel/artworks" };
    quickActions = [
      { label: "Add a new artwork", to: "/panel/artworks" },
      { label: "Check commission requests", to: "/panel/requests" },
      { label: "Reply to messages", to: "/panel/messages" },
      { label: "View notifications", to: "/panel/notifications" },
      { label: "Report a customer", to: "/panel/reports" },
      { label: "Update your profile", to: "/panel/settings" },
    ];
  } else {
    const inProgress = count("in_progress") + count("revision_requested");
    const awaitingApproval = count("delivered");
    const pendingPayment = count("awaiting_payment");
    const spent = orders
      .filter((o) => ["completed", "in_progress", "delivered", "revision_requested"].includes(o.status))
      .reduce((n, o) => n + (o.agreedPrice || 0), 0);
    const cartCount =
      cartData?.cart?.items?.reduce((n, i) => n + (i.quantity || 1), 0) || 0;
    const favourites = meData?.user?.wishlist?.length || 0;

    stats = [
      { label: "Orders in progress", value: inProgress, to: "/panel/orders" },
      { label: "Awaiting delivery", value: awaitingApproval, to: "/panel/orders" },
      { label: "Pending payment", value: pendingPayment, to: "/panel/orders" },
      { label: "Total spent", value: rs(spent), to: "/panel/orders" },
      { label: "In cart", value: cartCount, to: "/cart" },
      { label: "Favourites", value: favourites, to: "/panel/favourites" },
    ];
    recentOrders = orders.slice(0, 5).map((o) => ({
      _id: o._id,
      title: o.packageTitle || "Commission",
      other: o.artistId?.name || "Artist",
      amount: o.agreedPrice,
      status: o.status,
      createdAt: o.createdAt,
    }));
    cta = { label: "Browse artworks", to: "/shop" };
    quickActions = [
      { label: "Continue shopping", to: "/shop" },
      { label: "View my cart", to: "/cart" },
      { label: "Browse my favourites", to: "/panel/favourites" },
      { label: "View notifications", to: "/panel/notifications" },
      { label: "Message an artist", to: "/panel/messages" },
      { label: "Update your profile", to: "/panel/settings" },
    ];
  }

  const firstName = (user?.name || "there").split(" ")[0];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isArtist
              ? "Manage your artworks, orders, messages and reports from here."
              : "Track your orders, favourites, notifications and profile from here."}
          </p>
        </div>
        <Link
          to={cta.to}
          className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {cta.label}
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-amber-400"
          >
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">
              {isArtist ? "Recent orders" : "Recent ordered items"}
            </h2>
            <Link to="/panel/orders" className="text-sm font-semibold text-amber-600 hover:underline">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 && (
            <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              {isArtist
                ? "No orders yet. Orders appear here when a collector buys or commissions your work."
                : "You haven't ordered anything yet. Head to the shop to find something you love."}
            </p>
          )}
          <div className="space-y-2">
            {recentOrders.map((o) => (
              <Link
                key={o._id}
                to={`/orders/${o._id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-amber-400"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {o.title} ·{" "}
                    <span className="text-slate-500">{o.other}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    {rs(o.amount)} · {timeAgo(o.createdAt)}
                  </p>
                </div>
                <StatusBadge status={o.status} />
              </Link>
            ))}
          </div>
        </section>

        <section className="lg:col-span-2">
          <h2 className="mb-3 font-display text-xl font-bold">Quick actions</h2>
          <div className="space-y-2">
            {quickActions.map((a) => (
              <Link
                key={a.label}
                to={a.to}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm font-medium transition hover:border-amber-400"
              >
                {a.label}
                <span className="text-slate-300">→</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
