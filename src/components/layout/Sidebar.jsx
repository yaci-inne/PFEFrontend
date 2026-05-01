import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Send,
  FileText,
  Briefcase,
  ClipboardList,
  CalendarCheck2,
  UserCircle2,
  Building2,
  Layers,
  LogOut,
  FilePlus2,
  X,
} from "lucide-react";
import { getUserRole } from "../../lib/auth";
import logo from "../../assets/logo.svg";
import { useState, useEffect } from "react";

/* ── Icône style DeepSeek ─────────────────────────────────────── */
const DeepSeekIcon = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C8.5 2 5.5 4.5 4.5 8C3.5 11.5 4.5 15 7 17.5C8 18.5 8.5 19.5 8.5 21H15.5C15.5 19.5 16 18.5 17 17.5C19.5 15 20.5 11.5 19.5 8C18.5 4.5 15.5 2 12 2Z"
      fill="currentColor"
      opacity="0.15"
    />
    <path
      d="M12 2C8.5 2 5.5 4.5 4.5 8C3.5 11.5 4.5 15 7 17.5C8 18.5 8.5 19.5 8.5 21H15.5C15.5 19.5 16 18.5 17 17.5C19.5 15 20.5 11.5 19.5 8C18.5 4.5 15.5 2 12 2Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="9.5" cy="10.5" r="1.25" fill="currentColor" />
    <circle cx="14.5" cy="10.5" r="1.25" fill="currentColor" />
    <path
      d="M9.5 13.5C9.5 13.5 10.5 15 12 15C13.5 15 14.5 13.5 14.5 13.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
    />
    <path
      d="M8.5 21H15.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ── Composant principal ──────────────────────────────────────── */
const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navigate = useNavigate();
  const role = getUserRole();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [window.location.pathname]);

  const candidatNav = [
    { to: "/dashboard-candidat", label: "Dashboard", icon: LayoutDashboard },
    { to: "/cvs", label: "Mes CV", icon: FileText },
    { to: "/generer-cv", label: "Générer un CV", icon: FilePlus2 },
    { to: "/candidatures", label: "Candidatures", icon: ClipboardList },
    { to: "/rendez-vous", label: "Rendez-vous", icon: CalendarCheck2 },
    { to: "/envoi", label: "Envoi", icon: Send },
    { to: "/profil", label: "Profil", icon: UserCircle2 },
  ];

  const entrepriseNav = [
    { to: "/dashboard-entreprise", label: "Dashboard", icon: LayoutDashboard },
    { to: "/entreprise/offres", label: "Offres", icon: Layers },
    { to: "/entreprise/candidatures", label: "Candidatures", icon: ClipboardList },
    { to: "/rendez-vous", label: "Rendez-vous", icon: CalendarCheck2 },
    { to: "/profil", label: "Profil", icon: Building2 },
  ];

  const items = role === "entreprise" ? entrepriseNav : candidatNav;

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo section - fixe en haut */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[hsl(var(--card))] px-4 py-3 shadow-sm">
          <img src={logo} alt="Logo" className="h-10 w-10 rounded-xl" />
          <div>
            <p className="text-gray-500">YourDreamJob</p>
          </div>
        </div>
      </div>

      {/* Navigation section - scrollable uniquement si trop d'éléments */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-1">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-[hsl(var(--primary))] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout button - fixe en bas */}
      <div className="flex-shrink-0 px-4 pb-6 pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Se deconnecter
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Sidebar desktop ──────────────────────────────────── */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200/70 bg-[hsl(var(--card))]/90 backdrop-blur overflow-y-visible lg:flex">
        <SidebarContent />
      </aside>

      {/* ── Overlay mobile ───────────────────────────────────── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── Sidebar mobile (drawer) ───────────────────────────── */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72 flex flex-col
          bg-[hsl(var(--card))] shadow-2xl overflow-y-visible
          transform transition-transform duration-300 ease-in-out
          lg:hidden
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header du drawer avec icône DeepSeek + bouton fermer */}
        <div className="flex-shrink-0 flex items-center justify-between border-b border-slate-200/70 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-white shadow-sm">
              <DeepSeekIcon size={18} />
            </div>
            <span className="text-sm font-semibold text-slate-800">Navigation</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-xl hover:bg-slate-100 transition"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Contenu mobile sans scroll */}
        <div className="flex-1 overflow-y-visible">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
};

export default Sidebar;