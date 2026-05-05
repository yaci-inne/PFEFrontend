import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Send, FileText, ClipboardList,
  CalendarCheck2, UserCircle2, Building2, Layers, FilePlus2,
} from "lucide-react";
import { getUserRole, getTokenPayload } from "../../lib/auth";
import logo from "../../assets/logo.svg";
import vite from "../../../public/vite.svg";

const Footer = () => {
  const year = new Date().getFullYear();
  const role = getUserRole();

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
  const mid = Math.ceil(items.length / 2);
  const col1 = items.slice(0, mid);
  const col2 = items.slice(mid);

  return (
    <footer className="ft-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&display=swap');

        .ft-root {
          font-family: 'Geist', sans-serif;
          background: #ffffff;
          border-top: 1px solid #e8e8e8;
        }

        .ft-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 52px 40px 40px;
          display: grid;
          grid-template-columns: 190px 1fr 1fr 190px 130px;
          gap: 40px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .ft-inner {
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            padding: 36px 24px 28px;
          }
          .ft-logo-col { grid-column: 1 / -1; }
        }
        @media (max-width: 500px) {
          .ft-inner { grid-template-columns: 1fr; }
          .ft-logo-col { grid-column: auto; }
        }

        /* Logo - sans carré noir */
        .ft-logo-wrap { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          margin-bottom: 12px; 
        }
        
        /* Petit logo Vite (remplace le carré noir) */
        .ft-logo-small {
          width: 36px;
          height: 36px;
          object-fit: contain;
          flex-shrink: 0;
        }
        
        /* Gros logo principal (remplace le texte YourDreamJob) */
        .ft-logo-large {
          height: 32px;
          width: auto;
          object-fit: contain;
        }
        
        .ft-logo-desc { 
          font-size: 12px; 
          color: #a8a8a8; 
          line-height: 1.55; 
          margin-top: 8px;
        }

        /* Column titles */
        .ft-col-title {
          font-size: 13px; font-weight: 700; color: #0a0a0a;
          margin: 0 0 14px; letter-spacing: -0.01em;
        }

        /* Nav links */
        .ft-link {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; color: #6b6b6b; text-decoration: none;
          padding: 3.5px 0; transition: color 0.13s; white-space: nowrap;
        }
        .ft-link:hover { color: #0a0a0a; }
        .ft-link.active { color: #0a0a0a; font-weight: 500; }
        .ft-link svg { opacity: 0.4; flex-shrink: 0; }
        .ft-link:hover svg, .ft-link.active svg { opacity: 0.75; }

        /* Contact */
        .ft-contact-label { font-size: 12px; font-weight: 600; color: #0a0a0a; margin-bottom: 2px; }
        .ft-contact-val { font-size: 12px; color: #6b6b6b; margin-bottom: 10px; }

        /* Socials */
        .ft-socials { display: flex; gap: 7px; flex-wrap: wrap; }
        .ft-social {
          width: 30px; height: 30px; border-radius: 6px;
          border: 1px solid #e4e4e4; background: #fff;
          display: flex; align-items: center; justify-content: center;
          color: #6b6b6b; text-decoration: none; cursor: pointer;
          transition: all 0.15s;
        }
        .ft-social:hover { background: #0a0a0a; color: #fff; border-color: #0a0a0a; transform: translateY(-1px); }

        /* Bottom */
        .ft-divider { border: none; border-top: 1px solid #ebebeb; margin: 0; }
        .ft-bottom {
          max-width: 1100px; margin: 0 auto;
          padding: 15px 40px;
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
        }
        @media (max-width: 600px) {
          .ft-bottom { flex-direction: column; padding: 16px 24px; text-align: center; }
        }
        .ft-copy, .ft-made { font-size: 12px; color: #b8b8b8; margin: 0; }
      `}</style>

      <div className="ft-inner">

        {/* Logo - sans carré noir */}
        <div className="ft-logo-col">
          <div className="ft-logo-wrap">
            {/* Petit logo Vite (remplace le carré noir) */}
            <img src={vite} alt="Vite" className="ft-logo-small" />
            {/* Gros logo principal (remplace le texte YourDreamJob) */}
            <img src={logo} alt="Talents Opportunité" className="ft-logo-large" />
          </div>
          <p className="ft-logo-desc">
            {role === "entreprise"
              ? "Gérez vos offres et trouvez les meilleurs profils."
              : "Automatisez vos candidatures et décrochez votre job idéal."}
          </p>
        </div>

        {/* Nav col 1 */}
        <div>
          <p className="ft-col-title">{role === "entreprise" ? "Entreprise" : "Navigation"}</p>
          {col1.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `ft-link${isActive ? " active" : ""}`}>
              <Icon size={13} />{label}
            </NavLink>
          ))}
        </div>

        {/* Nav col 2 */}
        <div>
          <p className="ft-col-title" style={{ visibility: "hidden" }}>–</p>
          {col2.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `ft-link${isActive ? " active" : ""}`}>
              <Icon size={13} />{label}
            </NavLink>
          ))}
        </div>

        {/* Contact */}
        <div>
          <p className="ft-col-title">Contact</p>
          <p className="ft-contact-label">Support</p>
          <p className="ft-contact-val">support@yourdreamjob.dz</p>
          <p className="ft-contact-label">Siège</p>
          <p className="ft-contact-val">Alger, Algérie</p>
        </div>

        {/* Social */}
        <div>
          <p className="ft-col-title">Social</p>
          <div className="ft-socials">
            <a className="ft-social" href="#" aria-label="LinkedIn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
            <a className="ft-social" href="#" aria-label="Twitter/X">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a className="ft-social" href="#" aria-label="Instagram">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a className="ft-social" href="#" aria-label="GitHub">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </a>
          </div>
        </div>

      </div>

      <hr className="ft-divider" />
      <div className="ft-bottom">
        <p className="ft-copy">© {year} YourDreamJob · AutoCandidature — Tous droits réservés</p>
        <p className="ft-made">Fait avec ♥ en Algérie</p>
      </div>
    </footer>
  );
};

export default Footer;