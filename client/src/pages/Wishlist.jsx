import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import ArtworkCard from "../components/ArtworkCard.jsx";

export default function Wishlist() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
  });
  const me = data?.user;
  const saved = me?.wishlist || [];

  if (isLoading) return <p className="text-ink-muted">Loading wishlist…</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;

  if (saved.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-200 p-12 text-center">
        <p className="font-display text-2xl font-bold">Your wishlist is empty</p>
        <p className="mt-2 text-ink-muted">
          Save the pieces you love, then decide later.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-full bg-brand-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
        >
          Explore the Shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold">Your Wishlist</h1>
      <p className="mb-6 text-ink-muted">
        {saved.length} saved piece{saved.length > 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {saved.map((artwork) => (
          <ArtworkCard
            key={artwork._id}
            artwork={artwork}
            me={me}
            onUnwish={() => queryClient.invalidateQueries({ queryKey: ["me"] })}
          />
        ))}
      </div>
    </div>
  );
}
