import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api, { apiErrorMessage } from "../../lib/api.js";
import { timeAgo } from "../../lib/time.js";

const CATEGORIES = [
  { value: "harassment", label: "Harassment or abuse" },
  { value: "late_payment", label: "Late or non-payment" },
  { value: "misuse_of_work", label: "Misuse of my work" },
  { value: "no_show", label: "No-show / ghosting" },
  { value: "false_claim", label: "False claim about delivery" },
  { value: "other", label: "Other" },
];

const STATUS_STYLES = {
  new: "bg-amber-100 text-amber-700",
  reviewed: "bg-blue-100 text-blue-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

export default function PanelReports() {
  const queryClient = useQueryClient();
  const [reportedUserId, setReportedUserId] = useState("");
  const [orderId, setOrderId] = useState("");
  const [category, setCategory] = useState("late_payment");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const { data: ordersData } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.get("/orders")).data,
  });
  const orders = ordersData?.data || [];

  const customers = [
    ...new Map(
      orders
        .filter((o) => o.buyerId?._id)
        .map((o) => [o.buyerId._id, o.buyerId])
    ).values(),
  ];

  const customerOrders = orderId
    ? orders.filter((o) => String(o._id) === orderId)
    : reportedUserId
      ? orders.filter((o) => String(o.buyerId?._id) === reportedUserId)
      : [];

  const { data: myReports } = useQuery({
    queryKey: ["my-reports"],
    queryFn: async () => (await api.get("/reports/mine")).data,
  });
  const reports = myReports?.data || [];

  const create = useMutation({
    mutationFn: async (payload) => (await api.post("/reports", payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reports"] });
      setDescription("");
      setOrderId("");
      setError("");
      setReportedUserId("");
      setCategory("late_payment");
    },
    onError: (err) => setError(apiErrorMessage(err, "Could not submit report.")),
  });

  const submit = (e) => {
    e.preventDefault();
    if (!reportedUserId) {
      setError("Please choose the customer you want to report.");
      return;
    }
    create.mutate({
      reportedUserId,
      orderId: orderId || undefined,
      category,
      description,
    });
  };

  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none";

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl font-bold">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Report a customer who behaved unfairly. Your report goes straight to
          the Chitra team for review.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6"
      >
        <p className="font-display text-lg font-bold">Report a customer</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              Customer *
            </span>
            <select
              className={input}
              value={reportedUserId}
              onChange={(e) => {
                setReportedUserId(e.target.value);
                setOrderId("");
              }}
              required
            >
              <option value="">Select a customer…</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              Related order (optional)
            </span>
            <select
              className={input}
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            >
              <option value="">No specific order</option>
              {customerOrders.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.packageTitle || "Commission"} · {o.status}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              Reason *
            </span>
            <select
              className={input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              What happened? *
            </span>
            <textarea
              className={input}
              rows={4}
              minLength={10}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what the customer did…"
            />
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={create.isPending}
          className="mt-5 rounded-full bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {create.isPending ? "Submitting…" : "Submit report"}
        </button>
      </form>

      <h2 className="mt-8 font-display text-xl font-bold">Your reports</h2>
      <div className="mt-3 space-y-2">
        {reports.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
            You haven't submitted any reports.
          </p>
        )}
        {reports.map((r) => (
          <div
            key={r._id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-bold">
                {r.reportedUserId?.name || "Customer"} —{" "}
                {CATEGORIES.find((c) => c.value === r.category)?.label || r.category}
              </p>
              <span className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{timeAgo(r.createdAt)}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[r.status] || "bg-slate-100 text-slate-600"}`}
                >
                  {r.status}
                </span>
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{r.description}</p>
            {r.resolutionNote && (
              <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                <span className="font-semibold">Chitra's note:</span> {r.resolutionNote}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
