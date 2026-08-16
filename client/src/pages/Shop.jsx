import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import ArtworkCard from "../components/ArtworkCard.jsx";

const MEDIUMS = [
  "All",
  "Painting",
  "Photography",
  "Sculpture",
  "Drawing",
  "Print",
  "Mixed Media",
];

const SUBJECTS = [
  "All",
  "Abstract",
  "Landscape",
  "Portrait",
  "Figurative",
  "Still Life",
  "Botanical",
  "Wildlife",
  "Cityscape",
  "Spiritual",
  "Other",
];

const PAGE_SIZE = 12;

export default function Shop() {
  const { user } = useAuth();
  const [medium, setMedium] = useState("All");
  const [subject, setSubject] = useState("All");
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams();
  if (medium !== "All") params.set("medium", medium);
  if (subject !== "All") params.set("subject", subject);
  if (search.trim()) params.set("search", search.trim());
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  params.set("sort", sort);
  params.set("page", page);
  params.set("limit", PAGE_SIZE);

  const { data, isLoading, error } = useQuery({
    queryKey: ["artworks", params.toString()],
    queryFn: async () => (await api.get(`/artworks?${params}`)).data,
  });

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
    enabled: Boolean(user),
  });

  const resetPage = (fn) => (e) => {
    setPage(1);
    fn(e);
  };

  return (
    <div>
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-brand-700 p-8 text-white">
        <p className="text-xs font-semibold tracking-widest text-brand-200 uppercase">
          The Shop
        </p>
        <h1 className="mt-2 font-display text-3xl font-bold">
          Original art, directly from the artist
        </h1>
        <p className="mt-2 max-w-xl text-brand-100">
          Every work is verified, hand-made, and shipped in Chitra escrow — your
          payment only reaches the artist once you receive the piece.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-brand-50">
          <span className="rounded-full bg-white/10 px-3 py-1.5">
            &#10003; Escrow-protected checkout
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">
            &#10003; Artist-verified originals
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">
            &#10003; Secure shipping addresses
          </span>
        </div>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl border border-brand-100 bg-white p-4 sm:grid-cols-2 lg:grid-cols-6">
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm lg:col-span-2"
          placeholder="Search by title, style, or artist…"
          value={search}
          onChange={resetPage((e) => setSearch(e.target.value))}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={subject}
          onChange={resetPage((e) => setSubject(e.target.value))}
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s === "All" ? "All subjects" : s}
            </option>
          ))}
        </select>
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Min Rs."
          type="number"
          value={minPrice}
          onChange={resetPage((e) => setMinPrice(e.target.value))}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Max Rs."
          type="number"
          value={maxPrice}
          onChange={resetPage((e) => setMaxPrice(e.target.value))}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={sort}
          onChange={resetPage((e) => setSort(e.target.value))}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {MEDIUMS.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMedium(m);
              setPage(1);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              medium === m
                ? "bg-brand-800 text-white"
                : "border border-brand-200 bg-white text-ink-soft hover:border-brand-400 hover:text-brand-800"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-ink-muted">Loading the collection…</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      {data && data.data.length === 0 && (
        <div className="rounded-xl border border-dashed border-brand-200 p-10 text-center text-ink-muted">
          No artworks match your filters.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {data?.data.map((artwork) => (
          <ArtworkCard key={artwork._id} artwork={artwork} me={me?.user} />
        ))}
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Previous
          </button>
          <span className="px-3 text-sm text-ink-muted">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <button
            type="button"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-medium disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
