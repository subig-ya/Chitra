import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
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

function BellIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  );
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const { data: count } = useQuery({
    queryKey: ["notif-unread"],
    queryFn: async () => (await api.get("/notifications/unread-count")).data,
    refetchInterval: 10_000,
  });
  const unread = count?.unread || 0;

  const { data: feed } = useQuery({
    queryKey: ["notif-feed"],
    queryFn: async () => (await api.get("/notifications?limit=7")).data,
    enabled: open,
  });
  const items = feed?.data || [];

  const markAll = useMutation({
    mutationFn: async () => (await api.patch("/notifications/read-all")).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notif-unread"] });
      queryClient.invalidateQueries({ queryKey: ["notif-feed"] });
    },
  });

  const clickItem = (n) => {
    if (!n.readAt) api.patch(`/notifications/${n._id}/read`).then(() => {
      queryClient.invalidateQueries({ queryKey: ["notif-unread"] });
      queryClient.invalidateQueries({ queryKey: ["notif-feed"] });
    });
    setOpen(false);
    const to = refTarget(n);
    navigate(to || "/panel/notifications");
  };

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-slate-600 transition hover:bg-slate-100"
        aria-label={`Notifications, ${unread} unread`}
      >
        <BellIcon />
        {unread > 0 && (
          <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <p className="text-sm font-bold">Notifications</p>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                className="text-xs font-semibold text-amber-600 hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <p className="p-6 text-center text-sm text-slate-400">
                No notifications yet.
              </p>
            )}
            {items.map((n) => (
              <button
                key={n._id}
                type="button"
                onClick={() => clickItem(n)}
                className={`flex w-full gap-3 border-b border-slate-50 px-4 py-3 text-left transition hover:bg-slate-50 ${
                  n.readAt ? "" : "bg-amber-50/40"
                }`}
              >
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    n.readAt ? "bg-slate-200" : "bg-amber-600"
                  }`}
                />
                <span className="min-w-0">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-slate-800">
                      {n.title}
                    </span>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {timeAgo(n.createdAt)}
                    </span>
                  </span>
                  {n.message && (
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {n.message}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              navigate("/panel/notifications");
            }}
            className="block w-full bg-slate-50 py-2.5 text-center text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}
