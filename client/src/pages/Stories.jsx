import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "../lib/api.js";

export default function Stories() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => (await api.get("/stories")).data,
  });

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-widest text-brand-600 uppercase">
          The Journal
        </p>
        <h1 className="mt-1 font-display text-3xl font-bold">Stories</h1>
        <p className="mt-2 max-w-xl text-ink-soft">
          Guides, artist features, and ideas for living with original art.
        </p>
      </div>

      {isLoading && <p className="text-ink-muted">Loading stories…</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.data.map((story) => (
          <Link
            key={story._id}
            to={`/stories/${story.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white transition hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-200/40"
          >
            <img
              src={story.coverImageUrl}
              alt={story.title}
              className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase">
                {story.category}
              </p>
              <h2 className="mt-1 font-display text-xl font-bold leading-snug group-hover:text-brand-700">
                {story.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-ink-soft">
                {story.excerpt}
              </p>
              <p className="mt-auto pt-4 text-sm font-semibold text-brand-700">
                Read story →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
