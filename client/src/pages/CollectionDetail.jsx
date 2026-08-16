import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import ArtworkCard from "../components/ArtworkCard.jsx";

export default function CollectionDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ["collection", id],
    queryFn: async () => (await api.get(`/collections/${id}`)).data,
  });

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
    enabled: Boolean(user),
  });

  if (isLoading) return <p className="text-ink-muted">Loading collection…</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;

  const { collection, artworks } = data;

  return (
    <div>
      <Link
        to="/collections"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← All collections
      </Link>
      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <img
            src={collection.coverImageUrl}
            alt={collection.title}
            className="aspect-[4/5] w-full rounded-2xl border border-brand-100 object-cover"
          />
        </div>
        <div className="lg:col-span-2">
          <p className="text-sm font-semibold tracking-widest text-brand-600 uppercase">
            Curated collection
          </p>
          <h1 className="mt-1 font-display text-4xl font-bold">
            {collection.title}
          </h1>
          <p className="mt-2 text-lg text-ink-soft">{collection.subtitle}</p>
          <div className="mt-5 rounded-xl border border-brand-100 bg-white p-5">
            <p className="text-sm font-semibold text-brand-800">
              Curator's note
            </p>
            <p className="mt-2 leading-relaxed text-ink-soft">
              {collection.curatorNote || "A hand-picked selection of original works."}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="mb-4 font-display text-2xl font-bold">
          In this collection · {artworks.length}
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork._id}
              artwork={{
                ...artwork,
                artistName: artwork.artistId?.name,
              }}
              me={me?.user}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
