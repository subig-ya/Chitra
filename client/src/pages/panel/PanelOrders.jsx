import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../lib/auth.jsx";
import api from "../../lib/api.js";
import { timeAgo } from "../../lib/time.js";
import StatusBadge from "../../components/StatusBadge.jsx";
import { Icons } from "../../components/panel/icons.jsx";

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

const ACTIVE = ["awaiting_payment", "in_progress", "revision_requested", "delivered"];

const TABS = [
  { key: "all", label: "All", match: () => true },
  { key: "active", label: "In progress", match: (s) => ACTIVE.includes(s) },
  { key: "awaiting", label: "Awaiting delivery", match: (s) => s === "delivered" },
  { key: "completed", label: "Completed", match: (s) => s === "completed" },
  { key: "disputed", label: "Disputed", match: (s) => s === "disputed" },
  { key: "cancelled", label: "Cancelled", match: (s) => ["cancelled", "refunded"].includes(s) },
];

const BAR = {
  awaiting_payment: "border-l-rose",
  in_progress: "border-l-lilac",
  delivered: "border-l-rose-soft",
  revision_requested: "border-l-rose",
  completed: "border-l-plum-600",
  disputed: "border-l-rose",
  cancelled: "border-l-mauve",
  refunded: "border-l-mauve",
};

export default function PanelOrders() {
  const { user } = useAuth();
  const isArtist = user.role === "artist";
  const [tab, setTab] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get("/orders")).data,
  });

  const orders = useMemo(() => data?.data || [], [data]);

  const counts = useMemo(() => {
    const c = {};
    for (const t of TABS) c[t.key] = orders.filter((o) => t.match(o.status)).length;
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const t = TABS.find((x) => x.key === tab);
    return orders.filter((o) => t.match(o.status));
  }, [orders, tab]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-3 text-[0.68rem] font-medium tracking-[0.34em] text-rose uppercase">
            <span className="h-px w-8 bg-rose" />
            Orders
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-plum sm:text-4xl">
            {isArtist ? "Your commissions" : "Your orders"}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {isArtist
              ? "Work on your commissions and deliver on time."
              : "Track every purchase, delivery and payment in one place."}
          </p>
        </div>
        <Link
          to={isArtist ? "/panel/artworks" : "/shop"}
          className="inline-flex items-center gap-2 rounded-lg border border-plum/20 px-5 py-2.5 text-sm font-medium text-plum transition hover:border-rose hover:text-rose"
        >
          {isArtist ? Icons.plus : Icons.search}
          {isArtist ? "List an artwork" : "Keep exploring"}
        </Link>
      </div>

      {/* filter tabs */}
      <div className="flex flex-wrap gap-x-8 gap-y-3 border-b border-plum/10">
        {TABS.map((t) => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`-mb-px inline-flex items-center gap-2 border-b-2 pb-2.5 text-sm font-medium transition ${
                active ? "border-rose text-plum" : "border-transparent text-ink-muted hover:text-plum"
              }`}
            >
              {t.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  active ? "bg-lavender/70 font-semibold text-plum" : "bg-plum/5 text-ink-muted"
                }`}
              >
                {counts[t.key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* order cards */}
      {isLoading && <p className="text-ink-muted">Loading orders…</p>}

      {!isLoading && filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-plum/20 bg-ivory p-12 text-center">
          <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-lavender/70 text-plum-600">
            {Icons.bag}
          </span>
          <p className="mt-4 font-display text-xl font-semibold text-plum">
            No {tab === "all" ? "" : TABS.find((t) => t.key === tab)?.label.toLowerCase() + " "}orders here
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {isArtist
              ? "When collectors buy or commission your work, it will appear here."
              : "When you buy a piece, it will appear here for you to track."}
          </p>
          <Link
          to={isArtist ? "/artworks/mine" : "/shop"}
            className="cta-line mt-6 inline-flex text-plum"
          >
            {Icons.search}
            {isArtist ? "Manage artworks" : "Go to the shop"}
          </Link>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((o) => {
          const other = isArtist ? o.buyerId : o.artistId;
          const lastDeliverable = o.deliverables?.[o.deliverables.length - 1];
          return (
            <Link
              key={o._id}
              to={`/orders/${o._id}`}
              className={`group relative flex items-center justify-between gap-4 rounded-xl border border-plum/10 border-l-2 bg-ivory p-5 pl-6 transition duration-300 hover:border-rose/40 hover:shadow-sm ${
                BAR[o.status] || "border-l-plum-600"
              }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-plum">
                    {o.packageTitle || "Commission"}
                  </p>
                  <span className="hidden text-lavender sm:inline">·</span>
                  <p className="truncate text-sm text-ink-soft">{other?.name || "—"}</p>
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {rs(o.agreedPrice)}
                  {isArtist && ` · payout ${rs(o.artistPayoutAmount)}`}
                  {lastDeliverable && ` · v${lastDeliverable.version} delivered`}
                  <span className="mx-1.5 text-lavender">•</span>
                  {timeAgo(o.createdAt)}
                </p>
              </div>
              <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">
                <StatusBadge status={o.status} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
