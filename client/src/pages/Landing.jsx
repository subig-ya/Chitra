import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";

import heroReference from "../assets/landing/hero-reference.jpg";
import softLilacs from "../assets/landing/soft-lilacs.jpg";
import softRoses from "../assets/landing/soft-roses.jpg";
import paleRoses from "../assets/landing/pale-roses.jpg";
import softPeonies from "../assets/landing/soft-peonies.jpg";
import portraitWhite from "../assets/landing/portrait-white.jpg";
import artistWorking from "../assets/landing/artist-working.jpg";
import monetWaterLilies from "../assets/landing/monet-water-lilies.jpg";
import godwardSummer from "../assets/landing/godward-summer.jpg";
import vanGoghLilac from "../assets/landing/van-gogh-lilac.jpg";
import bonnardPinkHouse from "../assets/landing/bonnard-pink-house.jpg";

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

/* ---------- icons (thin, elegant) ---------- */

const Icon = ({ d, className = "h-5 w-5", strokeWidth = 1.3, fill = "none" }) => (
  <svg
    viewBox="0 0 24 24"
    fill={fill}
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

const SearchIcon = (p) => <Icon {...p} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />;
const HeartIcon = (p) => <Icon {...p} d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />;
const UserIcon = (p) => (
  <Icon {...p} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
);
const MenuIcon = (p) => <Icon {...p} d="M4 8h16M4 16h16" />;
const CloseIcon = (p) => <Icon {...p} d="M6 6l12 12M18 6L6 18" />;
const ArrowIcon = (p) => <Icon {...p} d="M7 17L17 7M8 7h9v9" />;
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

const COLLECTIONS = [
  {
    label: "01 · Statement Pieces",
    title: "Statement Pieces",
    img: godwardSummer,
    tag: "Figure among flowers — oil on canvas",
    to: "/shop",
  },
  {
    label: "02 · Everyday Edit",
    title: "Everyday Edit",
    img: paleRoses,
    tag: "Pale roses — oil on canvas",
    to: "/shop",
  },
  {
    label: "03 · Soft Essentials",
    title: "Soft Essentials",
    img: softPeonies,
    tag: "Peonies — oil on canvas",
    to: "/shop",
  },
  {
    label: "04 · New Arrivals",
    title: "New Arrivals",
    img: monetWaterLilies,
    tag: "Water lilies — oil on canvas",
    to: "/shop",
    wide: true,
  },
];

const EDIT = [
  {
    name: "Water-Lily Reverie",
    category: "Impressionist · Oil",
    price: "Rs. 24,000",
    img: monetWaterLilies,
  },
  {
    name: "Lilac Noon",
    category: "Impressionist · Oil",
    price: "Rs. 18,500",
    img: vanGoghLilac,
  },
  {
    name: "Elegy in White",
    category: "Portrait · Oil",
    price: "Rs. 9,200",
    img: portraitWhite,
  },
  {
    name: "Pink Hour",
    category: "Landscape · Oil",
    price: "Rs. 6,800",
    img: bonnardPinkHouse,
  },
];

const CATEGORIES = [
  { num: "01", title: "Still Life", img: paleRoses },
  { num: "02", title: "Florals", img: softRoses },
  { num: "03", title: "Figurative", img: portraitWhite },
  { num: "04", title: "Landscapes", img: bonnardPinkHouse },
  { num: "05", title: "Impressionist", img: vanGoghLilac },
];

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "Collections", to: "/collections" },
  { label: "About", to: "#story" },
];

/* ---------- header ---------- */

function Header() {
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = !scrolled && !open;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-700 ${
          light
            ? "bg-transparent"
            : "border-b border-plum/10 bg-ivory/85 backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          {/* logo */}
          <Link
            to="/"
            className={`group transition-colors duration-700 ${
              light ? "text-ivory" : "text-plum"
            }`}
          >
            <span className="font-display text-xl font-semibold tracking-[0.3em]">
              CHITRA
            </span>
            <span className="mt-1.5 block h-px w-10 bg-rose transition-all duration-500 group-hover:w-16" />
          </Link>

          {/* center nav */}
          <nav className="hidden items-center gap-10 lg:flex">
            {NAV_LINKS.map((l) =>
              l.to.startsWith("#") ? (
                <a
                  key={l.label}
                  href={l.to}
                  className={`u-link text-[0.72rem] font-medium tracking-[0.28em] uppercase transition-colors duration-500 ${
                    light ? "text-ivory/90 hover:text-ivory" : "text-plum/80 hover:text-plum"
                  }`}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.label}
                  to={l.to}
                  className={`u-link text-[0.72rem] font-medium tracking-[0.28em] uppercase transition-colors duration-500 ${
                    light ? "text-ivory/90 hover:text-ivory" : "text-plum/80 hover:text-plum"
                  }`}
                >
                  {l.label}
                </Link>
              )
            )}
          </nav>

          {/* right icons */}
          <div className="flex items-center gap-2 lg:gap-5">
            <Link
              to="/shop"
              title="Search"
              className={`rounded-full p-2 transition-colors duration-500 ${
                light ? "text-ivory hover:bg-ivory/15" : "text-plum/80 hover:text-plum"
              }`}
            >
              <SearchIcon className="h-[18px] w-[18px]" />
            </Link>
            <Link
              to="/wishlist"
              title="Wishlist"
              className={`hidden rounded-full p-2 transition-colors duration-500 sm:block ${
                light ? "text-ivory hover:bg-ivory/15" : "text-plum/80 hover:text-plum"
              }`}
            >
              <HeartIcon className="h-[18px] w-[18px]" />
            </Link>
            <Link
               to={user ? "/feed" : "/login"}
              title="Profile"
              className={`rounded-full p-2 transition-colors duration-500 ${
                light ? "text-ivory hover:bg-ivory/15" : "text-plum/80 hover:text-plum"
              }`}
            >
              <UserIcon className="h-[18px] w-[18px]" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-label="Menu"
              className={`rounded-full p-2 transition-colors duration-500 lg:hidden ${
                light ? "text-ivory hover:bg-ivory/15" : "text-plum/80 hover:text-plum"
              }`}
            >
              {open ? <CloseIcon className="h-[18px] w-[18px]" /> : <MenuIcon className="h-[18px] w-[18px]" />}
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      {open && (
        <nav className="fixed inset-x-0 top-[4.7rem] z-40 border-b border-plum/10 bg-ivory px-8 py-8 backdrop-blur-md lg:hidden">
          {NAV_LINKS.map((l) =>
            l.to.startsWith("#") ? (
              <a
                key={l.label}
                href={l.to}
                onClick={() => setOpen(false)}
                className="block py-3 font-display text-2xl text-plum"
              >
                {l.label}
              </a>
            ) : (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block py-3 font-display text-2xl text-plum"
              >
                {l.label}
              </Link>
            )
          )}
          <div className="mt-6 border-t border-plum/10 pt-6 text-[0.7rem] tracking-[0.3em] text-ink-muted uppercase">
            Art · Style · Personality
          </div>
        </nav>
      )}
    </>
  );
}

/* ---------- hero ---------- */

function Hero() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative h-[100svh] min-h-[560px] overflow-hidden bg-lilac">
      {/* parallax background */}
      <div
        className="absolute inset-0"
        style={{ transform: `translateY(${offset * 0.22}px) scale(1.14)` }}
      >
        <img
          src={heroReference}
          alt="Cherry blossom painting — soft pink blossoms"
          className="hero-img h-full w-full object-cover object-center"
        />
      </div>

      {/* soft pink / lilac treatment */}
      <div className="absolute inset-0 bg-gradient-to-r from-plum-900/45 via-plum-900/15 to-plum-900/5" />
      <div className="absolute inset-0 bg-gradient-to-t from-plum-900/45 via-transparent to-plum-900/20" />
      <div className="absolute inset-0 bg-blush-50/10 mix-blend-overlay" />
      <div className="noise" />

      {/* content */}
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-6 pb-24 lg:px-10 lg:pb-28">
        <div className="max-w-2xl">
          <p className="rise flex items-center gap-4 text-[0.7rem] font-medium tracking-[0.42em] text-ivory/85 uppercase" style={{ animationDelay: "0.2s" }}>
            <span className="inline-block h-px w-10 bg-ivory/60" />
            Art · Style · Personality
          </p>
          <h1
            className="rise mt-6 font-display text-[17vw] leading-[0.95] font-semibold tracking-[0.14em] text-ivory sm:text-8xl lg:text-[10rem]"
            style={{ animationDelay: "0.35s", textShadow: "0 2px 30px rgba(47,31,41,0.35)" }}
          >
            CHITRA
          </h1>
          <p
            className="rise mt-6 font-display text-2xl text-ivory/95 italic lg:text-3xl"
            style={{ animationDelay: "0.5s" }}
          >
            Where style becomes a story.
          </p>
          <p
            className="rise mt-4 max-w-md text-[15px] leading-relaxed text-ivory/85"
            style={{ animationDelay: "0.62s" }}
          >
            Discover pieces that feel uniquely yours.
          </p>

          <div
            className="rise mt-11 flex flex-col items-start gap-8 sm:flex-row sm:items-center"
            style={{ animationDelay: "0.75s" }}
          >
            <Link
              to="/shop"
              className="border border-ivory/80 px-8 py-3.5 text-[0.72rem] font-semibold tracking-[0.28em] text-ivory uppercase transition-colors duration-500 hover:bg-ivory hover:text-plum"
            >
              Explore Collection
            </Link>
            <a href="#story" className="cta-line text-ivory">
              Discover Chitra
              <span className="cta-arrow inline-block">
                <ArrowIcon className="h-[14px] w-[14px]" strokeWidth={1.5} />
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* scroll cue */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex">
        <span className="text-[0.62rem] font-medium tracking-[0.4em] text-ivory/70 uppercase">Scroll</span>
        <span className="block h-10 w-px animate-pulse bg-ivory/60" />
      </div>
    </section>
  );
}

/* ---------- editorial transition strip ---------- */

function TransitionStrip() {
  return (
    <section className="bg-cream px-6 py-16 text-center lg:py-20">
      <span className="mx-auto block h-14 w-px bg-rose/60" />
      <p className="mt-6 text-[0.68rem] font-medium tracking-[0.44em] text-plum-600/60 uppercase">
        The Art of Everyday
      </p>
      <p className="mt-2 font-display text-sm text-ink-muted italic">est. Nepal</p>
    </section>
  );
}

/* ---------- curated for you ---------- */

function CollectionCard({ c }) {
  return (
    <Link to={c.to} className="group relative block h-full w-full overflow-hidden bg-mauve/40">
      <img
        src={c.img}
        alt={c.title}
        className="zoom-slow absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-plum-900/55 via-plum-900/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
        <p className="text-[0.62rem] font-medium tracking-[0.34em] text-ivory/70 uppercase">
          {c.tag}
        </p>
        <h3 className="mt-2 font-display text-2xl text-ivory lg:text-3xl">{c.title}</h3>
        <span className="cta-line mt-3 text-ivory">
          Explore
          <span className="cta-arrow inline-block">
            <ArrowIcon className="h-[13px] w-[13px]" strokeWidth={1.5} />
          </span>
        </span>
      </div>
    </Link>
  );
}

function CuratedForYou() {
  const hero = COLLECTIONS[0];
  const stack = [COLLECTIONS[1], COLLECTIONS[2]];
  const wide = COLLECTIONS[3];

  return (
    <section id="collections" className="bg-cream px-6 py-20 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-16 grid items-end gap-8 lg:grid-cols-2">
          <div>
            <p className="flex items-center gap-4 text-[0.68rem] font-medium tracking-[0.34em] text-rose uppercase">
              <span className="inline-block h-px w-8 bg-rose" />
              Collection 01
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold text-plum sm:text-5xl lg:text-6xl">
              Curated for You
            </h2>
          </div>
          <div className="lg:justify-self-end">
            <p className="max-w-sm text-sm leading-relaxed text-ink-soft">
              A considered selection of original paintings — quiet, expressive
              and made to live with.
            </p>
            <Link to="/shop" className="cta-line mt-5 text-plum">
              View all collections
              <span className="cta-arrow inline-block">
                <ArrowIcon className="h-[13px] w-[13px]" strokeWidth={1.5} />
              </span>
            </Link>
          </div>
        </Reveal>

        {/* asymmetric composition */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-2 lg:gap-8 lg:h-[660px]">
          <Reveal className="aspect-[4/5] lg:col-span-7 lg:row-span-2 lg:aspect-auto lg:h-full">
            <CollectionCard c={hero} />
          </Reveal>
          <Reveal delay={120} className="aspect-[3/4] lg:col-span-5 lg:aspect-auto lg:h-full">
            <CollectionCard c={stack[0]} />
          </Reveal>
          <Reveal delay={240} className="aspect-[3/4] lg:col-span-5 lg:aspect-auto lg:h-full">
            <CollectionCard c={stack[1]} />
          </Reveal>
        </div>

        <Reveal className="mt-6 lg:mt-8">
          <div className="aspect-[16/9] w-full lg:aspect-[16/7]">
            <CollectionCard c={wide} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- the chitra edit ---------- */

function TheEdit() {
  const [wished, setWished] = useState(() => new Set());

  const toggle = (name) =>
    setWished((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <section id="shop" className="border-y border-plum/10 bg-ivory px-6 py-20 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-16 grid items-end gap-8 lg:grid-cols-2">
          <div>
            <p className="flex items-center gap-4 text-[0.68rem] font-medium tracking-[0.34em] text-rose uppercase">
              <span className="inline-block h-px w-8 bg-rose" />
              The Shop · 02
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold text-plum sm:text-5xl lg:text-6xl">
              The Chitra Edit
            </h2>
          </div>
          <Link to="/shop" className="cta-line justify-self-start text-plum lg:justify-self-end">
            View all works
            <span className="cta-arrow inline-block">
              <ArrowIcon className="h-[13px] w-[13px]" strokeWidth={1.5} />
            </span>
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4 lg:gap-x-8">
          {EDIT.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}>
              <div className="group">
                <div className="relative overflow-hidden bg-mauve/40">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="zoom-slow aspect-[3/4] w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => toggle(p.name)}
                    aria-label={`Wishlist ${p.name}`}
                    className="absolute top-4 right-4 rounded-full border border-ivory/80 bg-ivory/70 p-2.5 text-plum backdrop-blur-sm transition-colors duration-300 hover:bg-ivory"
                  >
                    <HeartIcon
                      className="h-[17px] w-[17px]"
                      fill={wished.has(p.name) ? "currentColor" : "none"}
                    />
                  </button>
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <Link
                      to="/shop"
                      className="u-link font-display text-lg text-plum"
                    >
                      {p.name}
                    </Link>
                    <p className="mt-1.5 text-[0.62rem] font-medium tracking-[0.24em] text-ink-muted uppercase">
                      {p.category}
                    </p>
                  </div>
                  <p className="text-sm font-medium whitespace-nowrap text-plum">{p.price}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- the art of chitra ---------- */

function ArtOfChitra() {
  return (
    <section id="story" className="grid bg-cream lg:grid-cols-2">
      <Reveal className="group relative overflow-hidden lg:h-[82vh]">
        <img
          src={artistWorking}
          alt="An artist at work in a Nepali studio"
          className="zoom-slow h-full max-h-[62vh] w-full object-cover lg:max-h-none lg:min-h-full"
        />
        <div className="absolute inset-0 bg-plum-900/15" />
      </Reveal>
      <div className="flex items-center px-6 py-20 lg:px-16 lg:py-0 xl:px-24">
        <Reveal delay={120} className="max-w-lg">
          <p className="flex items-center gap-4 text-[0.68rem] font-medium tracking-[0.34em] text-rose uppercase">
            <span className="inline-block h-px w-8 bg-rose" />
            Editorial · 03
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-plum sm:text-5xl lg:text-6xl">
            The Art of Chitra
          </h2>
          <p className="mt-7 text-[15px] leading-relaxed text-ink-soft">
            Chitra is a celebration of individuality, expression and the little
            details that make personal style unforgettable.
          </p>
          <a href="#story" className="cta-line mt-9 text-plum">
            Read Our Story
            <span className="cta-arrow inline-block">
              <ArrowIcon className="h-[13px] w-[13px]" strokeWidth={1.5} />
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- shop by style ---------- */

function Categories() {
  return (
    <section id="categories" className="bg-ivory px-6 py-20 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal className="mb-14 grid items-end gap-8 lg:grid-cols-2">
          <div>
            <p className="flex items-center gap-4 text-[0.68rem] font-medium tracking-[0.34em] text-rose uppercase">
              <span className="inline-block h-px w-8 bg-rose" />
              Explore · 04
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold text-plum sm:text-5xl">
              Shop by style
            </h2>
          </div>
          <Link to="/shop" className="cta-line justify-self-start text-plum lg:justify-self-end">
            Browse everything
            <span className="cta-arrow inline-block">
              <ArrowIcon className="h-[13px] w-[13px]" strokeWidth={1.5} />
            </span>
          </Link>
        </Reveal>

        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-5 lg:gap-6 lg:overflow-visible lg:pb-0">
          {CATEGORIES.map((c) => (
            <Link
              key={c.title}
              to="/shop"
              className="group relative w-[72%] shrink-0 snap-start overflow-hidden bg-mauve/40 sm:w-[46%] lg:w-auto"
            >
              <img
                src={c.img}
                alt={c.title}
                className="zoom-slow aspect-[3/4] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum-900/55 via-plum-900/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
                <div>
                  <p className="text-[0.6rem] font-medium tracking-[0.3em] text-ivory/70">
                    {c.num}
                  </p>
                  <h3 className="mt-1.5 font-display text-xl text-ivory">{c.title}</h3>
                </div>
                <span className="u-link text-[0.62rem] font-medium tracking-[0.26em] text-ivory/90 uppercase">
                  Explore
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- made to be remembered ---------- */

function BrandStory() {
  return (
    <section id="about" className="bg-blush-50 px-6 py-20 lg:px-10 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="relative lg:col-span-6">
          <div className="absolute -top-5 -left-5 hidden h-full w-full border border-rose/60 sm:block" />
          <img
            src={softPeonies}
            alt="Still life with a vase of peonies"
            className="relative aspect-[4/5] w-full object-cover sm:ml-5 sm:mt-5"
          />
          <p className="mt-4 text-[0.62rem] font-medium tracking-[0.26em] text-ink-muted uppercase">
            Peonies — oil on canvas
          </p>
        </Reveal>
        <Reveal delay={120} className="lg:col-span-6 lg:pl-6 xl:pl-12">
          <p className="flex items-center gap-4 text-[0.68rem] font-medium tracking-[0.34em] text-rose uppercase">
            <span className="inline-block h-px w-8 bg-rose" />
            Our Story · 05
          </p>
          <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-plum sm:text-5xl lg:text-6xl">
            Made to be remembered.
          </h2>
          <p className="mt-7 text-[15px] leading-relaxed text-ink-soft">
            Chitra is about discovering beautiful, expressive pieces and creating
            a personal sense of style. Every painting carries a maker's story —
            and a little of you, once it lives on your wall.
          </p>
          <div className="mt-9 h-px w-16 bg-rose/70" />
          <p className="mt-6 font-display text-lg text-plum/75 italic">— The Chitra studio</p>
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
    setTimeout(() => setDone(false), 3200);
  };

  return (
    <section id="contact" className="bg-cream px-6 py-24 text-center lg:px-10">
      <div className="mx-auto max-w-md">
        <p className="flex items-center justify-center gap-4 text-[0.68rem] font-medium tracking-[0.34em] text-rose uppercase">
          <span className="inline-block h-px w-8 bg-rose" />
          The Circle · 06
          <span className="inline-block h-px w-8 bg-rose" />
        </p>
        <h2 className="mt-5 font-display text-3xl font-semibold text-plum sm:text-4xl">
          Stay in the Chitra circle.
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-ink-soft">
          New collections, stories and little inspirations — delivered
          occasionally.
        </p>

        {done ? (
          <p className="mt-12 font-display text-xl text-rose italic">
            Welcome to the circle.
          </p>
        ) : (
          <form onSubmit={subscribe} className="mt-12 flex items-end gap-6 text-left">
            <div className="flex-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full border-b border-plum/30 bg-transparent pb-3 text-sm text-plum placeholder:text-ink-muted focus:border-plum focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="cta-line text-plum"
            >
              Join Chitra
              <span className="cta-arrow inline-block">
                <ArrowIcon className="h-[13px] w-[13px]" strokeWidth={1.5} />
              </span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ---------- footer ---------- */

function Footer() {
  const explore = [
    { label: "Shop", to: "/shop" },
    { label: "Collections", to: "/collections" },
    { label: "New Arrivals", to: "/shop" },
    { label: "About", to: "#story" },
  ];
  const help = ["Contact", "Shipping", "Returns", "FAQ"];
  const socials = [
    { label: "Instagram", icon: <InstagramIcon className="h-[15px] w-[15px]" /> },
    { label: "Pinterest", icon: <PinterestIcon className="h-[15px] w-[15px]" /> },
    { label: "Facebook", icon: <FacebookIcon className="h-[15px] w-[15px]" /> },
  ];

  return (
    <footer className="bg-plum-800 px-6 pt-20 pb-10 text-ivory/75 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <p className="font-display text-2xl font-semibold tracking-[0.3em] text-ivory">
              CHITRA
            </p>
            <span className="mt-3 block h-px w-10 bg-rose" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ivory/60">
              Original paintings and fine art, curated from Nepali and
              international artists who pour their story into every canvas.
            </p>
          </div>

          <div>
            <p className="text-[0.7rem] font-semibold tracking-[0.3em] text-ivory/90 uppercase">
              Explore
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {explore.map((l) =>
                l.to.startsWith("#") ? (
                  <li key={l.label}>
                    <a href={l.to} className="u-link text-ivory/70 transition-colors hover:text-ivory">
                      {l.label}
                    </a>
                  </li>
                ) : (
                  <li key={l.label}>
                    <Link to={l.to} className="u-link text-ivory/70 transition-colors hover:text-ivory">
                      {l.label}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <p className="text-[0.7rem] font-semibold tracking-[0.3em] text-ivory/90 uppercase">
              Help
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {help.map((h) => (
                <li key={h}>
                  <a href="#contact" className="u-link text-ivory/70 transition-colors hover:text-ivory">
                    {h}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[0.7rem] font-semibold tracking-[0.3em] text-ivory/90 uppercase">
              Follow
            </p>
            <ul className="mt-5 space-y-3 text-sm">
              {socials.map((s) => (
                <li key={s.label}>
                  <a
                    href="#top"
                    className="u-link inline-flex items-center gap-3 text-ivory/70 transition-colors hover:text-ivory"
                  >
                    <span className="opacity-70">{s.icon}</span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-ivory/15 pt-8 sm:flex-row">
          <p className="text-[0.68rem] tracking-[0.2em] text-ivory/45 uppercase">
            © 2026 Chitra. All rights reserved.
          </p>
          <p className="text-[0.68rem] tracking-[0.2em] text-ivory/45 uppercase">
            Kathmandu · Nepal
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- page ---------- */

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream font-sans text-plum">
      <Header />
      <Hero />
      <TransitionStrip />
      <CuratedForYou />
      <TheEdit />
      <ArtOfChitra />
      <Categories />
      <BrandStory />
      <Newsletter />
      <Footer />
    </div>
  );
}
