import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../../lib/api.js";
import { timeAgo } from "../../lib/time.js";
import { Icons } from "../../components/panel/icons.jsx";

const TYPE_STYLE = {
  Order: { icon: Icons.bag, tint: "bg-lavender/70" },
  Dispute: { icon: Icons.flag, tint: "bg-blush" },
  Artwork: { icon: Icons.image, tint: "bg-lavender" },
  Conversation: { icon: Icons.chat, tint: "bg-blush" },
  Report: { icon: Icons.flag, tint: "bg-lavender/70" },
  CommissionRequest: { icon: Icons.clipboard, tint: "bg-blush" },
};

const styleFor = (n) => TYPE_STYLE[n.refModel] || { icon: Icons.bell, tint: "bg-lavender" };

function refTarget(notification) {
  switch (notification.refModel) {
    case "Order":
    case "Dispute":
      return `/orders/${notification.refId}`;
    case "Artwork":
      return `/artworks/${notification.refId}`;
    case "Conversation":
      return "/messages";
    case "Report":
      return null;
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
  const unread = items.filter((n) => !n.readAt).length;

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
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-3 text-[0.68rem] font-medium tracking-[0.34em] text-rose uppercase">
            <span className="h-px w-8 bg-rose" />
            Notifications
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-plum sm:text-4xl">
            Your alerts
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            {unread > 0
              ? `You have ${unread} unread notification${unread > 1 ? "s" : ""}.`
              : "You're all caught up."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => markAll.mutate()}
          disabled={markAll.isPending || unread === 0}
          className="cta-line text-plum disabled:pointer-events-none disabled:opacity-40"
        >
          {markAll.isPending ? "Marking…" : "Mark all as read"}
        </button>
      </div>

      {isLoading && <p className="text-ink-muted">Loading…</p>}

      <div className="space-y-2.5">
        {items.length === 0 && !isLoading && (
          <div className="rounded-xl border border-dashed border-plum/20 bg-ivory p-12 text-center">
            <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-lavender/70 text-plum-600">
              {Icons.bell}
            </span>
            <p className="mt-4 font-display text-xl font-semibold text-plum">Nothing yet</p>
            <p className="mt-1 text-sm text-ink-muted">
              You'll be notified when you get new orders, messages or reports.
            </p>
          </div>
        )}
        {items.map((n) => {
          const s = styleFor(n);
          const isRead = Boolean(n.readAt);
          return (
            <button
              key={n._id}
              type="button"
              onClick={() => {
                if (!isRead) markOne(n._id);
                const to = refTarget(n);
                if (to) navigate(to);
              }}
              className={`group flex w-full items-start gap-4 rounded-xl border bg-ivory p-4 text-left transition duration-300 hover:border-rose/40 hover:shadow-sm ${
                isRead ? "border-plum/10" : "border-rose/40 bg-blush/40"
              }`}
            >
              <span
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-plum-600 transition-transform duration-300 group-hover:scale-105 ${s.tint}`}
              >
                {s.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-plum">{n.title}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    {!isRead && <span className="h-2 w-2 rounded-full bg-rose" />}
                    <span className="text-xs text-ink-muted">{timeAgo(n.createdAt)}</span>
                  </span>
                </span>
                {n.message && (
                  <span className="mt-1 block text-sm text-ink-soft">{n.message}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
