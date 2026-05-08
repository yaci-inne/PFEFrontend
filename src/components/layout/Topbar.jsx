import { useEffect, useState } from "react";
import { getTokenPayload } from "../../lib/auth";
import defaultAvatar from "../../assets/avatar-default.svg";
import { API_BASE_URL } from "../../lib/api";
import MenuButton from "./MenuButton";
import NotificationDropdown from "./NotificationDropdown";

const Topbar = ({ title, subtitle, actions, onMenuOpen, isMobileMenuOpen }) => {
  const payload = getTokenPayload();
  const username = payload?.username || "Utilisateur";
  const isConnected = Boolean(payload);
  const userId = payload?.user_id || payload?.userId || payload?.id;
  const [photoUrl, setPhotoUrl] = useState(null);

  const resolveUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  };

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
            setPhotoUrl(resolveUrl(data.photo_url));
          }
        })
        .catch(() => null);
    };

    loadPhoto();

    const onPhotoUpdate = (e) => {
      const url = e?.detail?.photo_url;
      setPhotoUrl(url ? resolveUrl(url) : null);
    };

    window.addEventListener("profile:photo-updated", onPhotoUpdate);
    return () => window.removeEventListener("profile:photo-updated", onPhotoUpdate);
  }, [userId]);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[hsl(var(--card))]/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 lg:px-10 lg:py-4">

        {/* ── Gauche : MenuButton (mobile) + titre ── */}
        <div className="flex items-center gap-3">
          
          {/* MenuButton — visible uniquement sur mobile */}
          <div className="lg:hidden">
            <MenuButton 
              isOpen={isMobileMenuOpen} 
              onClick={onMenuOpen} 
            />
          </div>

          {/* Titre */}
          <div>
            <h1 className="text-lg font-display font-semibold text-slate-900 lg:text-2xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="hidden text-sm text-slate-500 lg:block">{subtitle}</p>
            ) : null}
          </div>
        </div>

        {/* ── Droite : actions + notifications + avatar ── */}
        <div className="flex items-center gap-3 lg:gap-4">
          {actions}

          {/* Wrapper isolé pour que le dropdown ne perturbe pas le layout */}
          <div className="relative z-30 flex-shrink-0">
            <NotificationDropdown />
          </div>

          {/* Avatar — toujours dans son div, jamais bougé */}
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-[hsl(var(--card))] px-2 py-1.5 text-sm text-slate-700 shadow-sm lg:px-3">
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${isConnected ? "bg-green-500" : "bg-slate-300"}`}
            />
            <img
              src={photoUrl || defaultAvatar}
              alt="Profil"
              className="h-7 w-7 shrink-0 rounded-full border border-slate-200 object-cover"
              onError={() => setPhotoUrl(null)}
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