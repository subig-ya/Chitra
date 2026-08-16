import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";

export default function Home() {
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("rating");

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  params.set("sort", sort);

  const { data, isLoading, error } = useQuery({
    queryKey: ["artists", params.toString()],
    queryFn: async () => (await api.get(`/artists?${params}`)).data,
  });

  return (
    <div>
      <div className="mb-8 rounded-2xl bg-slate-900 p-8 text-white">
        <h1 className="text-3xl font-bold">
          Commission art from Nepal's artists
        </h1>
        <p className="mt-2 max-w-xl text-slate-300">
          No stock listings. You describe what you want, an artist quotes you,
          and your payment is held in escrow until you approve the work.
        </p>
      </div>

      <div className="mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-5">
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm lg:col-span-2"
          placeholder="Search artists by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Min price (Rs.)"
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Max price (Rs.)"
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="rating">Top rated</option>
          <option value="orders">Most orders</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {isLoading && <p className="text-slate-400">Loading artists…</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      {data && data.data.length === 0 && (
        <p className="text-slate-500">No artists match your filters.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.data.map((artist) => (
          <Link
            key={artist._id}
            to={`/artists/${artist._id}`}
            className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-amber-400 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                {artist.name.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{artist.name}</p>
                <p className="text-sm text-slate-500">
                  ★ {artist.artistProfile.rating.toFixed(1) || "—"} (
                  {artist.artistProfile.ratingCount} reviews) ·{" "}
                  {artist.artistProfile.totalOrders} orders
                </p>
              </div>
            </div>
            {artist.artistProfile.isVerified && (
              <span className="mt-3 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                Verified artist
              </span>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {artist.artistProfile.commissionPackages
                .slice(0, 3)
                .map((p) => (
                  <span
                    key={p._id}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {p.title} · Rs.{p.basePrice}
                  </span>
                ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
