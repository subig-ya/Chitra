import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import api, { apiErrorMessage } from "../lib/api.js";
import { useAuth } from "../lib/auth.jsx";

export default function Profile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const [pkg, setPkg] = useState({
    title: "",
    description: "",
    basePrice: "",
    turnaroundDays: "",
    revisionLimit: 2,
  });

  const packageMutation = useMutation({
    mutationFn: ({ path, payload, method = "post" }) =>
      api[method](`/artists/me/packages${path}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      setPkg({ title: "", description: "", basePrice: "", turnaroundDays: "", revisionLimit: 2 });
    },
    onError: (err) => setError(apiErrorMessage(err)),
  });

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
  });

  const me = data?.user || user;
  const profile = me?.artistProfile || {};

  const submitPackage = (e) => {
    e.preventDefault();
    setError("");
    packageMutation.mutate({
      path: "",
      payload: {
        title: pkg.title,
        description: pkg.description,
        basePrice: Number(pkg.basePrice),
        turnaroundDays: Number(pkg.turnaroundDays),
        revisionLimit: Number(pkg.revisionLimit),
      },
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-xl font-bold text-white">
            {me.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{me.name}</h1>
            <p className="text-sm capitalize text-slate-500">{me.role}</p>
          </div>
        </div>
        {me.role === "artist" && (
          <div className="mt-4 space-y-2 text-sm">
            <p>
              Verification:{" "}
              <span
                className={
                  profile.isVerified
                    ? "font-semibold text-emerald-600"
                    : "font-semibold text-amber-600"
                }
              >
                {profile.isVerified ? "Verified" : "Pending review"}
              </span>
            </p>
            <p>
              Rating: ★ {profile.rating || "—"} ({profile.ratingCount} reviews)
            </p>
            <p>Orders completed: {profile.totalOrders}</p>
          </div>
        )}
      </div>

      {me.role === "artist" && (
        <div className="lg:col-span-2">
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <h2 className="text-lg font-semibold">Commission packages</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {profile.commissionPackages?.map((p) => (
              <div
                key={p._id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <p className="font-semibold">{p.title}</p>
                  <p className="font-bold text-amber-600">Rs.{p.basePrice}</p>
                </div>
                {p.description && (
                  <p className="mt-1 text-sm text-slate-500">{p.description}</p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  {p.turnaroundDays} days · {p.revisionLimit} revisions
                </p>
                <button
                  onClick={() =>
                    packageMutation.mutate({
                      path: `/${p._id}`,
                      method: "delete",
                    })
                  }
                  className="mt-2 rounded-lg border border-red-200 px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            ))}
            {!profile.commissionPackages?.length && (
              <p className="text-sm text-slate-500">
                No packages yet. Add your first below.
              </p>
            )}
          </div>

          <form
            onSubmit={submitPackage}
            className="mt-6 rounded-xl border border-slate-200 bg-white p-5"
          >
            <h3 className="font-semibold">Add a package</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Title *"
                value={pkg.title}
                onChange={(e) => setPkg({ ...pkg, title: e.target.value })}
                required
              />
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Base price (Rs.) *"
                type="number"
                value={pkg.basePrice}
                onChange={(e) => setPkg({ ...pkg, basePrice: e.target.value })}
                required
              />
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm sm:col-span-2"
                placeholder="Description"
                value={pkg.description}
                onChange={(e) =>
                  setPkg({ ...pkg, description: e.target.value })
                }
              />
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Turnaround (days) *"
                type="number"
                value={pkg.turnaroundDays}
                onChange={(e) =>
                  setPkg({ ...pkg, turnaroundDays: e.target.value })
                }
                required
              />
              <input
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Revisions included"
                type="number"
                value={pkg.revisionLimit}
                onChange={(e) =>
                  setPkg({ ...pkg, revisionLimit: e.target.value })
                }
              />
            </div>
            <button
              disabled={packageMutation.isPending}
              className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {packageMutation.isPending ? "Adding…" : "Add package"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
