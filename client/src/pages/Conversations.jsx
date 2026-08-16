import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api, { apiErrorMessage } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default function Conversations() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [active, setActive] = useState(params.get("cid"));
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);

  const artistIdParam = params.get("artistId");

  const { data: list } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => (await api.get("/conversations")).data,
    refetchInterval: 8000,
  });
  const conversations = list?.data || [];

  const ensure = useMutation({
    mutationFn: async (artistId) =>
      (await api.post("/conversations", { artistId })).data,
    onSuccess: (res) => {
      setActive(res.conversation._id);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      setParams({}, { replace: true });
    },
  });

  useEffect(() => {
    if (artistIdParam) {
      const existing = conversations.find(
        (c) => String(c.other._id) === artistIdParam
      );
      if (existing) {
        setActive(existing._id);
        setParams({}, { replace: true });
      } else {
        ensure.mutate(artistIdParam);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistIdParam]);

  const { data: thread } = useQuery({
    queryKey: ["messages", active],
    queryFn: async () => (await api.get(`/conversations/${active}/messages`)).data,
    enabled: Boolean(active),
    refetchInterval: 5000,
  });
  const messages = thread?.messages || [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, active]);

  const send = useMutation({
    mutationFn: async (content) =>
      (await api.post(`/conversations/${active}/messages`, { content })).data,
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["messages", active] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const activeConv = conversations.find((c) => c._id === active);

  const submit = (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !active) return;
    send.mutate(content);
  };

  return (
    <div className="grid min-h-[60vh] overflow-hidden rounded-2xl border border-brand-100 bg-white lg:grid-cols-3">
      <div className={`border-brand-100 lg:col-span-1 lg:border-r ${active ? "hidden lg:block" : ""}`}>
        <div className="border-b border-brand-50 px-4 py-3">
          <h1 className="font-display text-lg font-bold">Messages</h1>
          <p className="text-xs text-ink-muted">
            Talk directly with artists about works and commissions.
          </p>
        </div>
        <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
          {conversations.length === 0 && (
            <p className="p-6 text-sm text-ink-muted">
              No conversations yet. Open an artwork and ask the artist.
            </p>
          )}
          {conversations.map((c) => (
            <button
              key={c._id}
              type="button"
              onClick={() => setActive(c._id)}
              className={`flex w-full items-center gap-3 border-b border-brand-50 px-4 py-3 text-left transition hover:bg-brand-50/60 ${
                active === c._id ? "bg-brand-50" : ""
              }`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white">
                {(c.other.name || "?").charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">
                    {c.other.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-muted">
                    {timeAgo(c.lastMessageAt)}
                  </span>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-xs text-ink-soft">
                    {c.lastMessage || "Say hello…"}
                  </span>
                  {c.unread > 0 && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={`flex flex-col lg:col-span-2 ${active ? "" : "hidden lg:flex"}`}>
        {!activeConv ? (
          <div className="flex flex-1 items-center justify-center p-10 text-ink-muted">
            Select a conversation to start messaging.
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-brand-50 px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-800 text-sm font-bold text-white">
                {(activeConv.other.name || "?").charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold">{activeConv.other.name}</p>
                <p className="text-xs text-ink-muted">
                  {activeConv.other.role === "artist" ? "Artist" : "Collector"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/shop")}
                className="ml-auto rounded-full border border-brand-200 px-3 py-1 text-xs font-semibold text-brand-800 hover:border-brand-400"
              >
                Browse artworks
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto bg-brand-50/30 p-4">
              {messages.map((m) => {
                const mine = m.senderId === user._id;
                return (
                  <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                        mine
                          ? "rounded-br-sm bg-brand-800 text-white"
                          : "rounded-bl-sm border border-brand-100 bg-white text-ink"
                      }`}
                    >
                      <p>{m.content}</p>
                      <p className={`mt-1 text-[10px] ${mine ? "text-brand-200" : "text-ink-muted"}`}>
                        {timeAgo(m.createdAt)}
                        {mine && " · sent"}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <form onSubmit={submit} className="border-t border-brand-50 p-3">
              {send.isError && (
                <p className="mb-2 text-xs text-red-600">
                  {apiErrorMessage(send.error, "Could not send message.")}
                </p>
              )}
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={send.isPending || !draft.trim()}
                  className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
