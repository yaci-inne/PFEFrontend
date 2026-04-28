import { useEffect, useState } from "react";
import { getTokenPayload } from "../../lib/auth";
import defaultAvatar from "../../assets/avatar-default.svg";
import { API_BASE_URL } from "../../lib/api";

/* ── Icône burger style DeepSeek ─────────────────────────────── */
const DeepSeekBurger = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Icône "menu intelligent" — 3 lignes avec point accent façon DeepSeek */}
    <path d="M4 6H20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M4 12H16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M4 18H20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    {/* Petit accent décoratif */}
    <circle cx="20" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

const Topbar = ({ title, subtitle, actions, onMenuOpen }) => {
  const payload = getTokenPayload();
  const username = payload?.username || "Utilisateur";
  const isConnected = Boolean(payload);
  const userId = payload?.user_id || payload?.userId || payload?.id;
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const loadPhoto = () => {
      fetch(`${API_BASE_URL}/utilisateurs/${userId}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.photo_url) {
            const url = data.photo_url.startsWith("http")
              ? data.photo_url
              : `${API_BASE_URL}${data.photo_url}`;
            setPhotoUrl(url);
          }
        })
        .catch(() => null);
    };

    loadPhoto();
    const onPhotoUpdate = (e) => {
      if (e?.detail?.photo_url) {
        const url = e.detail.photo_url.startsWith("http")
          ? e.detail.photo_url
          : `${API_BASE_URL}${e.detail.photo_url}`;
        setPhotoUrl(url);
      }
    };
    window.addEventListener("profile:photo-updated", onPhotoUpdate);
    return () => window.removeEventListener("profile:photo-updated", onPhotoUpdate);
  }, [userId]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[hsl(var(--card))]/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 lg:px-10 lg:py-4">

        {/* ── Gauche : burger (mobile) + titre ─────────────────── */}
        <div className="flex items-center gap-3">

          {/* Bouton burger — visible uniquement mobile, intégré dans la topbar */}
          <button
            onClick={onMenuOpen}
            className="
              lg:hidden
              flex h-9 w-9 items-center justify-center
              rounded-xl border border-slate-200
              bg-[hsl(var(--card))] text-slate-600
              shadow-sm hover:bg-slate-50
              transition-all duration-200
              hover:shadow-md hover:border-slate-300
              active:scale-95
            "
            aria-label="Ouvrir le menu"
          >
            <DeepSeekBurger />
          </button>

          {/* Titre */}
          <div>
            <p className="hidden text-xs uppercase tracking-[0.2em] text-slate-500 lg:block">
              AutoCandidature
            </p>
            <h1 className="text-lg font-display font-semibold text-slate-900 lg:text-2xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="hidden text-sm text-slate-500 lg:block">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {/* ── Droite : actions + avatar ─────────────────────────── */}
        <div className="flex items-center gap-3 lg:gap-4">
          {actions}
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-[hsl(var(--card))] px-2 py-1.5 text-sm text-slate-700 shadow-sm lg:px-3">
            <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500" : "bg-slate-300"}`} />
            <img
              src={photoUrl || defaultAvatar}
              alt="Profil"
              className="h-6 w-6 rounded-full object-cover border border-slate-200"
            />
            <span className="hidden text-xs font-medium lg:inline lg:text-sm">
              {username}
            </span>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Topbar;