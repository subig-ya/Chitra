import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api, { apiErrorMessage } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import ArtworkCard, { useWishlist } from "../components/ArtworkCard.jsx";

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

const SECURITY = [
  {
    title: "Escrow-secured",
    text: "Your payment is held by Chitra until you approve the delivery.",
  },
  {
    title: "Verified artist",
    text: "This artist's identity and work history are verified by our team.",
  },
  {
    title: "Fast, tracked delivery",
    text: "Works ship across Nepal with insured, trackable courier.",
  },
];

function DetailsRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export default function ArtworkDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { inWishlist, toggle } = useWishlist();

  const { data, isLoading, error: loadError } = useQuery({
    queryKey: ["artwork", id],
    queryFn: async () => (await api.get(`/artworks/${id}`)).data,
  });
  const artwork = data?.artwork;

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
    enabled: Boolean(user),
  });

  const artistId = artwork?.artistId?._id || artwork?.artistId;

  const { data: more } = useQuery({
    queryKey: ["artworks", "artist", artistId],
    queryFn: async () =>
      (await api.get(`/artworks?artistId=${artistId}&limit=8`)).data,
    enabled: Boolean(artistId),
  });

  const isFave = inWishlist(id, me?.user);
  const isMine = user && artistId === user._id;
  const canBuy =
    artwork?.availability === "available" &&
    artwork?.isVerified &&
    artwork?.isActive &&
    !isMine;

  const addToCart = useMutation({
    mutationFn: async () => {
      await api.post("/cart/items", { artworkId: id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setBusy(false);
    },
    onError: (err) => setError(apiErrorMessage(err, "Could not add to cart")),
  });

  const buyNow = () => {
    if (!user) {
      navigate("/login", { state: { from: `/artworks/${id}` } });
      return;
    }
    setError("");
    setBusy(true);
    addToCart.mutate(undefined, {
      onSuccess: () => navigate("/checkout"),
      onSettled: () => setBusy(false),
    });
  };

  if (isLoading) return <p className="text-ink-muted">Loading artwork…</p>;
  if (loadError)
    return <p className="text-red-600">Could not load this artwork.</p>;

  const artist = artwork.artistId;

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-brand-100">
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className="aspect-[4/5] w-full object-cover"
            />
            {artwork.availability !== "available" && (
              <span className="absolute top-4 left-4 rounded-full bg-slate-900/85 px-4 py-1.5 text-sm font-semibold text-white uppercase tracking-wide">
                {artwork.availability}
              </span>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold tracking-widest text-brand-600 uppercase">
            {artwork.medium}
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold leading-tight">
            {artwork.title}
          </h1>

          {artist && (
            <Link
              to={`/artists/${artist._id}`}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white py-1.5 pr-4 pl-1.5 text-sm font-medium hover:border-brand-300"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-800 text-xs font-bold text-white">
                {(artist.name || "A").charAt(0)}
              </span>
              {artist.name}
              {artist.artistProfile?.isVerified && (
                <span className="text-xs text-emerald-600">&#10003;</span>
              )}
            </Link>
          )}

          <p className="mt-6 font-display text-3xl font-bold text-brand-800">
            {rs(artwork.price)}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Free shipping within Kathmandu valley
          </p>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={buyNow}
              disabled={!canBuy || busy}
              className="rounded-full bg-brand-800 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Adding…" : "Buy Now"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  navigate("/login", { state: { from: `/artworks/${id}` } });
                  return;
                }
                setError("");
                addToCart.mutate(undefined);
              }}
              disabled={!canBuy}
              className="rounded-full border border-brand-300 px-8 py-3 text-sm font-semibold text-brand-800 transition hover:border-brand-800 hover:bg-brand-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={() =>
                user
                  ? toggle({ artworkId: id, remove: isFave })
                  : navigate("/login", { state: { from: `/artworks/${id}` } })
              }
              className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition ${
                isFave
                  ? "border-brand-800 bg-brand-800 text-white"
                  : "border-brand-300 text-brand-800 hover:border-brand-800"
              }`}
            >
              {isFave ? "\u2665 Saved" : "\u2661 Save"}
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-brand-100 bg-white p-4 text-sm">
            <p className="font-semibold">About this piece</p>
            <p className="mt-2 leading-relaxed text-ink-soft">
              {artwork.description || "No description provided by the artist."}
            </p>
          </div>

          <div className="mt-6 rounded-xl border border-brand-100 bg-white px-5 py-3">
            <p className="pt-1 text-sm font-semibold">Details</p>
            <div className="mt-2 divide-y divide-brand-50">
              <DetailsRow label="Artist" value={artist?.name} />
              <DetailsRow label="Medium" value={artwork.medium} />
              <DetailsRow label="Subject" value={artwork.subject} />
              <DetailsRow label="Style" value={artwork.style} />
              <DetailsRow
                label="Dimensions"
                value={
                  artwork.depthCm
                    ? `${artwork.widthCm} × ${artwork.heightCm} × ${artwork.depthCm} cm`
                    : `${artwork.widthCm} × ${artwork.heightCm} cm`
                }
              />
              <DetailsRow label="Created" value={artwork.yearCreated} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {canBuy && (
              <Link
                to={`/messages?artistId=${artistId}`}
                className="rounded-full border border-brand-200 px-6 py-2.5 text-sm font-semibold text-brand-800 hover:border-brand-400"
              >
                Ask the artist a question
              </Link>
            )}
            <Link
              to={`/artists/${artistId}#commission`}
              className="rounded-full border border-brand-200 px-6 py-2.5 text-sm font-semibold text-brand-800 hover:border-brand-400"
            >
              Commission a piece like this
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {SECURITY.map((s) => (
              <div
                key={s.title}
                className="rounded-xl border border-brand-100 bg-white p-4"
              >
                <p className="text-sm font-semibold text-brand-800">
                  {s.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {more && more.data.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-4 font-display text-2xl font-bold">
            More from {artist?.name || "this artist"}
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {more.data
              .filter((a) => a._id !== artwork._id)
              .slice(0, 4)
              .map((a) => (
                <ArtworkCard key={a._id} artwork={a} me={me?.user} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
