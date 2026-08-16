import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import api from "../lib/api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function Orders() {
  const { user } = useAuth();
  const isArtist = user.role === "artist";

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get("/orders")).data,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <p className="mt-1 text-sm text-slate-500">
        {isArtist
          ? "Work on your commissions and deliver."
          : "Your commissions, payments and deliveries."}
      </p>

      {isLoading && <p className="mt-6 text-slate-400">Loading…</p>}

      <div className="mt-6 space-y-3">
        {data?.data.map((o) => {
          const other = isArtist ? o.buyerId : o.artistId;
          return (
            <Link
              key={o._id}
              to={`/orders/${o._id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-amber-400"
            >
              <div>
                <p className="font-semibold">
                  {o.packageTitle || "Commission"} · {other?.name}
                </p>
                <p className="text-sm text-slate-500">
                  Rs.{o.agreedPrice} · payout Rs.{o.artistPayoutAmount}
                  {o.deliverables.length > 0 &&
                    ` · v${o.deliverables[o.deliverables.length - 1].version} delivered`}
                </p>
              </div>
              <StatusBadge status={o.status} />
            </Link>
          );
        })}
        {data && data.data.length === 0 && (
          <p className="text-slate-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
