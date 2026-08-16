import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import api, { apiErrorMessage } from "../../lib/api.js";
import { useAuth } from "../../lib/auth.jsx";
import ImageUpload from "../../components/panel/ImageUpload.jsx";

export default function PanelSettings() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuth();
  const isArtist = user?.role === "artist";

  const { data } = useQuery({
    queryKey: ["me"],
    queryFn: async () => (await api.get("/users/me")).data,
  });
  const me = data?.user || user || {};

  const [form, setForm] = useState({
    name: "",
    bio: "",
    avatar: "",
    coverImage: "",
    artistBio: "",
    yearsExperience: "",
    specialty: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (me._id) {
      setForm({
        name: me.name || "",
        bio: me.bio || "",
        avatar: me.avatar || "",
        coverImage: me.coverImage || "",
        artistBio: me.artistProfile?.bio || "",
        yearsExperience: me.artistProfile?.yearsExperience ?? "",
        specialty: me.artistProfile?.specialty || "",
      });
    }
  }, [me._id]);

  const save = useMutation({
    mutationFn: async (payload) => (await api.patch("/users/me", payload)).data,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      const { data: fresh } = await api.get("/users/me");
      updateUser(fresh.user);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => setError(apiErrorMessage(err, "Could not save profile.")),
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setError("");
    const payload = { name: form.name, bio: form.bio, avatar: form.avatar };
    if (isArtist) {
      payload.coverImage = form.coverImage;
      payload.artistProfile = {
        bio: form.artistBio,
        yearsExperience: form.yearsExperience
          ? Number(form.yearsExperience)
          : undefined,
        specialty: form.specialty,
      };
    }
    save.mutate(payload);
  };

  const input =
    "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none";

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Profile settings</h1>
      <p className="mt-1 text-sm text-slate-500">
        {isArtist
          ? "Set your cover and profile photo, bio and experience."
          : "Update your name, photo and bio."}
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {isArtist && (
          <div className="h-40 bg-gradient-to-r from-slate-200 to-slate-100">
            {form.coverImage && (
              <img src={form.coverImage} alt="Cover" className="h-full w-full object-cover" />
            )}
          </div>
        )}
        <div className={isArtist ? "-mt-12 px-6 pb-6" : "p-6"}>
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100">
            {form.avatar ? (
              <img src={form.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-slate-400">
                {(form.name || "A").charAt(0)}
              </span>
            )}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-5">
            <div className="grid gap-5 lg:grid-cols-2">
              <ImageUpload
                label="Profile photo"
                value={form.avatar}
                onChange={(v) => setForm((f) => ({ ...f, avatar: v }))}
                roundedClass="rounded-full"
              />
              {isArtist && (
                <ImageUpload
                  label="Cover photo"
                  value={form.coverImage}
                  onChange={(v) => setForm((f) => ({ ...f, coverImage: v }))}
                  roundedClass="rounded-2xl"
                />
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Name *</span>
                <input className={input} required value={form.name} onChange={set("name")} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Short bio</span>
                <input
                  className={input}
                  placeholder="A one-liner about you"
                  value={form.bio}
                  onChange={set("bio")}
                />
              </label>
              {isArtist && (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Specialty</span>
                    <input
                      className={input}
                      placeholder="e.g. Oil painting, Portraits"
                      value={form.specialty}
                      onChange={set("specialty")}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">
                      Years of experience
                    </span>
                    <input
                      className={input}
                      type="number"
                      min={0}
                      max={100}
                      placeholder="e.g. 5"
                      value={form.yearsExperience}
                      onChange={set("yearsExperience")}
                    />
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-slate-500">
                      About / experience
                    </span>
                    <textarea
                      className={input}
                      rows={4}
                      placeholder="Tell collectors about your journey, training and experience…"
                      value={form.artistBio}
                      onChange={set("artistBio")}
                    />
                  </label>
                </>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {save.isSuccess && (
              <p className="text-sm text-emerald-600">Profile updated.</p>
            )}

            <button
              type="submit"
              disabled={save.isPending}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
