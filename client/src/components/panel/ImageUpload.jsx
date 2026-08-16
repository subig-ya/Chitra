import { useRef, useState } from "react";
import api, { apiErrorMessage } from "../../lib/api.js";

export default function ImageUpload({ value, onChange, label, roundedClass = "rounded-xl" }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    const form = new FormData();
    form.append("image", file);
    try {
      const res = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(res.data.url);
    } catch (err) {
      setError(apiErrorMessage(err, "Upload failed"));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-32 w-32 items-center justify-center overflow-hidden border border-dashed border-slate-300 bg-slate-50 ${roundedClass}`}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs text-slate-400">No image</span>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-500 disabled:opacity-50"
          >
            {busy ? "Uploading…" : value ? "Change image" : "Upload image"}
          </button>
          <p className="mt-1.5 max-w-[14rem] text-xs text-slate-400">
            JPG, PNG, WEBP or GIF, up to 5 MB.
          </p>
          {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={pick}
      />
    </div>
  );
}
