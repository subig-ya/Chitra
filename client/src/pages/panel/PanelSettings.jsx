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
    "w-full rounded-lg border border-plum/20 bg-white px-3 py-2 text-sm text-plum placeholder:text-ink-muted focus:border-rose focus:ring-2 focus:ring-blush focus:outline-none";

  return (
    <div className="space-y-8">
      <div>
        <p className="flex items-center gap-3 text-[0.68rem] font-medium tracking-[0.34em] text-rose uppercase">
          <span className="h-px w-8 bg-rose" />
          Profile
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-plum sm:text-4xl">
          Profile settings
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {isArtist
            ? "Set your cover and profile photo, bio and experience."
            : "Update your name, photo and bio."}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-plum/10 bg-ivory">
        <div className="h-36 bg-gradient-to-r from-lavender via-blush to-rose-soft/60">
          {form.coverImage && (
            <img src={form.coverImage} alt="Cover" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="-mt-12 px-6 pb-6">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-rose-soft bg-blush ring-4 ring-ivory">
            {form.avatar ? (
              <img src={form.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="font-display text-2xl font-semibold text-plum">
                {(form.name || "A").charAt(0).toUpperCase()}
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
                <span className="mb-1 block text-xs font-medium text-ink-muted">Name *</span>
                <input className={input} required value={form.name} onChange={set("name")} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-ink-muted">Short bio</span>
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
                    <span className="mb-1 block text-xs font-medium text-ink-muted">Specialty</span>
                    <input
                      className={input}
                      placeholder="e.g. Oil painting, Portraits"
                      value={form.specialty}
                      onChange={set("specialty")}
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-ink-muted">
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
                    <span className="mb-1 block text-xs font-medium text-ink-muted">
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
              className="rounded-lg bg-plum px-8 py-3 text-sm font-medium text-white transition hover:bg-plum-700 disabled:opacity-60"
            >
              {save.isPending ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
