import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api, { apiErrorMessage } from "../lib/api.js";

const MEDIUMS = [
  "Painting",
  "Photography",
  "Sculpture",
  "Drawing",
  "Print",
  "Mixed Media",
];
const SUBJECTS = [
  "Abstract",
  "Landscape",
  "Portrait",
  "Figurative",
  "Still Life",
  "Botanical",
  "Wildlife",
  "Cityscape",
  "Spiritual",
  "Other",
];

const rs = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  medium: "Painting",
  subject: "Abstract",
  style: "",
  widthCm: "",
  heightCm: "",
  depthCm: "",
  yearCreated: "",
  price: "",
};

export default function MyArtworks() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["my-artworks"],
    queryFn: async () => (await api.get("/artworks/me")).data,
  });
  const artworks = data?.data || [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["my-artworks"] });

  const startEdit = (a) => {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description || "",
      imageUrl: a.imageUrl,
      medium: a.medium,
      subject: a.subject || "Other",
      style: a.style || "",
      widthCm: a.widthCm || "",
      heightCm: a.heightCm || "",
      depthCm: a.depthCm || "",
      yearCreated: a.yearCreated || "",
      price: a.price,
    });
    setError("");
  };

  const save = useMutation({
    mutationFn: async (payload) => {
      const url = editing ? `/artworks/${editing._id}` : "/artworks";
      const method = editing ? "patch" : "post";
      return (await api[method](url, payload)).data;
    },
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      setEditing(null);
      setForm(emptyForm);
    },
    onError: (err) => setError(apiErrorMessage(err, "Could not save artwork.")),
  });

  const remove = useMutation({
    mutationFn: async (id) => (await api.delete(`/artworks/${id}`)).data,
    onSuccess: invalidate,
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      widthCm: form.widthCm ? Number(form.widthCm) : undefined,
      heightCm: form.heightCm ? Number(form.heightCm) : undefined,
      depthCm: form.depthCm ? Number(form.depthCm) : 0,
      yearCreated: form.yearCreated ? Number(form.yearCreated) : undefined,
      price: Number(form.price),
    };
    save.mutate(payload);
  };

  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">My Artworks</h1>
          <p className="mt-1 text-ink-muted">
            List originals for direct sale. New listings are reviewed by our
            team before going live.
          </p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setEditing({ _id: null });
              setForm(emptyForm);
            }}
            className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-900"
          >
            + New artwork
          </button>
        )}
      </div>

      {editing && (
        <form
          onSubmit={submit}
          className="mb-8 rounded-2xl border border-brand-100 bg-white p-6"
        >
          <p className="font-display text-lg font-bold">
            {editing._id ? "Edit artwork" : "List a new artwork"}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <label className="mb-1 block text-xs font-medium text-ink-soft">Title *</label>
              <input className={input} required value={form.title} onChange={set("title")} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Price (Rs.) *</label>
              <input className={input} required type="number" min={1} value={form.price} onChange={set("price")} />
            </div>
            <div className="lg:col-span-3">
              <label className="mb-1 block text-xs font-medium text-ink-soft">Image URL *</label>
              <input className={input} required type="url" placeholder="https://images.pexels.com/…" value={form.imageUrl} onChange={set("imageUrl")} />
            </div>
            <div className="lg:col-span-3">
              <label className="mb-1 block text-xs font-medium text-ink-soft">Description</label>
              <textarea className={input} rows={3} value={form.description} onChange={set("description")} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Medium *</label>
              <select className={input} value={form.medium} onChange={set("medium")}>
                {MEDIUMS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Subject</label>
              <select className={input} value={form.subject} onChange={set("subject")}>
                {SUBJECTS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Style</label>
              <input className={input} placeholder="e.g. Minimal" value={form.style} onChange={set("style")} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Width (cm)</label>
              <input className={input} type="number" min={1} value={form.widthCm} onChange={set("widthCm")} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Height (cm)</label>
              <input className={input} type="number" min={1} value={form.heightCm} onChange={set("heightCm")} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Depth (cm)</label>
              <input className={input} type="number" min={0} value={form.depthCm} onChange={set("depthCm")} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">Year created</label>
              <input className={input} type="number" min={1900} max={2100} value={form.yearCreated} onChange={set("yearCreated")} />
            </div>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={save.isPending}
              className="rounded-full bg-brand-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : editing._id ? "Save changes" : "List artwork"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(emptyForm);
                setError("");
              }}
              className="rounded-full border border-brand-200 px-6 py-2.5 text-sm font-semibold text-ink-soft hover:border-brand-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading && <p className="text-ink-muted">Loading your artworks…</p>}

      {!isLoading && artworks.length === 0 && (
        <p className="rounded-xl border border-dashed border-brand-200 p-8 text-center text-ink-muted">
          You haven't listed any artworks yet.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {artworks.map((a) => (
          <div
            key={a._id}
            className="overflow-hidden rounded-xl border border-brand-100 bg-white"
          >
            <img src={a.imageUrl} alt={a.title} className="aspect-[4/3] w-full object-cover" />
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-lg font-semibold">{a.title}</p>
                  <p className="text-sm text-ink-soft">{rs(a.price)}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    a.isVerified
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {a.isVerified ? "Live" : "Under review"}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-ink-soft">
                <span className="rounded-md bg-brand-50 px-2 py-0.5">{a.medium}</span>
                <span className="rounded-md bg-brand-50 px-2 py-0.5">
                  {a.availability}
                </span>
              </div>
              <div className="mt-3 flex gap-2 border-t border-brand-50 pt-3">
                <button
                  type="button"
                  onClick={() => startEdit(a)}
                  className="flex-1 rounded-full border border-brand-200 py-1.5 text-xs font-semibold text-brand-800 hover:border-brand-400"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete "${a.title}"?`)) remove.mutate(a._id);
                  }}
                  className="rounded-full border border-red-200 px-4 py-1.5 text-xs font-semibold text-red-600 hover:border-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
