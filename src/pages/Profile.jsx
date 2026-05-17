import { useEffect, useRef, useState } from "react";
import { Mail, Phone, Camera, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import AppShell from "../components/layout/AppShell";
import api, { API_BASE_URL } from "../lib/api";
import { getUserId } from "../lib/auth";
import defaultAvatar from "../assets/avatar-default.svg";

const MAX_PHOTO_SIZE_MB = 5;
const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

/* ── Helper : transforme n'importe quelle photo_url en URL absolue ── */
const resolvePhotoUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE_URL}${url}`;
};

/* ── Sous-composant : zone d'upload photo ────────────────────── */
const PhotoUploader = ({ currentUrl, preview, onFileChange, onDelete, saving }) => {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const displayed = preview || currentUrl || null;

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileChange({ target: { files: [file] } });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={`relative group cursor-pointer select-none rounded-full transition-all duration-200 ${
          dragging ? "ring-4 ring-[hsl(var(--primary))] ring-offset-2" : ""
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Changer la photo de profil"
      >
        <img
          src={displayed || defaultAvatar}
          alt="Photo de profil"
          className="h-28 w-28 rounded-full object-cover border-4 border-white shadow-lg"
          onError={(e) => { e.target.src = defaultAvatar; }}
        />
        <div className="absolute inset-0 rounded-full bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Camera className="h-6 w-6 text-white" />
          <span className="text-[10px] text-white font-medium mt-1">Changer</span>
        </div>
        {preview && (
          <span className="absolute -top-1 -right-1 rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            Nouveau
          </span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        className="hidden"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={saving}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          Upload
        </button>
        {(currentUrl || preview) && (
          <button
            type="button"
            onClick={onDelete}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </button>
        )}
      </div>

      <p className="text-xs text-slate-400 text-center">
        JPG, PNG, WebP — max {MAX_PHOTO_SIZE_MB} MB<br />
        Glissez-déposez ou cliquez sur la photo
      </p>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════
   Page principale — Profile
   ════════════════════════════════════════════════════════════════ */
const Profile = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    nom: "",
    prenom: "",
    telephone: "",
    type: "",
    photo_url: "",
  });
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [photoFile, setPhotoFile]       = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const userId = getUserId();

  /* ── Applique les données reçues du backend dans le state ────── */
  const applyUserData = (data) => {
    if (!data) return;
    setFormData({
      ...data,
      photo_url: resolvePhotoUrl(data.photo_url),
    });
  };

  /* ── Chargement initial du profil ───────────────────────────── */
  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    api.get(`/utilisateurs/${userId}/`)
      .then((res) => { applyUserData(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  /* ── Sélection / validation du fichier photo ─────────────────── */
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (e.target.value !== undefined) e.target.value = "";

    if (!file) return;

    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      toast.error("Photo trop volumineuse", {
        description: `${(file.size / 1024 / 1024).toFixed(2)} MB — max ${MAX_PHOTO_SIZE_MB} MB.`,
      });
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  /* ── Suppression de la photo ─────────────────────────────────── */
  const handleDeletePhoto = async () => {
    if (photoFile) {
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    if (!userId || !formData.photo_url) return;

    setSaving(true);
    try {
      const form = new FormData();
      form.append("photoProfil", "");

      const res = await api.patch(`/utilisateurs/${userId}/`, form, {
        showSuccessToast: false,
      });

      const userData = res.data?.user ?? res.data;
      applyUserData(userData);
      setPhotoFile(null);
      setPhotoPreview(null);

      // ── Notifie Sidebar + Topbar ──────────────────────────────
      window.dispatchEvent(
        new CustomEvent("profile:photo-updated", { detail: { photo_url: "" } })
      );
      // username inchangé mais on le réémet pour cohérence
      window.dispatchEvent(
        new CustomEvent("profile:username-updated", {
          detail: { username: userData?.username || formData.username },
        })
      );

      toast.success("Photo supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    } finally {
      setSaving(false);
    }
  };

  /* ── Sauvegarde complète (champs texte + photo) ──────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;

    setSaving(true);
    try {
      const form = new FormData();

      ["email", "username", "nom", "prenom", "telephone"].forEach((key) => {
        if (formData[key] != null && formData[key] !== "") {
          form.append(key, formData[key]);
        }
      });

      if (photoFile) {
        form.append("photoProfil", photoFile);
      }

      const res = await api.patch(`/utilisateurs/${userId}/`, form, {
        showSuccessToast: false,
      });

      const userData = res.data?.user ?? res.data;
      applyUserData(userData);
      setPhotoFile(null);
      setPhotoPreview(null);

      // ── Notifie Sidebar + Topbar ──────────────────────────────
      const newPhotoUrl = resolvePhotoUrl(userData?.photo_url);
      window.dispatchEvent(
        new CustomEvent("profile:photo-updated", {
          detail: { photo_url: newPhotoUrl || "" },
        })
      );
      // ✅ Dispatch username avec la valeur RÉELLE retournée par le backend
      window.dispatchEvent(
        new CustomEvent("profile:username-updated", {
          detail: { username: userData?.username || formData.username },
        })
      );

      toast.success("Profil mis à jour avec succès.");
    } catch {
      // L'intercepteur api.js gère déjà le toast d'erreur
    } finally {
      setSaving(false);
    }
  };

  /* ── Rendu ───────────────────────────────────────────────────── */
  return (
    <AppShell title="Profil" subtitle="Mettez à jour vos informations personnelles.">
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">

        {/* ── Colonne gauche ───────────────────────────────────── */}
        <div className="rounded-3xl border border-slate-200 bg-[hsl(var(--card))] p-6 shadow-sm space-y-6">

          <div className="rounded-2xl bg-[hsl(var(--primary))] px-5 py-6 text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">Compte</p>
            <h2 className="mt-2 text-2xl font-display font-semibold">
              {formData.username || "Utilisateur"}
            </h2>
            <p className="mt-1 text-sm text-white/70">{formData.type}</p>
          </div>

          <PhotoUploader
            currentUrl={formData.photo_url}
            preview={photoPreview}
            onFileChange={handlePhotoChange}
            onDelete={handleDeletePhoto}
            saving={saving}
          />

          <div className="space-y-2 text-sm text-slate-600 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">{formData.email || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{formData.telephone || "Non renseigné"}</span>
            </div>
          </div>
        </div>

        {/* ── Colonne droite : formulaire ──────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-[hsl(var(--card))] p-6 shadow-sm"
        >
          {loading ? (
            <div className="flex h-full items-center justify-center text-slate-400 text-sm">
              Chargement…
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { label: "Prénom", name: "prenom" },
                  { label: "Nom",    name: "nom"    },
                ].map(({ label, name }) => (
                  <label key={name} className="block text-sm text-slate-600">
                    {label}
                    <input
                      name={name}
                      value={formData[name] || ""}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] transition-colors"
                    />
                  </label>
                ))}
              </div>

              {[
                { label: "Nom d'utilisateur", name: "username"  },
                { label: "Email",             name: "email",    type: "email" },
                { label: "Téléphone",         name: "telephone" },
              ].map(({ label, name, type = "text" }) => (
                <label key={name} className="block text-sm text-slate-600">
                  {label}
                  <input
                    name={name}
                    type={type}
                    value={formData[name] || ""}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-[hsl(var(--primary))] focus:ring-1 focus:ring-[hsl(var(--primary))] transition-colors"
                  />
                </label>
              ))}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Sauvegarde en cours…" : "Sauvegarder"}
              </button>
            </div>
          )}
        </form>
      </div>
    </AppShell>
  );
};

export default Profile;