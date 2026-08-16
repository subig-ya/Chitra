const styles = {
  awaiting_payment: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  delivered: "bg-violet-100 text-violet-800",
  revision_requested: "bg-orange-100 text-orange-800",
  completed: "bg-emerald-100 text-emerald-800",
  disputed: "bg-red-100 text-red-800",
  cancelled: "bg-slate-200 text-slate-600",
  refunded: "bg-slate-200 text-slate-600",
  pending: "bg-slate-200 text-slate-700",
  quoted: "bg-cyan-100 text-cyan-800",
  accepted: "bg-emerald-100 text-emerald-800",
  rejected: "bg-slate-200 text-slate-600",
  expired: "bg-slate-200 text-slate-600",
  open: "bg-red-100 text-red-800",
  under_review: "bg-amber-100 text-amber-800",
  resolved: "bg-emerald-100 text-emerald-800",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        styles[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status?.replace(/_/g, " ")}
    </span>
  );
}
