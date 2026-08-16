import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api.js";
import { timeAgo } from "../../lib/time.js";

function refTarget(notification) {
  switch (notification.refModel) {
    case "Order":
    case "Dispute":
      return `/orders/${notification.refId}`;
    case "Artwork":
      return `/artworks/${notification.refId}`;
    case "Conversation":
      return "/panel/messages";
    case "Report":
      return "/panel/reports";
    case "CommissionRequest":
      return "/requests";
    default:
      return null;
  }
}

export default function PanelNotifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notif-list"],
    queryFn: async () => (await api.get("/notifications?limit=50")).data,
    refetchInterval: 15_000,
  });
  const items = data?.data || [];

  const markAll = useMutation({
    mutationFn: async () => (await api.patch("/notifications/read-all")).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notif-list"] });
      queryClient.invalidateQueries({ queryKey: ["notif-unread"] });
    },
  });

  const markOne = (id) =>
    api.patch(`/notifications/${id}/read`).then(() => {
      queryClient.invalidateQueries({ queryKey: ["notif-list"] });
      queryClient.invalidateQueries({ queryKey: ["notif-unread"] });
    });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            Get alerted when you receive orders and messages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending}
          className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-500 disabled:opacity-50"
        >
          Mark all as read
        </button>
      </div>

      {isLoading && <p className="mt-8 text-slate-400">Loading…</p>}

      <div className="mt-6 space-y-2">
        {items.length === 0 && !isLoading && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
            No notifications yet. You'll be notified when you get new orders or messages.
          </p>
        )}
        {items.map((n) => (
          <button
            key={n._id}
            type="button"
            onClick={() => {
              if (!n.readAt) markOne(n._id);
              const to = refTarget(n);
              navigate(to || "/panel/notifications");
            }}
            className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
              n.readAt
                ? "border-slate-200 bg-white hover:border-amber-400"
                : "border-amber-200 bg-amber-50/50 hover:border-amber-400"
            }`}
          >
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                n.readAt ? "bg-slate-300" : "bg-amber-600"
              }`}
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-800">{n.title}</span>
                <span className="shrink-0 text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
              </span>
              {n.message && (
                <span className="mt-1 block text-sm text-slate-500">{n.message}</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
