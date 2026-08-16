import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "../lib/auth.jsx";
import api, { apiErrorMessage } from "../lib/api.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function Requests() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isArtist = user.role === "artist";

  const { data, isLoading } = useQuery({
    queryKey: ["requests"],
    queryFn: async () => (await api.get("/requests/my")).data,
  });

  const action = useMutation({
    mutationFn: ({ id, path, payload }) =>
      api.patch(`/requests/${id}${path}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["requests"] }),
    onError: (err) => alert(apiErrorMessage(err)),
  });

  const [quote, setQuote] = useState({});
  const setQuoteFor = (id, field, value) =>
    setQuote((q) => ({ ...q, [id]: { ...q[id], [field]: value } }));

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {isArtist ? "Commission requests" : "My requests"}
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        {isArtist
          ? "Review briefs and send a quote or decline."
          : "Track your requests and accept quotes."}
      </p>

      {isLoading && <p className="mt-6 text-slate-400">Loading…</p>}

      <div className="mt-6 space-y-3">
        {data?.data.map((r) => {
          const otherName =
            r.artistId?.name || r.buyerId?.name || "Unknown user";
          return (
            <div
              key={r._id}
              className="rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold">
                  {isArtist ? "From" : "To"}: {otherName}
                </p>
                <StatusBadge status={r.status} />
              </div>
              <p className="mt-2 text-sm text-slate-600">{r.briefDescription}</p>
              {r.packageTitle && (
                <p className="mt-1 text-xs text-slate-400">
                  Package: {r.packageTitle}
                </p>
              )}
              {r.budgetRange && (
                <p className="mt-1 text-xs text-slate-400">
                  Budget: Rs.{r.budgetRange.min}–{r.budgetRange.max}
                </p>
              )}

              {r.status === "pending" && isArtist && (
                <div className="mt-4 grid gap-3 rounded-lg bg-slate-50 p-3 sm:grid-cols-3">
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Price (Rs.)"
                    type="number"
                    value={quote[r._id]?.price || ""}
                    onChange={(e) => setQuoteFor(r._id, "price", e.target.value)}
                  />
                  <input
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Turnaround (days)"
                    type="number"
                    value={quote[r._id]?.days || ""}
                    onChange={(e) => setQuoteFor(r._id, "days", e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={
                        !quote[r._id]?.price || !quote[r._id]?.days
                      }
                      onClick={() =>
                        action.mutate({
                          id: r._id,
                          path: "/quote",
                          payload: {
                            quotedPrice: Number(quote[r._id].price),
                            quotedTurnaroundDays: Number(quote[r._id].days),
                          },
                        })
                      }
                      className="flex-1 rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
                    >
                      Quote
                    </button>
                    <button
                      onClick={() => action.mutate({ id: r._id, path: "/reject" })}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              )}

              {r.status === "quoted" && !isArtist && (
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-amber-50 p-3">
                  <div className="flex-1 text-sm">
                    <p className="font-semibold">
                      Quote: Rs.{r.quote.quotedPrice}
                      <span className="font-normal text-slate-500">
                        {" "}
                        · {r.quote.quotedTurnaroundDays} days
                      </span>
                    </p>
                    {r.quote.quoteNote && (
                      <p className="text-slate-500">{r.quote.quoteNote}</p>
                    )}
                  </div>
                  <button
                    onClick={() => action.mutate({ id: r._id, path: "/accept" })}
                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Accept & create order
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {data && data.data.length === 0 && (
          <p className="text-slate-500">Nothing here yet.</p>
        )}
      </div>
    </div>
  );
}
