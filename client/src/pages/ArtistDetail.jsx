import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { apiErrorMessage } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

export default function ArtistDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["artist", id],
    queryFn: async () => (await api.get(`/artists/${id}`)).data,
  });

  const [packageId, setPackageId] = useState("");
  const [brief, setBrief] = useState("");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [refImages, setRefImages] = useState("");
  const [formError, setFormError] = useState("");

  const requestMutation = useMutation({
    mutationFn: (payload) => api.post("/requests", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requests"] });
      navigate("/requests");
    },
    onError: (err) => setFormError(apiErrorMessage(err)),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login", { state: { from: `/artists/${id}` } });
      return;
    }
    setFormError("");
    const payload = { artistId: id, briefDescription: brief };
    if (packageId) payload.packageId = packageId;
    if (refImages.trim()) {
      payload.referenceImages = refImages
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    if (budgetMin || budgetMax) {
      payload.budgetRange = {
        ...(budgetMin ? { min: Number(budgetMin) } : {}),
        ...(budgetMax ? { max: Number(budgetMax) } : {}),
      };
    }
    requestMutation.mutate(payload);
  };

  if (isLoading) return <p className="text-slate-400">Loading artist…</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;

  const artist = data.artist;
  const profile = artist.artistProfile || {};

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-2xl font-bold text-white">
              {artist.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{artist.name}</h1>
              <p className="text-sm text-slate-500">
                ★ {profile.rating || "—"} · {profile.ratingCount} reviews ·{" "}
                {profile.totalOrders} orders
                {profile.isVerified && " · Verified"}
              </p>
            </div>
          </div>
          <p className="mt-4 text-sm text-slate-600">
            {profile.bio || artist.bio || "This artist hasn't written a bio yet."}
          </p>
        </div>

        <h2 className="mt-8 text-lg font-semibold">Commission packages</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {profile.commissionPackages?.map((p) => (
            <button
              key={p._id}
              onClick={() => setPackageId(p._id)}
              className={`rounded-xl border p-4 text-left transition ${
                packageId === p._id
                  ? "border-amber-500 bg-amber-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <p className="font-semibold">{p.title}</p>
                <p className="font-bold text-amber-600">Rs.{p.basePrice}</p>
              </div>
              {p.description && (
                <p className="mt-1 text-sm text-slate-500">{p.description}</p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                {p.turnaroundDays} days · {p.revisionLimit} revisions
              </p>
            </button>
          ))}
          {!profile.commissionPackages?.length && (
            <p className="text-sm text-slate-500">No packages listed yet.</p>
          )}
        </div>
      </div>

      <form
        onSubmit={submit}
        className="h-fit rounded-xl border border-slate-200 bg-white p-6"
      >
        <h2 className="text-lg font-semibold">Request a commission</h2>
        <div className="mt-4 space-y-3">
          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}
          <label className="block">
            <span className="text-sm font-medium">Package (optional)</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={packageId}
              onChange={(e) => setPackageId(e.target.value)}
            >
              <option value="">Custom request</option>
              {profile.commissionPackages?.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.title} — Rs.{p.basePrice}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium">Your brief *</span>
            <textarea
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              rows={5}
              placeholder="Describe the artwork, style, size, mood, deadlines…"
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              required
              minLength={10}
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium">
              Reference image URLs (comma separated)
            </span>
            <input
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              placeholder="https://…"
              value={refImages}
              onChange={(e) => setRefImages(e.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium">Budget min</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                type="number"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Budget max</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                type="number"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </label>
          </div>
          <button
            disabled={requestMutation.isPending}
            className="w-full rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {requestMutation.isPending
              ? "Sending…"
              : user
                ? "Send commission request"
                : "Log in to request"}
          </button>
        </div>
      </form>
    </div>
  );
}
