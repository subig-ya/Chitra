import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import api, { apiErrorMessage } from "../lib/api.js";

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

export default function Cart() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => (await api.get("/cart")).data,
  });

  const items = data?.cart?.items || [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  };

  const updateQty = useMutation({
    mutationFn: async ({ id, quantity }) =>
      (await api.patch(`/cart/items/${id}`, { quantity })).data,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id) => (await api.delete(`/cart/items/${id}`)).data,
    onSuccess: invalidate,
  });

  const clear = useMutation({
    mutationFn: async () => (await api.delete("/cart")).data,
    onSuccess: invalidate,
  });

  const subtotal = items.reduce(
    (sum, i) => sum + (i.artworkId?.price || 0) * i.quantity,
    0
  );

  if (isLoading) return <p className="text-ink-muted">Loading cart…</p>;
  if (error) return <p className="text-red-600">{error.message}</p>;

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-brand-200 p-12 text-center">
        <p className="font-display text-2xl font-bold">Your cart is empty</p>
        <p className="mt-2 text-ink-muted">
          Browse the collection and find something you love.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-full bg-brand-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
        >
          Go to the Shop
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl font-bold">Your Cart</h1>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {items.map((item) => {
              const a = item.artworkId;
              return (
                <div
                  key={String(item._id || a._id)}
                  className="flex gap-4 rounded-xl border border-brand-100 bg-white p-4"
                >
                  <Link to={`/artworks/${a._id}`} className="shrink-0">
                    <img
                      src={a.imageUrl}
                      alt={a.title}
                      className="h-28 w-24 rounded-lg object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">
                        {a.medium}
                      </p>
                      <Link
                        to={`/artworks/${a._id}`}
                        className="font-display text-lg font-semibold hover:text-brand-700"
                      >
                        {a.title}
                      </Link>
                      <p className="text-sm text-ink-soft">{rs(a.price)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            updateQty.mutate({
                              id: a._id,
                              quantity: Math.max(1, item.quantity - 1),
                            })
                          }
                          className="h-8 w-8 rounded-lg border border-brand-200 text-brand-800 hover:border-brand-400"
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQty.mutate({
                              id: a._id,
                              quantity: Math.min(5, item.quantity + 1),
                            })
                          }
                          className="h-8 w-8 rounded-lg border border-brand-200 text-brand-800 hover:border-brand-400"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove.mutate(a._id)}
                        className="text-sm font-medium text-ink-muted hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate("/shop")}
              className="text-sm font-semibold text-brand-700 hover:underline"
            >
              ← Continue shopping
            </button>
            <button
              type="button"
              onClick={() => clear.mutate()}
              className="text-sm font-medium text-ink-muted hover:text-red-600"
            >
              Clear cart
            </button>
          </div>
        </div>

        <div className="h-fit rounded-xl border border-brand-100 bg-white p-6">
          <p className="font-display text-xl font-bold">Order summary</p>
          <div className="mt-4 divide-y divide-brand-50 text-sm">
            <div className="flex justify-between py-2">
              <span className="text-ink-muted">Subtotal ({items.length} items)</span>
              <span className="font-semibold">{rs(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-ink-muted">Shipping</span>
              <span className="font-semibold">Free</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-ink-muted">Platform fee (10%)</span>
              <span className="font-semibold">Included</span>
            </div>
            <div className="flex justify-between py-2 text-base">
              <span className="font-bold">Total</span>
              <span className="font-bold text-brand-800">{rs(subtotal)}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/checkout")}
            className="mt-5 w-full rounded-full bg-brand-800 py-3 text-sm font-semibold text-white transition hover:bg-brand-900"
          >
            Checkout securely →
          </button>
          <p className="mt-3 text-center text-xs text-ink-muted">
            Payments held in escrow until you approve delivery.
          </p>
        </div>
      </div>
      {error && <p className="mt-2 text-red-600">{error.message}</p>}
    </div>
  );
}
