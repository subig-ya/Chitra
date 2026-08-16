import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api, { apiErrorMessage } from "../lib/api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { timeAgo } from "../lib/time.js";

const REPORT_CATEGORY_LABELS = {
  harassment: "Harassment or abuse",
  late_payment: "Late or non-payment",
  misuse_of_work: "Misuse of work",
  no_show: "No-show / ghosting",
  false_claim: "False claim about delivery",
  other: "Other",
};

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

  const { data: pendingArtworks } = useQuery({
    queryKey: ["admin", "pending-artworks"],
    queryFn: async () => (await api.get("/admin/artworks/pending")).data,
  });

  const { data: advisory } = useQuery({
    queryKey: ["admin", "advisory"],
    queryFn: async () => (await api.get("/admin/advisory")).data,
  });

  const { data: collections } = useQuery({
    queryKey: ["admin", "collections"],
    queryFn: async () => (await api.get("/collections")).data,
  });

  const [collectionForm, setCollectionForm] = useState({
    title: "",
    subtitle: "",
    curatorNote: "",
    coverImageUrl: "",
    isFeatured: true,
  });

  const [reportFilter, setReportFilter] = useState("new");

  const { data: reports } = useQuery({
    queryKey: ["admin", "reports", reportFilter],
    queryFn: async () =>
      (
        await api.get("/admin/reports", {
          params: { status: reportFilter || undefined },
        })
      ).data,
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

  const verifyArtwork = useMutation({
    mutationFn: ({ id, verified }) =>
      api.patch(`/admin/artworks/${id}/verify`, { verified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-artworks"] });
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const setAdvisoryStatus = useMutation({
    mutationFn: ({ id, status }) =>
      api.patch(`/admin/advisory/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "advisory"] }),
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const saveCollection = useMutation({
    mutationFn: async (payload) =>
      (await api.post("/admin/collections", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setCollectionForm({
        title: "",
        subtitle: "",
        curatorNote: "",
        coverImageUrl: "",
        isFeatured: true,
      });
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const deleteCollection = useMutation({
    mutationFn: async (id) => (await api.delete(`/admin/collections/${id}`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const [reportNote, setReportNote] = useState({});
  const updateReport = useMutation({
    mutationFn: ({ id, status, resolutionNote }) =>
      api.patch(`/admin/reports/${id}/status`, { status, resolutionNote }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      setReportNote({});
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const tabs = [
    { id: "artists", label: "Pending artists" },
    { id: "artworks", label: "Artwork review" },
    { id: "disputes", label: "Disputes" },
    { id: "reports", label: "Reports" },
    { id: "advisory", label: "Advisory" },
    { id: "collections", label: "Collections" },
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

      {tab === "artworks" && (
        <div className="mt-6 space-y-3">
          {pendingArtworks?.data.map((a) => (
            <div
              key={a._id}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4"
            >
              <img
                src={a.imageUrl}
                alt={a.title}
                className="h-16 w-14 rounded-lg object-cover"
              />
              <div className="flex-1">
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-slate-500">
                  by {a.artistId?.name || "Unknown"} · {a.medium} · Rs.{a.price}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-slate-400">
                  {a.description}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => verifyArtwork.mutate({ id: a._id, verified: true })}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => verifyArtwork.mutate({ id: a._id, verified: false })}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {pendingArtworks && pendingArtworks.data.length === 0 && (
            <p className="text-slate-500">No artworks pending review.</p>
          )}
        </div>
      )}

      {tab === "advisory" && (
        <div className="mt-6 space-y-3">
          {advisory?.data.map((r) => (
            <div key={r._id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {r.name} ({r.email})
                  </p>
                  <p className="text-sm text-slate-500">
                    {r.room} · {r.budgetMin && `Rs.${r.budgetMin}`}
                    {r.budgetMin && r.budgetMax && " – "}
                    {r.budgetMax && `Rs.${r.budgetMax}`}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{r.message}</p>
              {r.note && (
                <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  Note: {r.note}
                </p>
              )}
              <div className="mt-3 flex gap-2">
                {["new", "contacted", "closed"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setAdvisoryStatus.mutate({ id: r._id, status: s })}
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      r.status === s
                        ? "bg-slate-900 text-white"
                        : "border border-slate-300 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {advisory && advisory.data.length === 0 && (
            <p className="text-slate-500">No advisory requests yet.</p>
          )}
        </div>
      )}

      {tab === "collections" && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <p className="font-semibold">Create collection</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveCollection.mutate(collectionForm);
              }}
              className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Title"
                required
                value={collectionForm.title}
                onChange={(e) =>
                  setCollectionForm((f) => ({ ...f, title: e.target.value }))
                }
              />
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Subtitle"
                value={collectionForm.subtitle}
                onChange={(e) =>
                  setCollectionForm((f) => ({ ...f, subtitle: e.target.value }))
                }
              />
              <textarea
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Curator's note"
                rows={3}
                value={collectionForm.curatorNote}
                onChange={(e) =>
                  setCollectionForm((f) => ({ ...f, curatorNote: e.target.value }))
                }
              />
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Cover image URL"
                required
                value={collectionForm.coverImageUrl}
                onChange={(e) =>
                  setCollectionForm((f) => ({ ...f, coverImageUrl: e.target.value }))
                }
              />
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={collectionForm.isFeatured}
                  onChange={(e) =>
                    setCollectionForm((f) => ({ ...f, isFeatured: e.target.checked }))
                  }
                />
                Featured on the Collections page
              </label>
              <button
                type="submit"
                disabled={saveCollection.isPending}
                className="w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                {saveCollection.isPending ? "Creating…" : "Create collection"}
              </button>
            </form>
          </div>
          <div className="space-y-3">
            {collections?.data.map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={c.coverImageUrl}
                    alt={c.title}
                    className="h-14 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold">{c.title}</p>
                    <p className="text-sm text-slate-500">
                      {c.artworkCount} works ·{" "}
                      {c.isFeatured ? "featured" : "not featured"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm(`Remove "${c.title}"?`))
                      deleteCollection.mutate(c._id);
                  }}
                  className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
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

      {tab === "reports" && (
        <div className="mt-6">
          <div className="flex gap-2">
            {["new", "reviewed", "resolved", ""].map((s) => (
              <button
                key={s || "all"}
                onClick={() => setReportFilter(s)}
                className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${
                  reportFilter === s
                    ? "bg-slate-900 text-white"
                    : "border border-slate-300 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {s || "all"}
              </button>
            ))}
          </div>

          <div className="mt-4 space-y-3">
            {reports?.data.map((r) => (
              <div key={r._id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">
                      {r.reporterId?.name} → {r.reportedUserId?.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {REPORT_CATEGORY_LABELS[r.category] || r.category} ·{" "}
                      {timeAgo(r.createdAt)}
                      {r.orderId && ` · Order: ${r.orderId.packageTitle || r.orderId._id}`}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{r.description}</p>
                {r.resolutionNote && (
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    Note: {r.resolutionNote}
                  </p>
                )}
                {r.status !== "resolved" && (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm sm:max-w-sm"
                      placeholder="Resolution note (optional)"
                      value={reportNote[r._id] || ""}
                      onChange={(e) =>
                        setReportNote((n) => ({ ...n, [r._id]: e.target.value }))
                      }
                    />
                    {["reviewed", "resolved"].map((s) => (
                      <button
                        key={s}
                        onClick={() =>
                          updateReport.mutate({
                            id: r._id,
                            status: s,
                            resolutionNote: reportNote[r._id]?.trim() || undefined,
                          })
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                          s === "resolved"
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "border border-slate-300 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {reports && reports.data.length === 0 && (
              <p className="text-slate-500">No reports with this status.</p>
            )}
          </div>
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
