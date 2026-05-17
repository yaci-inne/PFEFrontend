import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  FileText,
  ClipboardList,
  CalendarCheck2,
  UserCircle2,
  Building2,
  Layers,
  LogOut,
  FilePlus2,
} from "lucide-react";
import { getUserRole, getTokenPayload } from "../../lib/auth";
import logo from "../../assets/logo.svg";
import defaultAvatar from "../../assets/avatar-default.svg";
import { API_BASE_URL } from "../../lib/api";
import { useState, useEffect } from "react";

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const role      = getUserRole();

  // ── Initialise depuis le JWT au premier rendu ─────────────────────────────
  const payload = getTokenPayload();
  const userId  = payload?.user_id || payload?.userId || payload?.id;

  const [username,    setUsername]    = useState(payload?.username || "Utilisateur");
  const [isConnected, setIsConnected] = useState(Boolean(payload));
  const [photoUrl,    setPhotoUrl]    = useState(null);
  const [collapsed,   setCollapsed]   = useState(false);

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

  // ── Ferme le menu mobile au changement de route ───────────────────────────
  useEffect(() => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // ── Navigation ────────────────────────────────────────────────────────────
  const candidatNav = [
    { to: "/dashboard-candidat", label: "Dashboard",     icon: LayoutDashboard },
    { to: "/cvs",                label: "Mes CV",         icon: FileText        },
    { to: "/generer-cv",         label: "Générer un CV",  icon: FilePlus2       },
    { to: "/candidatures",       label: "Candidatures",   icon: ClipboardList   },
    { to: "/rendez-vous",        label: "Rendez-vous",    icon: CalendarCheck2  },
    { to: "/envoi",              label: "Envoi",          icon: Send            },
    { to: "/profil",             label: "Profil",         icon: UserCircle2     },
  ];

  const entrepriseNav = [
    { to: "/dashboard-entreprise",      label: "Dashboard",     icon: LayoutDashboard },
    { to: "/entreprise/offres",         label: "Offres",         icon: Layers          },
    { to: "/entreprise/candidatures",   label: "Candidatures",   icon: ClipboardList   },
    { to: "/rendez-vous",               label: "Rendez-vous",    icon: CalendarCheck2  },
    { to: "/profil",                    label: "Profil",         icon: Building2       },
  ];

  const items = role === "entreprise" ? entrepriseNav : candidatNav;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  // ── Rendu commun d'un item de nav ─────────────────────────────────────────
  const NavItem = ({ to, label, icon: Icon, onClick, mobile = false }) => (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-200
        ${isActive
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }
        ${!mobile && collapsed ? "justify-center" : ""}
        ${mobile ? "gap-3 px-3 py-2.5" : ""}
        `
      }
      title={!mobile && collapsed ? label : ""}
    >
      <Icon className={`flex-shrink-0 ${mobile ? "h-4 w-4" : "h-4 w-4"}`} />
      {(mobile || !collapsed) && <span className="truncate">{label}</span>}
    </NavLink>
  );

  // ── User card (partagée desktop / mobile) ─────────────────────────────────
  const UserCard = ({ mobile = false }) => (
    <div className={`flex items-center gap-2 rounded-lg px-2 py-1.5 mb-2
      ${mobile ? "gap-3 px-2 py-2 mb-3 bg-slate-50 rounded-lg" : ""}
      ${!mobile && collapsed ? "justify-center" : ""}
    `}>
      <div className="relative flex-shrink-0">
        <img
          src={photoUrl || defaultAvatar}
          alt="Profil"
          className={`rounded-full object-cover border border-slate-200 ${mobile ? "w-10 h-10" : "w-7 h-7"}`}
          onError={() => setPhotoUrl(null)}
        />
        <span
          className={`absolute bottom-0 right-0 rounded-full border border-white
            ${mobile ? "w-2.5 h-2.5 border-2" : "w-2 h-2"}`}
          style={{ background: isConnected ? "#22c55e" : "#94a3b8" }}
        />
      </div>
      {(mobile || !collapsed) && (
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-slate-700 truncate ${mobile ? "text-sm" : "text-xs"}`}>
            {username}
          </p>
          <p className={`text-slate-400 capitalize ${mobile ? "text-xs" : "text-[10px]"}`}>
            {role}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        .sb-nav::-webkit-scrollbar { width: 3px; }
        .sb-nav::-webkit-scrollbar-track { background: transparent; }
        .sb-nav::-webkit-scrollbar-thumb { background: #e0e0e0; border-radius: 99px; }
        .sb-nav::-webkit-scrollbar-thumb:hover { background: #c0c0c0; }
      `}</style>

      {/* ═══ DESKTOP SIDEBAR ═══════════════════════════════════════════════ */}
      <aside className={`
        hidden lg:flex h-screen sticky top-0 flex-col
        bg-white border-r border-slate-200
        transition-all duration-300 ease-in-out
        ${collapsed ? "w-[68px]" : "w-64"}
      `}>

        {/* Logo */}
        <div className="flex-shrink-0 px-3 pt-5 pb-3 border-b border-slate-100">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-8 w-auto object-contain" />
          </div>
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div className="mx-3 mt-3 px-2 py-1 rounded-md bg-slate-100 border border-slate-200">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 text-center">
              {role === "entreprise" ? "Espace Entreprise" : "Espace Candidat"}
            </p>
          </div>
        )}

        {/* Navigation */}
        <nav className="sb-nav flex-1 px-2 py-4 overflow-y-auto">
          <div className="space-y-0.5">
            {items.map((item) => (
              <NavItem key={item.to} {...item} onClick={() => setIsMobileMenuOpen(false)} />
            ))}
          </div>
        </nav>

        {/* Bottom: user + logout */}
        <div className="flex-shrink-0 p-3 pt-2 border-t border-slate-100">
          <UserCard />
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium
              bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200
              ${collapsed ? "justify-center" : ""}
            `}
            title={collapsed ? "Déconnexion" : ""}
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* ═══ MOBILE OVERLAY ════════════════════════════════════════════════ */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ═══ MOBILE SIDEBAR ════════════════════════════════════════════════ */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72
        bg-white shadow-2xl flex flex-col
        transform transition-transform duration-300 ease-in-out
        lg:hidden
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>

        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 relative">
          <div className="w-8" />
          <img src={logo} alt="Logo" className="h-7 w-auto object-contain" />
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition"
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        </div>

        <div className="px-4 pt-3 pb-2">
          <div className="px-2 py-1.5 rounded-md bg-slate-100 border border-slate-200">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 text-center">
              {role === "entreprise" ? "Espace Entreprise" : "Espace Candidat"}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 overflow-y-auto">
          <div className="space-y-0.5">
            {items.map((item) => (
              <NavItem key={item.to} {...item} mobile onClick={() => setIsMobileMenuOpen(false)} />
            ))}
          </div>
        </nav>

        <div className="flex-shrink-0 p-4 pt-2 border-t border-slate-100">
          <UserCard mobile />
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;