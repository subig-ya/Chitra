import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import api from "../lib/api.js";

export default function StoryDetail() {
  const { id } = useParams();

  const { data, isLoading, error } = useQuery({
    queryKey: ["story", id],
    queryFn: async () => (await api.get(`/stories/${id}`)).data,
  });

  if (isLoading) return <p className="text-ink-muted">Loading story…</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;

  const story = data.story;

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        to="/stories"
        className="text-sm font-semibold text-brand-700 hover:underline"
      >
        ← All stories
      </Link>
      <p className="mt-6 text-sm font-semibold tracking-widest text-brand-600 uppercase">
        {story.category}
      </p>
      <h1 className="mt-2 font-display text-4xl font-bold leading-tight">
        {story.title}
      </h1>
      <p className="mt-3 text-lg text-ink-soft">{story.excerpt}</p>

      <img
        src={story.coverImageUrl}
        alt={story.title}
        className="mt-8 aspect-[16/9] w-full rounded-2xl border border-brand-100 object-cover"
      />

      <div className="mt-8 whitespace-pre-line leading-relaxed text-ink">
        {story.content}
      </div>

      <div className="mt-10 rounded-2xl bg-gradient-to-r from-brand-900 to-brand-700 p-6 text-center text-white">
        <p className="font-display text-xl font-bold">
          Find the piece that speaks to you
        </p>
        <Link
          to="/shop"
          className="mt-3 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-brand-900 hover:bg-brand-50"
        >
          Browse the Shop
        </Link>
      </div>
    </article>
  );
}
