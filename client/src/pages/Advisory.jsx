import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import api, { apiErrorMessage } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

const ROOMS = [
  "Living room",
  "Bedroom",
  "Office / studio",
  "Entrance / hallway",
  "Dining room",
  "Other",
];

export default function Advisory() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    budgetMin: "",
    budgetMax: "",
    room: "Living room",
    message: "",
  });
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async (payload) =>
      (await api.post("/advisory/requests", payload)).data,
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    mutation.mutate(
      {
        ...form,
        budgetMin: form.budgetMin ? Number(form.budgetMin) : undefined,
        budgetMax: form.budgetMax ? Number(form.budgetMax) : undefined,
      },
      { onSuccess: () => setDone(true) }
    );
  };

  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none";

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <p className="text-sm font-semibold tracking-widest text-brand-600 uppercase">
          Art Advisory
        </p>
        <h1 className="mt-1 font-display text-4xl font-bold">
          Not sure where to start?
        </h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          Tell us about your space and your taste. Our advisors — collectors and
          curators — will match you with original works, suggest a layout, and
          stay within your budget. Free, no obligation.
        </p>

        <div className="mt-6 space-y-3">
          {[
            ["Personal taste", "Curators who listen first."],
            ["Budget-matched", "Recommendations within your range."],
            ["Room-specific", "Size, light, and placement advice."],
            ["Free & no obligation", "Browse, think, decide on your own time."],
          ].map(([t, d]) => (
            <div
              key={t}
              className="flex items-start gap-3 rounded-xl border border-brand-100 bg-white p-4"
            >
              <span className="mt-0.5 text-brand-700">&#10003;</span>
              <div>
                <p className="text-sm font-semibold">{t}</p>
                <p className="text-sm text-ink-soft">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-6">
        {done ? (
          <div className="py-10 text-center">
            <p className="font-display text-2xl font-bold">Request received</p>
            <p className="mt-2 text-ink-soft">
              Our team will email you within 1–2 working days with a first set
              of suggestions.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Your name *
                </label>
                <input className={input} required value={form.name} onChange={set("name")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Email *
                </label>
                <input className={input} required type="email" value={form.email} onChange={set("email")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Phone
                </label>
                <input className={input} value={form.phone} onChange={set("phone")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Room
                </label>
                <select className={input} value={form.room} onChange={set("room")}>
                  {ROOMS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Budget from (Rs.)
                </label>
                <input className={input} type="number" value={form.budgetMin} onChange={set("budgetMin")} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-soft">
                  Budget to (Rs.)
                </label>
                <input className={input} type="number" value={form.budgetMax} onChange={set("budgetMax")} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-ink-soft">
                Tell us about your space and taste *
              </label>
              <textarea
                className={input}
                rows={4}
                required
                placeholder="Wall sizes, preferred colors, styles you love, pieces you already have…"
                value={form.message}
                onChange={set("message")}
              />
            </div>

            {mutation.isError && (
              <p className="text-sm text-red-600">
                {apiErrorMessage(mutation.error, "Could not send your request.")}
              </p>
            )}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full rounded-full bg-brand-800 py-3 text-sm font-semibold text-white transition hover:bg-brand-900 disabled:opacity-60"
            >
              {mutation.isPending ? "Sending…" : "Request advisory"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
