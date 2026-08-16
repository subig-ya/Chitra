import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

export function HeartIcon({ filled, className = "h-4 w-4", strokeWidth = 1.6 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  );
}

export function useWishlist() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ artworkId, remove }) => {
      if (remove) {
        await api.delete(`/users/me/wishlist/${artworkId}`);
      } else {
        await api.post("/users/me/wishlist", { artworkId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const inWishlist = (artworkId, me) =>
    Array.isArray(me?.wishlist) &&
    me.wishlist.some((w) => String(w._id || w) === String(artworkId));

  return { user, inWishlist, toggle: mutation.mutate, ...mutation };
}

export default function ArtworkCard({ artwork, me, onUnwish }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const { inWishlist, toggle } = useWishlist();

  const isFave = inWishlist(artwork._id, me);

  const addToCart = async () => {
    if (!user) {
      navigate("/login", { state: { from: `/artworks/${artwork._id}` } });
      return;
    }
    setAdding(true);
    setError("");
    try {
      await api.post("/cart/items", { artworkId: artwork._id });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (err) {
      setError(apiErrorMessage(err, "Could not add to cart"));
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-xl border border-brand-100 bg-white p-3 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-200/40">
      <Link to={`/artworks/${artwork._id}`} className="relative block overflow-hidden rounded-lg">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          loading="lazy"
          className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </Link>

      {user && (
        <button
          type="button"
          onClick={() => {
            toggle({
              artworkId: artwork._id,
              remove: isFave,
            });
            if (isFave && onUnwish) onUnwish();
          }}
          className={`absolute top-4 right-4 rounded-full p-2 backdrop-blur-sm transition ${
            isFave
              ? "bg-brand-800 text-white"
              : "bg-white/80 text-ink-muted hover:text-brand-700"
          }`}
          aria-label={isFave ? "Remove from wishlist" : "Add to wishlist"}
        >
          <span key={String(isFave)} className={isFave ? "heart-pop block" : "block"}>
            <HeartIcon filled={isFave} />
          </span>
        </button>
      )}

      <div className="flex flex-1 flex-col px-2 pt-4 pb-1">
        <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
          {artwork.medium}
        </p>
        <Link
          to={`/artworks/${artwork._id}`}
          className="mt-1 font-display text-lg font-semibold leading-tight hover:text-brand-700"
        >
          {artwork.title}
        </Link>
        <p className="mt-0.5 text-sm text-ink-soft">
          {artwork.artistName || "Chitra artist"}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-brand-100 pt-3">
          <p className="font-semibold text-brand-800">{rs(artwork.price)}</p>
          <button
            type="button"
            onClick={addToCart}
            disabled={adding}
            className="rounded-full border border-brand-300 px-3 py-1 text-xs font-semibold text-brand-800 transition hover:border-brand-800 hover:bg-brand-800 hover:text-white disabled:opacity-50"
          >
            {adding ? "Adding…" : "Add to Cart"}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
