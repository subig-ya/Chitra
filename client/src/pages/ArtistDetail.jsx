import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { apiErrorMessage } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

export default function ArtistDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["artist", id],
    queryFn: async () => (await api.get(`/artists/${id}`)).data,
  });

  const { data: artworksData, isLoading: loadingArt } = useQuery({
    queryKey: ["artist-artworks", id],
    queryFn: async () =>
      (await api.get(`/artworks?artistId=${id}&limit=60&sort=newest`)).data,
  });

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
    enabled: Boolean(user),
  });
  const wishlistIds = new Set(
    (me?.user?.wishlist || []).map((w) => (typeof w === "string" ? w : w._id))
  );

  const toggleWish = useMutation({
    mutationFn: async ({ artworkId, isWished }) =>
      isWished
        ? api.delete(`/users/me/wishlist/${artworkId}`)
        : api.post("/users/me/wishlist", { artworkId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
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

  if (isLoading) return <p className="text-ink-muted py-12">Loading artist…</p>;
  if (error) return <p className="text-red-600 py-12">{error.message}</p>;

  const artist = data.artist;
  const profile = artist.artistProfile || {};
  const artworks = artworksData?.data || [];

  return (
    <div className="space-y-10">
      {/* artist header */}
      <section className="flex flex-wrap items-start gap-6">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-rose-soft bg-blush">
          {artist.avatar ? (
            <img src={artist.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="font-display text-2xl font-semibold text-plum">
              {artist.name.charAt(0)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-3xl font-semibold text-plum">{artist.name}</h1>
          {profile.specialty && (
            <p className="mt-1 text-sm text-ink-soft">{profile.specialty}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
            {profile.rating > 0 && (
              <span>★ {profile.rating?.toFixed(1)}</span>
            )}
            {profile.ratingCount > 0 && <span>{profile.ratingCount} reviews</span>}
            {profile.totalOrders > 0 && <span>{profile.totalOrders} orders</span>}
            {profile.isVerified && (
              <span className="rounded-full bg-lavender/70 px-2.5 py-0.5 text-xs font-medium text-plum">
                Verified
              </span>
            )}
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-soft">
            {profile.bio || artist.bio || "This artist hasn't written a bio yet."}
          </p>
        </div>
      </section>

      {/* commission packages + request form */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-plum">Commission packages</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {profile.commissionPackages?.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => setPackageId(p._id)}
                className={`rounded-xl border p-4 text-left transition ${
                  packageId === p._id
                    ? "border-rose bg-blush/40"
                    : "border-plum/10 bg-ivory hover:border-rose/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="font-semibold text-plum">{p.title}</p>
                  <p className="text-sm font-semibold text-rose">{rs(p.basePrice)}</p>
                </div>
                {p.description && (
                  <p className="mt-1 text-sm text-ink-soft">{p.description}</p>
                )}
                <p className="mt-2 text-xs text-ink-muted">
                  {p.turnaroundDays} days · {p.revisionLimit} revisions
                </p>
              </button>
            ))}
            {!profile.commissionPackages?.length && (
              <p className="text-sm text-ink-muted">No packages listed yet.</p>
            )}
          </div>
        </div>

        <form
          onSubmit={submit}
          className="h-fit rounded-xl border border-plum/10 bg-ivory p-5"
        >
          <h2 className="font-display text-lg font-semibold text-plum">Request a commission</h2>
          <div className="mt-4 space-y-3">
            {formError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
            )}
            <label className="block">
              <span className="text-xs font-medium text-ink-muted">Package (optional)</span>
              <select
                className="mt-1 w-full rounded-lg border border-plum/20 bg-white px-3 py-2 text-sm text-plum focus:border-rose focus:ring-2 focus:ring-blush focus:outline-none"
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
              >
                <option value="">Custom request</option>
                {profile.commissionPackages?.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} — {rs(p.basePrice)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-ink-muted">Your brief *</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-plum/20 bg-white px-3 py-2 text-sm text-plum placeholder:text-ink-muted focus:border-rose focus:ring-2 focus:ring-blush focus:outline-none"
                rows={4}
                placeholder="Describe the artwork, style, size, mood…"
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                required
                minLength={10}
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-ink-muted">Reference URLs (comma separated)</span>
              <input
                className="mt-1 w-full rounded-lg border border-plum/20 bg-white px-3 py-2 text-sm text-plum placeholder:text-ink-muted focus:border-rose focus:ring-2 focus:ring-blush focus:outline-none"
                placeholder="https://…"
                value={refImages}
                onChange={(e) => setRefImages(e.target.value)}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-ink-muted">Budget min</span>
                <input
                  className="mt-1 w-full rounded-lg border border-plum/20 bg-white px-3 py-2 text-sm text-plum focus:border-rose focus:ring-2 focus:ring-blush focus:outline-none"
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-ink-muted">Budget max</span>
                <input
                  className="mt-1 w-full rounded-lg border border-plum/20 bg-white px-3 py-2 text-sm text-plum focus:border-rose focus:ring-2 focus:ring-blush focus:outline-none"
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value)}
                />
              </label>
            </div>
            <button
              disabled={requestMutation.isPending}
              className="w-full rounded-lg bg-plum py-2.5 text-sm font-medium text-white transition hover:bg-plum-700 disabled:opacity-60"
            >
              {requestMutation.isPending
                ? "Sending…"
                : user
                  ? "Send commission request"
                  : "Log in to request"}
            </button>
          </div>
        </form>
      </section>

      {/* artwork gallery */}
      <section>
        <div className="mb-5">
          <h2 className="font-display text-xl font-semibold text-plum">
            Artworks by {artist.name}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">
            {artworks.length} {artworks.length === 1 ? "piece" : "pieces"} available.
          </p>
        </div>

        {loadingArt ? (
          <p className="text-ink-muted">Loading artworks…</p>
        ) : artworks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-plum/20 bg-ivory p-12 text-center text-sm text-ink-muted">
            This artist hasn't listed any artworks yet.
          </p>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {artworks.map((a, i) => {
              const aspects = ["4/5", "3/4", "1/1", "4/5", "3/4", "5/4"];
              return (
                <div key={a._id} className="mb-4 break-inside-avoid">
                  <Link to={`/artworks/${a._id}`} className="group block overflow-hidden rounded-xl">
                    <div
                      className="relative overflow-hidden"
                      style={{ aspectRatio: aspects[i % aspects.length] }}
                    >
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWish.mutate({
                            artworkId: a._id,
                            isWished: wishlistIds.has(a._id),
                          });
                        }}
                        className={`absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition-all duration-200 ${
                          wishlistIds.has(a._id)
                            ? "bg-rose/90 text-white scale-110"
                            : "bg-white/80 text-plum-600/70 hover:bg-white hover:text-rose"
                        }`}
                      >
                        <svg viewBox="0 0 24 24" fill={wishlistIds.has(a._id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                        </svg>
                      </button>
                    </div>
                  </Link>
                  <div className="mt-2.5 px-0.5">
                    <Link to={`/artworks/${a._id}`}>
                      <h3 className="truncate text-sm font-semibold text-plum transition-colors hover:text-rose">
                        {a.title}
                      </h3>
                    </Link>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-ink-muted">{a.medium}</p>
                      <p className="text-sm font-semibold text-plum">{rs(a.price)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
