import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import api, { apiErrorMessage } from "../lib/api.js";

export default function PaymentReturn() {
  const [params] = useSearchParams();
  const paymentId = params.get("pid");
  const reference = params.get("reference");
  const gateway = params.get("gateway");

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["verify", paymentId],
    queryFn: async () => {
      const res = await api.post("/payments/verify", { paymentId, reference });
      return res.data;
    },
    enabled: Boolean(paymentId && reference),
    retry: false,
  });

  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-2xl font-bold">Payment {gateway}</h1>
      {isLoading && <p className="mt-4 text-slate-500">Verifying payment…</p>}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p>{apiErrorMessage(error)}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      )}
      {data && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
          <p className="text-sm text-emerald-800">
            Payment of Rs.{data.payment.amount} received and held in escrow.
          </p>
          <p className="mt-1 text-xs text-emerald-600">
            Transaction: {data.payment.gatewayTransactionId}
          </p>
          <Link
            to={`/orders/${data.order._id}`}
            className="mt-4 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            View order
          </Link>
        </div>
      )}
    </div>
  );
}
