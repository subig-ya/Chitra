import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../lib/api.js";

export default function Collections() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => (await api.get("/collections?featured=true")).data,
  });

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-widest text-brand-600 uppercase">
          Curated by Chitra
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">Collections</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          A hand-picked edit of works — moods, rooms, and budgets, chosen to
          make a first collection feel effortless.
        </p>
      </div>

      {isLoading && <p className="text-ink-muted">Loading collections…</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      <div className="grid gap-6 md:grid-cols-2">
        {data?.data.map((c) => (
          <Link
            key={c._id}
            to={`/collections/${c._id}`}
            className="group relative overflow-hidden rounded-2xl border border-brand-100"
          >
            <img
              src={c.coverImageUrl}
              alt={c.title}
              className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent" />
            <div className="absolute right-4 bottom-4 left-4 text-white">
              <h2 className="font-display text-2xl font-bold">{c.title}</h2>
              <p className="mt-0.5 text-sm text-white/85">{c.subtitle}</p>
              <p className="mt-2 text-xs font-medium text-white/70">
                {c.artworkCount} original work
                {c.artworkCount === 1 ? "" : "s"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
