import { useEffect, useState } from "react";
import { getTokenPayload } from "../../lib/auth";
import defaultAvatar from "../../assets/avatar-default.svg";
import { API_BASE_URL } from "../../lib/api";
import MenuButton from "./MenuButton";
import NotificationDropdown from "./NotificationDropdown";

const Topbar = ({ title, subtitle, actions, onMenuOpen, isMobileMenuOpen }) => {

  // ── Initialise depuis le JWT au premier rendu ─────────────────────────────
  const payload = getTokenPayload();
  const userId  = payload?.user_id || payload?.userId || payload?.id;

  const [username,    setUsername]    = useState(payload?.username || "Utilisateur");
  const [isConnected, setIsConnected] = useState(Boolean(payload));
  const [photoUrl,    setPhotoUrl]    = useState(null);

  const resolveUrl = (url) => {
    if (!url) return null;
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  };

  // ── Chargement initial de la photo ────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    fetch(`${API_BASE_URL}/utilisateurs/${userId}/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.photo_url) setPhotoUrl(resolveUrl(data.photo_url));
      })
      .catch(() => null);
  }, [userId]);

  // ── Écoute les événements de mise à jour du profil ────────────────────────
  useEffect(() => {
    // Mise à jour photo
    const onPhotoUpdate = (e) => {
      const url = e?.detail?.photo_url;
      setPhotoUrl(url ? resolveUrl(url) : null);
    };

    // ✅ Mise à jour username : lit DIRECTEMENT depuis e.detail, pas depuis le JWT
    const onUsernameUpdate = (e) => {
      const newUsername = e?.detail?.username;
      if (newUsername) setUsername(newUsername);
    };

    window.addEventListener("profile:photo-updated",    onPhotoUpdate);
    window.addEventListener("profile:username-updated", onUsernameUpdate);

    return () => {
      window.removeEventListener("profile:photo-updated",    onPhotoUpdate);
      window.removeEventListener("profile:username-updated", onUsernameUpdate);
    };
  }, []);

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-[hsl(var(--card))]/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-3 lg:px-10 lg:py-4">

        {/* ── Gauche : MenuButton (mobile) + titre ── */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <MenuButton isOpen={isMobileMenuOpen} onClick={onMenuOpen} />
          </div>
          <div>
            <h1 className="text-lg font-display font-semibold text-slate-900 lg:text-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="hidden text-sm text-slate-500 lg:block">{subtitle}</p>
            )}
          </div>
        </div>

        {/* ── Droite : actions + notifications + avatar ── */}
        <div className="flex items-center gap-3 lg:gap-4">
          {actions}

          <div className="relative z-30 flex-shrink-0">
            <NotificationDropdown />
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-[hsl(var(--card))] px-2 py-1.5 text-sm text-slate-700 shadow-sm lg:px-3">
            <span className={`h-2 w-2 shrink-0 rounded-full ${isConnected ? "bg-green-500" : "bg-slate-300"}`} />
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