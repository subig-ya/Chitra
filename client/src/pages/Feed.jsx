import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

const STYLES = [
  "Abstract", "Contemporary", "Traditional", "Minimal", "Surreal",
  "Portrait", "Landscape", "Botanical", "Photography", "Watercolor",
  "Sculpture", "Mixed Media",
];

const ASPECTS = ["4/5", "3/4", "1/1", "4/5", "3/4", "5/4", "4/5", "1/1"];

/* ── tiny icons ── */
const Heart = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-ink-muted">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const Arrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="inline-block h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ════════════════════════════════════════════════
   MAIN FEED
   ════════════════════════════════════════════════ */
export default function Feed() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [styleFilter, setStyleFilter] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  /* ── queries ── */
  const { data: artworkData, isLoading } = useQuery({
    queryKey: ["feed-artworks"],
    queryFn: async () => (await api.get("/artworks?limit=60&sort=newest")).data,
  });
  const artworks = artworkData?.data || [];

  const { data: artistData } = useQuery({
    queryKey: ["feed-artists"],
    queryFn: async () => (await api.get("/artists?limit=12&sort=rating")).data,
  });
  const artists = artistData?.data || [];

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
    enabled: Boolean(user),
  });
  const wishlistIds = useMemo(
    () => new Set((me?.user?.wishlist || []).map((w) => (typeof w === "string" ? w : w._id))),
    [me]
  );

  /* ── wishlist toggle ── */
  const toggleWish = useMutation({
    mutationFn: async ({ id, isWished }) =>
      isWished
        ? api.delete(`/users/me/wishlist/${id}`)
        : api.post("/users/me/wishlist", { artworkId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  /* ── search autocomplete data ── */
  const searchLower = search.toLowerCase().trim();
  const matchedStyles = searchLower
    ? STYLES.filter((s) => s.toLowerCase().includes(searchLower))
    : [];
  const matchedArtists = searchLower
    ? artists.filter((a) => a.name.toLowerCase().includes(searchLower)).slice(0, 3)
    : [];
  const matchedArtworks = searchLower
    ? artworks
        .filter(
          (a) =>
            a.title.toLowerCase().includes(searchLower) ||
            (a.artistName || "").toLowerCase().includes(searchLower)
        )
        .slice(0, 3)
    : [];
  const showSuggestions = searchFocused && searchLower && (matchedStyles.length || matchedArtists.length || matchedArtworks.length);

  /* ── filtered feed ── */
  const filtered = useMemo(() => {
    let list = artworks;
    if (styleFilter) {
      const needle = styleFilter.toLowerCase();
      list = list.filter(
        (a) =>
          (a.subject || "").toLowerCase() === needle ||
          (a.style || "").toLowerCase().includes(needle) ||
          (a.medium || "").toLowerCase().includes(needle)
      );
    }
    return list;
  }, [artworks, styleFilter]);

  const recentArtworks = filtered.slice(0, 16);
  const freshArtworks = filtered.slice(16, 28);

  return (
    <div className="space-y-16">
      {/* ─── SEARCH HERO ─── */}
      <section className="pt-4 text-center">
        <p className="text-[0.65rem] font-medium tracking-[0.38em] text-rose uppercase">
          Discover
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-plum sm:text-4xl lg:text-5xl">
          Art worth looking twice at.
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-soft">
          Explore original works, emerging artists, and styles selected for you.
        </p>

        {/* search */}
        <div className="relative mx-auto mt-8 max-w-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <SearchIcon />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
            placeholder="Search artwork, style, artist, subject..."
            className="w-full rounded-xl border border-plum/15 bg-white py-3.5 pl-12 pr-4 text-sm text-plum shadow-sm placeholder:text-ink-muted focus:border-rose/40 focus:ring-2 focus:ring-blush focus:outline-none"
          />

          {/* autocomplete dropdown */}
          {showSuggestions && (
            <div className="absolute top-full left-0 z-20 mt-2 w-full overflow-hidden rounded-xl border border-plum/10 bg-white shadow-xl">
              {matchedStyles.length > 0 && (
                <div className="p-3">
                  <p className="mb-2 px-1 text-[10px] font-semibold tracking-wider text-ink-muted uppercase">Styles</p>
                  <div className="flex flex-wrap gap-1.5">
                    {matchedStyles.map((s) => (
                      <Link
                        key={s}
                        to="/shop"
                        onClick={() => { setStyleFilter(s); setSearch(""); }}
                        className="rounded-full border border-plum/15 bg-ivory px-3 py-1 text-xs font-medium text-plum transition hover:bg-lavender/50"
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {matchedArtists.length > 0 && (
                <div className="border-t border-plum/5 p-3">
                  <p className="mb-2 px-1 text-[10px] font-semibold tracking-wider text-ink-muted uppercase">Artists</p>
                  {matchedArtists.map((a) => (
                    <Link key={a._id} to={`/artists/${a._id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-blush/50">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-lavender/70 text-xs font-semibold text-plum">
                        {a.avatar ? <img src={a.avatar} alt="" className="h-full w-full object-cover" /> : a.name.charAt(0)}
                      </span>
                      <span className="truncate text-sm font-medium text-plum">{a.name}</span>
                    </Link>
                  ))}
                </div>
              )}
              {matchedArtworks.length > 0 && (
                <div className="border-t border-plum/5 p-3">
                  <p className="mb-2 px-1 text-[10px] font-semibold tracking-wider text-ink-muted uppercase">Artwork</p>
                  {matchedArtworks.map((a) => (
                    <Link key={a._id} to={`/artworks/${a._id}`} className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-blush/50">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-lavender/50">
                        <img src={a.imageUrl} alt="" className="h-full w-full object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-plum">{a.title}</span>
                        <span className="block text-[11px] text-ink-muted">{a.artistName}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── EXPLORE BY STYLE ─── */}
      <section>
        <h2 className="mb-4 font-display text-lg font-semibold text-plum">Explore by style</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setStyleFilter("")}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
              !styleFilter
                ? "border-plum bg-plum text-white"
                : "border-plum/15 text-plum-600/70 hover:border-rose/40 hover:text-plum"
            }`}
          >
            All
          </button>
          {STYLES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStyleFilter(styleFilter === s ? "" : s)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                styleFilter === s
                  ? "border-plum bg-plum text-white"
                  : "border-plum/15 text-plum-600/70 hover:border-rose/40 hover:text-plum"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* ─── RECOMMENDED ARTWORKS ─── */}
      <section>
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold text-plum">Recommended for you</h2>
            <p className="mt-1 text-sm text-ink-soft">Original works curated for your taste.</p>
          </div>
          <Link to="/shop" className="group text-sm font-medium text-rose transition hover:text-plum">
            View all <Arrow />
          </Link>
        </div>

        {isLoading ? (
          <p className="text-ink-muted">Loading artworks…</p>
        ) : recentArtworks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-plum/20 bg-ivory p-12 text-center text-sm text-ink-muted">
            No artworks found. Try a different filter.
          </p>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {recentArtworks.map((a, i) => (
              <ArtworkCard key={a._id} artwork={a} aspect={ASPECTS[i % ASPECTS.length]} isWished={wishlistIds.has(a._id)} onToggleWish={() => toggleWish.mutate({ id: a._id, isWished: wishlistIds.has(a._id) })} />
            ))}
          </div>
        )}
      </section>

      {/* ─── ARTISTS YOU MAY LIKE ─── */}
      {artists.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-plum">Artists you may like</h2>
              <p className="mt-1 text-sm text-ink-soft">Discover the people behind the work.</p>
            </div>
            <Link to="/artists" className="group text-sm font-medium text-rose transition hover:text-plum">
              View all <Arrow />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {artists.slice(0, 8).map((a) => (
              <ArtistCard key={a._id} artist={a} />
            ))}
          </div>
        </section>
      )}

      {/* ─── WHAT PEOPLE ARE EXPLORING ─── */}
      <section>
        <div className="mb-5">
          <h2 className="font-display text-xl font-semibold text-plum">What people are exploring</h2>
          <p className="mt-1 text-sm text-ink-soft">Trending styles and movements.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {STYLES.slice(0, 5).map((s) => {
            const match = artworks.find(
              (a) =>
                (a.subject || "").toLowerCase() === s.toLowerCase() ||
                (a.style || "").toLowerCase().includes(s.toLowerCase()) ||
                (a.medium || "").toLowerCase().includes(s.toLowerCase())
            );
            return (
              <Link
                key={s}
                to="/shop"
                className="group relative aspect-[4/5] overflow-hidden rounded-xl"
              >
                {match ? (
                  <img
                    src={match.imageUrl}
                    alt={s}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-lavender to-blush" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-plum-900/70 via-transparent to-transparent" />
                <span className="absolute bottom-0 left-0 p-4 font-display text-sm font-semibold text-white">
                  {s}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── FRESH FROM THE STUDIO ─── */}
      {freshArtworks.length > 0 && (
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-plum">Fresh from the studio</h2>
              <p className="mt-1 text-sm text-ink-soft">Recently added to Chitra.</p>
            </div>
            <Link to="/shop" className="group text-sm font-medium text-rose transition hover:text-plum">
              View all <Arrow />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {freshArtworks.map((a, i) => (
              <ArtworkCard
                key={a._id}
                artwork={a}
                aspect={ASPECTS[(i + 3) % ASPECTS.length]}
                isWished={wishlistIds.has(a._id)}
                onToggleWish={() => toggleWish.mutate({ id: a._id, isWished: wishlistIds.has(a._id) })}
                showNew
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   SUB-COMPONENTS
   ════════════════════════════════════════════════ */

function ArtworkCard({ artwork: a, aspect, isWished, onToggleWish, showNew }) {
  return (
    <div className="mb-4 break-inside-avoid">
      <Link to={`/artworks/${a._id}`} className="group block overflow-hidden rounded-xl">
        <div className="relative overflow-hidden" style={{ aspectRatio: aspect }}>
          <img
            src={a.imageUrl}
            alt={a.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {showNew && (
            <span className="absolute top-2.5 left-2.5 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-plum backdrop-blur">
              New
            </span>
          )}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWish(); }}
            className={`absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition-all duration-200 ${
              isWished ? "bg-rose/90 text-white scale-110" : "bg-white/80 text-plum-600/70 hover:bg-white hover:text-rose"
            }`}
          >
            <Heart filled={isWished} />
          </button>
        </div>
      </Link>
      <div className="mt-2.5 px-0.5">
        <Link to={`/artworks/${a._id}`} className="block">
          <h3 className="truncate text-sm font-semibold text-plum transition-colors group-hover:text-rose">
            {a.title}
          </h3>
        </Link>
        <p className="mt-0.5 text-xs text-ink-soft">{a.artistName || "Artist"}</p>
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-ink-muted">{a.medium}</p>
          <p className="text-sm font-semibold text-plum">{rs(a.price)}</p>
        </div>
      </div>
    </div>
  );
}

function ArtistCard({ artist: a }) {
  const spec = a.artistProfile?.specialty;
  const count = a.artistProfile?.totalOrders || 0;

  return (
    <Link
      to={`/artists/${a._id}`}
      className="group rounded-xl border border-plum/10 bg-ivory p-4 transition duration-300 hover:border-rose/30 hover:shadow-sm"
    >
      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-rose-soft bg-blush">
        {a.avatar ? (
          <img src={a.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-display text-lg font-semibold text-plum">{a.name.charAt(0)}</span>
        )}
      </div>
      <h3 className="mt-3 truncate font-display text-sm font-semibold text-plum">{a.name}</h3>
      {spec && <p className="mt-0.5 truncate text-xs text-ink-soft">{spec}</p>}
      {count > 0 && (
        <p className="mt-1 text-[11px] text-ink-muted">{count} order{count !== 1 ? "s" : ""}</p>
      )}
      <span className="mt-2.5 inline-flex items-center text-xs font-medium text-rose transition-colors group-hover:text-plum">
        View artist <Arrow />
      </span>
    </Link>
  );
}
