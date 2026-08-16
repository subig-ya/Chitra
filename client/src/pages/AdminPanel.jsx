import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api, { apiErrorMessage } from "../lib/api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function AdminPanel() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("artists");
  const [error, setError] = useState("");
  const [resolve, setResolve] = useState({ id: null, resolution: "", note: "", refundAmount: "" });

  const { data: pending, isLoading: loadingArtists } = useQuery({
    queryKey: ["admin", "pending-artists"],
    queryFn: async () => (await api.get("/admin/artists/pending")).data,
  });

  const { data: disputes } = useQuery({
    queryKey: ["admin", "disputes"],
    queryFn: async () => (await api.get("/disputes")).data,
  });

  const { data: analytics } = useQuery({
    queryKey: ["admin", "analytics"],
    queryFn: async () => (await api.get("/admin/analytics")).data,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, verified }) =>
      api.patch(`/admin/artists/${id}/verify`, { verified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-artists"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "analytics"] });
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const resolveMutation = useMutation({
    mutationFn: (payload) => api.patch(`/disputes/${resolve.id}/resolve`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "disputes"] });
      setResolve({ id: null, resolution: "", note: "", refundAmount: "" });
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const submitResolve = (e) => {
    e.preventDefault();
    const payload = { resolution: resolve.resolution, resolutionNote: resolve.note };
    if (resolve.resolution === "partial_split" && resolve.refundAmount) {
      payload.refundAmount = Number(resolve.refundAmount);
    }
    resolveMutation.mutate(payload);
  };

  const tabs = [
    { id: "artists", label: "Pending artists" },
    { id: "disputes", label: "Disputes" },
    { id: "analytics", label: "Analytics" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin panel</h1>
      <div className="mt-4 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === t.id
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {t.label}
            {t.id === "disputes" && analytics?.analytics?.openDisputes > 0 && (
              <span className="ml-1 rounded-full bg-red-600 px-1.5 text-xs text-white">
                {analytics.analytics.openDisputes}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {tab === "artists" && (
        <div className="mt-6 space-y-3">
          {loadingArtists && <p className="text-slate-400">Loading…</p>}
          {pending?.data.map((a) => (
            <div
              key={a._id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-semibold">{a.name}</p>
                <p className="text-sm text-slate-500">
                  {a.email} · {a.bio}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    verifyMutation.mutate({ id: a._id, verified: true })
                  }
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Verify
                </button>
                <button
                  onClick={() =>
                    verifyMutation.mutate({ id: a._id, verified: false })
                  }
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {pending && pending.data.length === 0 && (
            <p className="text-slate-500">No artists pending review.</p>
          )}
        </div>
      )}

      {tab === "disputes" && (
        <div className="mt-6 space-y-3">
          {disputes?.data.map((d) => (
            <div
              key={d._id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">
                  Order Rs.{d.orderId?.agreedPrice} — raised by {d.raisedBy?.name}
                </p>
                <StatusBadge status={d.status} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{d.reason}</p>

              {d.status !== "resolved" && resolve.id !== d._id ? (
                <button
                  onClick={() =>
                    setResolve((r) => ({
                      ...r,
                      id: d._id,
                      resolution: "",
                      note: "",
                      refundAmount: "",
                    }))
                  }
                  className="mt-3 rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white"
                >
                  Resolve
                </button>
              ) : (
                d.status !== "resolved" && (
                  <form
                    onSubmit={submitResolve}
                    className="mt-3 grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-2"
                  >
                    <select
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      value={resolve.resolution}
                      onChange={(e) =>
                        setResolve((r) => ({ ...r, resolution: e.target.value }))
                      }
                      required
                    >
                      <option value="">Choose outcome…</option>
                      <option value="release_to_artist">
                        Release escrow to artist
                      </option>
                      <option value="refund_buyer">Refund buyer</option>
                      <option value="partial_split">Partial split</option>
                    </select>
                    <input
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      placeholder="Note"
                      value={resolve.note}
                      onChange={(e) =>
                        setResolve((r) => ({ ...r, note: e.target.value }))
                      }
                    />
                    {resolve.resolution === "partial_split" && (
                      <input
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Refund amount (Rs.)"
                        type="number"
                        value={resolve.refundAmount}
                        onChange={(e) =>
                          setResolve((r) => ({
                            ...r,
                            refundAmount: e.target.value,
                          }))
                        }
                        required
                      />
                    )}
                    <div className="flex gap-2 sm:col-span-2">
                      <button
                        disabled={!resolve.resolution || resolveMutation.isPending}
                        className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white disabled:opacity-40"
                      >
                        {resolveMutation.isPending ? "Resolving…" : "Confirm"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setResolve((r) => ({ ...r, id: null }))
                        }
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )
              )}
            </div>
          ))}
          {disputes && disputes.data.length === 0 && (
            <p className="text-slate-500">No disputes.</p>
          )}
        </div>
      )}

      {tab === "analytics" && analytics && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: "Buyers", value: analytics.analytics.users.buyer ?? 0 },
            { label: "Artists", value: analytics.analytics.users.artist ?? 0 },
            { label: "Orders", value: Object.values(analytics.analytics.orders).reduce((a, b) => a + b, 0) },
            {
              label: "Escrow held",
              value: `Rs.${analytics.analytics.escrow.heldInEscrow.toLocaleString()}`,
            },
            {
              label: "Released to artists",
              value: `Rs.${analytics.analytics.escrow.releasedToArtists.toLocaleString()}`,
            },
            { label: "Refunded", value: `Rs.${analytics.analytics.escrow.refunded.toLocaleString()}` },
            {
              label: "Payouts paid",
              value: `${analytics.analytics.payouts.paidCount} · Rs.${analytics.analytics.payouts.paidTotal.toLocaleString()}`,
            },
            { label: "Open disputes", value: analytics.analytics.openDisputes },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-1 text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
