import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ fullName: "", phone: "", addressLine: "", city: "", zip: "", note: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get("/cart")).data,
  });
  const items = data?.cart?.items || [];

  useEffect(() => {
    if (!isLoading && items.length === 0) navigate("/cart", { replace: true });
  }, [isLoading, items.length, navigate]);

  if (!user) {
    navigate("/login", { state: { from: "/checkout" } });
    return null;
  }

  const subtotal = items.reduce(
    (sum, i) => sum + (i.artworkId?.price || 0) * i.quantity,
    0
  );

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await api.post("/cart/checkout", {
        shippingAddress: form,
      });
      navigate("/orders", {
        state: { notice: res.data.message, count: res.data.orders.length },
      });
    } catch (err) {
      setError(apiErrorMessage(err, "Checkout failed. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  if (isLoading) return <p className="text-ink-muted">Loading…</p>;

  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 font-display text-3xl font-bold">Checkout</h1>
      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-xl border border-brand-100 bg-white p-6">
            <p className="font-display text-lg font-bold">
              Shipping details
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              Your artworks will be shipped to this address.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Full name
                </label>
                <input className={input} required value={form.fullName} onChange={set("fullName")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Phone
                </label>
                <input className={input} required type="tel" value={form.phone} onChange={set("phone")} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Address
                </label>
                <input className={input} required placeholder="House, street, landmark" value={form.addressLine} onChange={set("addressLine")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  City
                </label>
                <input className={input} required value={form.city} onChange={set("city")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Postal code
                </label>
                <input className={input} value={form.zip} onChange={set("zip")} />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Delivery note (optional)
                </label>
                <textarea className={input} rows={2} value={form.note} onChange={set("note")} />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-brand-100 bg-white p-6">
            <p className="font-display text-lg font-bold">Summary</p>
            <div className="mt-3 max-h-56 space-y-2 overflow-auto pr-1">
              {items.map((item) => (
                <div key={item.artworkId._id} className="flex items-center gap-3 text-sm">
                  <img
                    src={item.artworkId.imageUrl}
                    alt={item.artworkId.title}
                    className="h-12 w-10 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium leading-tight">{item.artworkId.title}</p>
                    <p className="text-xs text-ink-muted">
                      {rs(item.artworkId.price)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-brand-100 pt-3 font-semibold">
              <span>Total</span>
              <span className="text-brand-800">{rs(subtotal)}</span>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-4 w-full rounded-full bg-brand-800 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:opacity-60"
            >
              {busy ? "Creating orders…" : "Place order & pay"}
            </button>
            <p className="mt-3 text-center text-xs text-ink-muted">
              You'll pay after confirming. Payment is held in escrow.
            </p>
            <Link
              to="/cart"
              className="mt-2 block text-center text-sm font-semibold text-brand-700 hover:underline"
            >
              ← Back to cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
