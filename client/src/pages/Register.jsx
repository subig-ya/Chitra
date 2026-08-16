import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth.jsx";
import { apiErrorMessage } from "../lib/api.js";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register({ name, email, password, role });
      navigate("/panel");
    } catch (err) {
      setError(apiErrorMessage(err, "Registration failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold">Create your account</h1>
      <form
        onSubmit={submit}
        className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6"
      >
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium">I am a…</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="buyer">Buyer — commissioning art</option>
            <option value="artist">Artist — selling commissions</option>
          </select>
        </label>
        <button
          disabled={busy}
          className="w-full rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {busy ? "Creating account…" : "Sign up"}
        </button>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-amber-600">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
