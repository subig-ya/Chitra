import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams } from "react-router-dom";
import api, { apiErrorMessage } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";
import StatusBadge from "../components/StatusBadge.jsx";

const STEPS = {
  awaiting_payment: 1,
  in_progress: 2,
  delivered: 3,
  revision_requested: 2,
  completed: 4,
};

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [deliverUrl, setDeliverUrl] = useState("");
  const [milestone, setMilestone] = useState({ title: "", note: "" });
  const [disputeReason, setDisputeReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await api.get(`/orders/${id}`)).data,
  });

  const mutate = useMutation({
    mutationFn: ({ path, payload }) =>
      api.patch(`/orders/${id}${path}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const payMutation = useMutation({
    mutationFn: async (gateway) => {
      const { data: pay } = await api.post("/payments/initiate", {
        orderId: id,
        gateway,
      });
      window.location.href = pay.redirectUrl;
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const disputeMutation = useMutation({
    mutationFn: () => api.post("/disputes", { orderId: id, reason: disputeReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      setDisputeReason("");
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  if (isLoading) return <p className="text-slate-400">Loading order…</p>;
  if (!data) return <p className="text-red-600">Order not found.</p>;

  const order = data.order;
  const isBuyer = user.role === "buyer";
  const isArtist = user.role === "artist";
  const other = isBuyer ? order.artistId : order.buyerId;

  const step = STEPS[order.status] || 1;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <h1 className="text-xl font-bold">
              {order.packageTitle || "Commission"}
            </h1>
            <p className="text-sm text-slate-500">
              {isBuyer ? "Artist" : "Buyer"}: {other?.name} · order{" "}
              {order._id.slice(-6)}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Escrow progress */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex justify-between text-xs font-medium text-slate-500">
            <span>Payment</span>
            <span>In progress</span>
            <span>Delivered</span>
            <span>Released</span>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  s <= step ? "bg-amber-500" : "bg-slate-200"
                }`}
              />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Agreed price</p>
              <p className="font-bold">Rs.{order.agreedPrice}</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Platform fee</p>
              <p className="font-bold">{order.platformFeePercent}%</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Artist payout</p>
              <p className="font-bold text-emerald-600">
                Rs.{order.artistPayoutAmount}
              </p>
            </div>
          </div>
          {order.status === "delivered" && order.autoReleaseAt && (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Delivery will auto-approve and release escrow on{" "}
              {new Date(order.autoReleaseAt).toLocaleString()} if not reviewed.
            </p>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {/* Buyer actions */}
        {isBuyer && order.status === "awaiting_payment" && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">Pay to start the commission</h3>
            <p className="mt-1 text-sm text-slate-500">
              Funds are held in escrow until you approve the final work.
            </p>
            <div className="mt-3 flex gap-2">
              {["esewa", "khalti"].map((g) => (
                <button
                  key={g}
                  disabled={payMutation.isPending}
                  onClick={() => payMutation.mutate(g)}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  Pay Rs.{order.agreedPrice} with {g}
                </button>
              ))}
              <button
                onClick={() => mutate.mutate({ path: "/cancel" })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isBuyer && order.status === "delivered" && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">Review the delivery</h3>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => mutate.mutate({ path: "/approve" })}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Approve — release escrow
              </button>
              <button
                disabled={order.revisionCount >= order.revisionLimit}
                onClick={() => mutate.mutate({ path: "/request-revision" })}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
              >
                Request revision ({order.revisionCount}/{order.revisionLimit})
              </button>
            </div>
          </div>
        )}

        {/* Artist actions */}
        {isArtist &&
          ["in_progress", "revision_requested"].includes(order.status) && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-semibold">Post a milestone</h3>
              <div className="mt-2 flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Title (e.g. Sketch)"
                  value={milestone.title}
                  onChange={(e) =>
                    setMilestone((m) => ({ ...m, title: e.target.value }))
                  }
                />
                <input
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Note"
                  value={milestone.note}
                  onChange={(e) =>
                    setMilestone((m) => ({ ...m, note: e.target.value }))
                  }
                />
                <button
                  disabled={!milestone.title}
                  onClick={() =>
                    mutate.mutate({
                      path: "/milestone",
                      payload: { ...milestone },
                    })
                  }
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Post
                </button>
              </div>

              <h3 className="mt-5 font-semibold">Submit final deliverable</h3>
              <div className="mt-2 flex gap-2">
                <input
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="https://…/final-file.png"
                  value={deliverUrl}
                  onChange={(e) => setDeliverUrl(e.target.value)}
                />
                <button
                  disabled={!deliverUrl}
                  onClick={() =>
                    mutate.mutate({ path: "/deliver", payload: { fileUrl: deliverUrl } })
                  }
                  className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-40"
                >
                  Deliver
                </button>
              </div>
            </div>
          )}

        {/* Dispute */}
        {["in_progress", "delivered", "revision_requested"].includes(
          order.status
        ) && (
          <div className="mt-4 rounded-xl border border-red-200 bg-white p-5">
            <h3 className="font-semibold text-red-700">Raise a dispute</h3>
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Reason (at least 10 characters)"
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
              />
              <button
                disabled={disputeReason.length < 10 || disputeMutation.isPending}
                onClick={() => disputeMutation.mutate()}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-40"
              >
                Dispute
              </button>
            </div>
          </div>
        )}

        {/* Deliverables */}
        {order.deliverables.length > 0 && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">Deliverables</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {order.deliverables.map((d) => (
                <li key={d.version} className="flex items-center gap-2">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs">
                    v{d.version}
                  </span>
                  <a
                    className="text-amber-700 hover:underline"
                    href={d.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {d.fileUrl}
                  </a>
                  <span className="text-xs text-slate-400">
                    {new Date(d.submittedAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Milestones */}
      <div>
        <h2 className="text-lg font-semibold">Progress updates</h2>
        <div className="mt-3 space-y-3">
          {order.milestones.map((m) => (
            <div
              key={m._id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <p className="font-semibold">{m.title}</p>
              {m.note && <p className="mt-1 text-sm text-slate-600">{m.note}</p>}
              <p className="mt-2 text-xs text-slate-400">
                {new Date(m.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {order.milestones.length === 0 && (
            <p className="text-sm text-slate-500">No updates yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
