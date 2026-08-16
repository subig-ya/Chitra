import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

import heroImage from "../assets/landing/hero-lavender-field.jpg";
import storyImage from "../assets/landing/story-still-life.jpg";
import catArt from "../assets/landing/cat-art.jpg";
import catCrafts from "../assets/landing/cat-crafts.jpg";
import catHomeDecor from "../assets/landing/cat-homedecor.jpg";
import catAccessories from "../assets/landing/cat-accessories.jpg";
import productBloom from "../assets/landing/product-lavender-bloom.jpg";
import productHorizon from "../assets/landing/product-purple-horizon.jpg";
import productHarmony from "../assets/landing/product-violet-harmony.jpg";
import productAmethyst from "../assets/landing/product-amethyst-dreams.jpg";

/* ---------- scroll reveal ---------- */

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ---------- thin-line icons ---------- */

const Icon = ({ d, className = "h-5 w-5", strokeWidth = 1.5 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const SearchIcon = (p) => (
  <Icon {...p} d="M21 21l-4.35-4.35m2.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
);
const HeartIcon = (p) => (
  <Icon {...p} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
);
const BagIcon = (p) => (
  <Icon {...p} d="M6 7h12l1 13H5L6 7zm3 0a3 3 0 016 0" />
);
const UserIcon = (p) => (
  <Icon {...p} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
);
const MenuIcon = (p) => <Icon {...p} d="M4 7h16M4 12h16M4 17h16" />;
const CloseIcon = (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />;
const ArrowIcon = (p) => <Icon {...p} d="M5 12h14m-6-6l6 6-6 6" />;
const InstagramIcon = (p) => (
  <Icon {...p} d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm5 6.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM17.2 6.8h.01" />
);
const FacebookIcon = (p) => (
  <Icon {...p} d="M14 21v-7h2.4l.6-3H14V9.5c0-1 .5-1.6 1.7-1.6H17V5.2A23 23 0 0015.2 5c-2.1 0-3.2 1.3-3.2 3.6V11H9.8v3h2.2v7H14z" />
);
const PinterestIcon = (p) => (
  <Icon {...p} d="M12 3a9 9 0 00-3.4 17.3c-.08-.7-.15-1.8.03-2.6l1.2-5.2s-.3-.6-.3-1.5c0-1.4.8-2.5 1.9-2.5.9 0 1.3.6 1.3 1.4 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.8 1.5 1.8 1.8 0 3.2-1.9 3.2-4.7 0-2.4-1.7-4.1-4.2-4.1-2.9 0-4.6 2.1-4.6 4.4 0 .9.3 1.8.8 2.3.1.1.1.2.1.3l-.3 1.2c0 .2-.2.2-.4.1-1.2-.6-2-2.5-2-4 0-3.3 2.4-6.3 6.9-6.3 3.6 0 6.4 2.6 6.4 6 0 3.6-2.3 6.5-5.4 6.5-1.1 0-2.1-.6-2.4-1.2l-.7 2.5c-.2 1-.9 2.2-1.3 2.9A9 9 0 1012 3z" />
);

/* ---------- data ---------- */

const CATEGORIES = [
  { title: "Art & Paintings", img: catArt, to: "/shop" },
  { title: "Handmade Crafts", img: catCrafts, to: "/shop" },
  { title: "Home Décor", img: catHomeDecor, to: "/shop" },
  { title: "Accessories", img: catAccessories, to: "/shop" },
];

const PRODUCTS = [
  {
    name: "Lavender Bloom",
    category: "Botanical print",
    price: 2400,
    img: productBloom,
  },
  {
    name: "Purple Horizon",
    category: "Original canvas",
    price: 6800,
    img: productHorizon,
  },
  {
    name: "Violet Harmony",
    category: "Fluid art panel",
    price: 4500,
    img: productHarmony,
  },
  {
    name: "Amethyst Dreams",
    category: "Hand-picked crystal",
    price: 3150,
    img: productAmethyst,
  },
];

const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "Shop", href: "/shop" },
  { label: "Categories", href: "#categories" },
  { label: "About Us", href: "#story" },
  { label: "Contact", href: "#contact" },
];

/* ---------- header ---------- */

function Header({ cart, bump }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [wishlist, setWishlist] = useState(0);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-brand-100/60 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        <a href="#top" className="font-display text-2xl font-bold tracking-tight">
          CHITRA<span className="text-brand-600">.</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) =>
            l.href.startsWith("#") ? (
              <a
                key={l.label}
                href={l.href}
                className="text-sm font-medium text-ink-soft transition hover:text-brand-700"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                to={l.href}
                className="text-sm font-medium text-ink-soft transition hover:text-brand-700"
              >
                {l.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <a
            href="#categories"
            title="Search the collection"
            className="rounded-full p-2 text-ink-soft transition hover:bg-brand-100 hover:text-brand-800"
          >
            <SearchIcon />
          </a>
          <button
            type="button"
            title="Wishlist"
            onClick={() => setWishlist((w) => w + 1)}
            className="relative rounded-full p-2 text-ink-soft transition hover:bg-brand-100 hover:text-brand-800"
          >
            <span key={wishlist} className={wishlist ? "heart-pop block" : "block"}>
              <HeartIcon />
            </span>
            {wishlist > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-700 text-[10px] font-semibold text-white">
                {wishlist}
              </span>
            )}
          </button>
          <Link
            to="/orders"
            title="Bag"
            className={`relative rounded-full p-2 text-ink-soft transition hover:bg-brand-100 hover:text-brand-800 ${bump ? "cart-bump" : ""}`}
          >
            <BagIcon />
            {cart > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-700 text-[10px] font-semibold text-white">
                {cart}
              </span>
            )}
          </Link>
          <Link
            to={user ? "/profile" : "/login"}
            title="Account"
            className="rounded-full p-2 text-ink-soft transition hover:bg-brand-100 hover:text-brand-800"
          >
            <UserIcon />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-full p-2 text-ink-soft transition hover:bg-brand-100 hover:text-brand-800 md:hidden"
            aria-label="Menu"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-brand-100/60 bg-white/90 px-6 py-4 backdrop-blur-md md:hidden">
          {NAV_LINKS.map((l) =>
            l.href.startsWith("#") ? (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-medium text-ink transition hover:text-brand-700"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                to={l.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 text-sm font-medium text-ink transition hover:text-brand-700"
              >
                {l.label}
              </Link>
            )
          )}
        </nav>
      )}
    </header>
  );
}

/* ---------- hero ---------- */

function Hero() {
  return (
    <section id="top" className="relative flex min-h-[92vh] items-center overflow-hidden">
      <img
        src={heroImage}
        alt="Lavender fields in soft purple bloom"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-brand-50/95 via-brand-50/70 to-brand-50/10" />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-28 lg:px-10">
        <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.35em] text-brand-700 uppercase">
          <span className="h-px w-10 bg-brand-500" />
          Handcrafted · Curated · One of a kind
        </p>
        <h1 className="mt-6 max-w-2xl font-display text-5xl leading-[1.05] font-bold text-ink sm:text-6xl lg:text-7xl">
          Discover the Art of{" "}
          <em className="text-brand-700 italic">Chitra</em>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
          Unique pieces, thoughtful designs, and beautiful creations made to
          bring character into your everyday life.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-800 px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-800/20"
          >
            Shop Collection
          </Link>
          <a
            href="#categories"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-300 bg-white/70 px-8 py-3.5 text-sm font-semibold tracking-wide text-brand-800 backdrop-blur-sm transition hover:border-brand-400 hover:bg-brand-100/70"
          >
            Explore Chitra
          </a>
        </div>
      </div>
    </section>
  );
}

/* ---------- categories ---------- */

function Categories() {
  return (
    <section id="categories" className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
      <Reveal className="max-w-xl">
        <p className="text-xs font-semibold tracking-[0.35em] text-brand-600 uppercase">
          Featured categories
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
          Explore Our Collection
        </h2>
      </Reveal>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c, i) => (
          <Reveal key={c.title} delay={i * 90}>
            <Link
              to={c.to}
              className="group block overflow-hidden rounded-xl bg-brand-100/70"
            >
              <div className="overflow-hidden">
                <img
                  src={c.img}
                  alt={c.title}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <p className="font-display text-lg font-semibold">{c.title}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-700">
                  Explore
                  <ArrowIcon className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- products ---------- */

function Products({ onAddToCart }) {
  const [faves, setFaves] = useState({});
  const [added, setAdded] = useState(null);

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <Reveal className="flex flex-col items-end justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-xs font-semibold tracking-[0.35em] text-brand-600 uppercase">
              The edit
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
              Curated For You
            </h2>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-800 transition hover:text-brand-600"
          >
            View the full shop <ArrowIcon className="h-4 w-4" />
          </Link>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((p, i) => {
            const fave = Boolean(faves[p.name]);
            return (
              <Reveal key={p.name} delay={i * 90}>
                <div className="group rounded-xl border border-brand-100 bg-brand-50/40 p-3 transition duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-200/40">
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <button
                      type="button"
                      onClick={() => setFaves({ ...faves, [p.name]: !fave })}
                      className={`absolute top-3 right-3 rounded-full p-2 backdrop-blur-sm transition ${
                        fave
                          ? "bg-brand-800 text-white"
                          : "bg-white/80 text-ink-muted hover:text-brand-700"
                      }`}
                      aria-label={`Add ${p.name} to wishlist`}
                    >
                      <span key={String(fave)} className={fave ? "heart-pop block" : "block"}>
                        <HeartIcon className="h-4 w-4" />
                      </span>
                    </button>
                  </div>
                  <div className="px-2 pt-4 pb-2">
                    <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
                      {p.category}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold">
                      {p.name}
                    </h3>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="font-semibold text-brand-800">
                        Rs. {p.price.toLocaleString("en-IN")}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          onAddToCart();
                          setAdded(p.name);
                          setTimeout(() => setAdded(null), 1600);
                        }}
                        className="rounded-full border border-brand-300 px-4 py-1.5 text-xs font-semibold text-brand-800 transition hover:border-brand-800 hover:bg-brand-800 hover:text-white"
                      >
                        {added === p.name ? "Added ✓" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- brand story ---------- */

function Story() {
  return (
    <section id="story" className="bg-brand-100/70">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:px-10">
        <Reveal className="relative">
          <div className="absolute -top-5 -left-5 hidden h-full w-full rounded-2xl border border-brand-300 sm:block" />
          <img
            src={storyImage}
            alt="Still life with amethyst crystal, white vase and silk fabric"
            className="relative aspect-[4/5] w-full rounded-2xl object-cover"
          />
        </Reveal>
        <Reveal delay={120}>
          <p className="text-xs font-semibold tracking-[0.35em] text-brand-600 uppercase">
            Our Story
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
            Where Creativity Meets Character
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
            Chitra celebrates creativity, craftsmanship, and the beauty of
            things made by hand. Every piece in our collection is a story —
            shaped by local artists, mindful of detail, and designed to bring
            quiet character to your everyday life.
          </p>
          <a
            href="#contact"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-800 px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-800/20"
          >
            Learn More <ArrowIcon className="h-4 w-4" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- promo banner ---------- */

function Promo() {
  return (
    <section className="relative overflow-hidden bg-brand-800 py-24 text-white">
      <div
        className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(197,175,230,0.9) 0%, rgba(197,175,230,0) 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full opacity-25"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
        }}
      />
      <div className="float-soft pointer-events-none absolute top-10 right-1/4 hidden font-display text-7xl text-brand-300/20 sm:block">
        ✦
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
            Find Something That Feels Like You
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-brand-100">
            Explore our latest collection of unique pieces, thoughtfully
            selected for people who appreciate creativity and individuality.
          </p>
          <Link
            to="/shop"
            className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-10 py-3.5 text-sm font-semibold tracking-wide text-brand-800 transition hover:bg-brand-100 hover:shadow-lg"
          >
            Shop Now <ArrowIcon className="h-4 w-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- newsletter ---------- */

function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setEmail("");
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <section id="contact" className="mx-auto max-w-3xl px-6 py-24 text-center">
      <Reveal>
        <p className="text-xs font-semibold tracking-[0.35em] text-brand-600 uppercase">
          Newsletter
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold sm:text-5xl">
          Stay Inspired
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg leading-relaxed text-ink-soft">
          Be the first to discover new collections, featured creations, and
          special offers from Chitra.
        </p>
        <form
          onSubmit={subscribe}
          className="mx-auto mt-9 flex max-w-md flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full rounded-full border border-brand-200 bg-white px-6 py-3.5 text-sm text-ink placeholder:text-ink-muted focus:border-brand-500 focus:ring-2 focus:ring-brand-300 focus:outline-none"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-brand-800 px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition hover:bg-brand-700"
          >
            {done ? "Subscribed ✓" : "Subscribe"}
          </button>
        </form>
      </Reveal>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  return (
    <footer className="bg-brand-950 text-brand-100">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <p className="font-display text-3xl font-bold text-white">
              CHITRA<span className="text-brand-400">.</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-brand-200/80">
              Unique art and handmade creations, thoughtfully curated for
              people who appreciate creativity and character.
            </p>
            <div className="mt-6 flex gap-3">
              {[
                { label: "Instagram", icon: <InstagramIcon className="h-4 w-4" /> },
                { label: "Facebook", icon: <FacebookIcon className="h-4 w-4" /> },
                { label: "Pinterest", icon: <PinterestIcon className="h-4 w-4" /> },
              ].map((s) => (
                <a
                  key={s.label}
                  href="#top"
                  title={s.label}
                  className="rounded-full border border-brand-700 p-2.5 text-brand-200 transition hover:border-brand-400 hover:bg-brand-800 hover:text-white"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-wide text-white uppercase">
              Explore
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.label}>
                  {l.href.startsWith("#") ? (
                    <a href={l.href} className="text-brand-200/80 transition hover:text-white">
                      {l.label}
                    </a>
                  ) : (
                    <Link to={l.href} className="text-brand-200/80 transition hover:text-white">
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-wide text-white uppercase">
              Customer Care
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {["Shipping", "Returns", "FAQ", "Privacy Policy"].map((c) => (
                <li key={c}>
                  <a href="#contact" className="text-brand-200/80 transition hover:text-white">
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-brand-800 pt-8 sm:flex-row">
          <p className="text-xs text-brand-200/70">
            © 2026 CHITRA. All rights reserved.
          </p>
          <p className="text-xs text-brand-200/70">
            Made with care in Kathmandu
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- page ---------- */

export default function Landing() {
  const [cart, setCart] = useState(0);
  const [bump, setBump] = useState(false);

  const addToCart = () => {
    setCart((c) => c + 1);
    setBump(true);
    setTimeout(() => setBump(false), 500);
  };

  return (
    <div className="min-h-screen bg-brand-50 font-sans text-ink">
      <Header cart={cart} bump={bump} />
      <Hero />
      <Categories />
      <Products onAddToCart={addToCart} />
      <Story />
      <Promo />
      <Newsletter />
      <Footer />
    </div>
  );
}
