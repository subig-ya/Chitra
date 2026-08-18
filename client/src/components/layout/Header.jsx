import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api.js";
import { useAuth } from "../../lib/auth.jsx";

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

export default function Header({ onMenuToggle }) {
  const { user } = useAuth();

  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get("/cart")).data,
    enabled: Boolean(user),
    staleTime: 30_000,
  });
  const cartCount = cart?.cart?.items?.reduce((n, i) => n + (i.quantity || 1), 0) || 0;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-plum/10 bg-ivory/90 px-4 backdrop-blur">
      {/* left: hamburger + logo */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="rounded-lg p-2 text-plum-600/70 transition hover:bg-lavender/40 hover:text-plum"
        aria-label="Toggle menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" />
        </svg>
      </button>

      <Link to="/feed" className="flex items-baseline gap-0.5">
        <span className="font-display text-base font-semibold tracking-[0.18em] text-plum">Chitra</span>
        <span className="h-1 w-1 rounded-full bg-rose" />
      </Link>

      {/* spacer */}
      <div className="flex-1" />

      {/* right: utility icons */}
      <div className="flex items-center gap-1">
        <Link
          to="/wishlist"
          className="rounded-lg p-2 text-plum-600/60 transition hover:bg-lavender/40 hover:text-plum"
          aria-label="Wishlist"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </Link>
        <Link
          to="/messages"
          className="rounded-lg p-2 text-plum-600/60 transition hover:bg-lavender/40 hover:text-plum"
          aria-label="Messages"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[18px] w-[18px]">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        </Link>
        <Link
          to="/cart"
          className="relative rounded-lg p-2 text-plum-600/60 transition hover:bg-lavender/40 hover:text-plum"
          aria-label={`Cart, ${cartCount} items`}
        >
          <CartIcon />
          {cartCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose px-1 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </Link>
        <Link
          to="/profile"
          className="ml-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-rose-soft bg-blush text-xs font-semibold text-plum transition hover:ring-2 hover:ring-lavender"
          aria-label="Profile"
        >
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            (user?.name || "U").charAt(0).toUpperCase()
          )}
        </Link>
      </div>
    </header>
  );
}
