import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import logo from "../assets/logo.svg";

const TYPES_CONTRAT = ["Tous", "CDI", "CDD", "Freelance", "Stage", "Alternance"];
const MODES = ["Tous", "Présentiel", "Remote", "Hybride"];

export default function OffresPublic() {
  const navigate = useNavigate();
  const [offres, setOffres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [ville, setVille] = useState("");
  const [typeContrat, setTypeContrat] = useState("Tous");
  const [modeWork, setModeWork] = useState("Tous");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/offres/");
        setOffres(res.data?.offres || []);
      } catch {
        setOffres([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return offres.filter((o) => {
      if (search) {
        const q = search.toLowerCase();
        const hay = `${o.titre || ""} ${o.poste || ""} ${o.entreprise_nom || ""} ${o.domaine || ""} ${o.tags || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (ville) {
        if (!o.ville?.toLowerCase().includes(ville.toLowerCase())) return false;
      }
      if (typeContrat !== "Tous") {
        if (!o.type_contrat?.toLowerCase().includes(typeContrat.toLowerCase())) return false;
      }
      if (modeWork !== "Tous") {
        if (!o.mode_travail?.toLowerCase().includes(modeWork.toLowerCase())) return false;
      }
      return true;
    });
  }, [offres, search, ville, typeContrat, modeWork]);

  const villes = useMemo(() => {
    const set = new Set(offres.map((o) => o.ville).filter(Boolean));
    return Array.from(set);
  }, [offres]);

  const getInitials = (name) => {
    if (!name) return "??";
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  };

  const timeAgo = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Il y a 1 jour";
    if (days < 30) return `Il y a ${days} jours`;
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  return (
    <div style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", background: "#FAFAF8", minHeight: "100vh", color: "#0a0a0a" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .op-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 5vw; height: 64px; transition: all 0.3s ease;
        }
        .op-nav.scrolled { background: rgba(250,250,248,0.97); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(10,10,10,.08); }
        .op-nav.top { background: transparent; }

        .op-nav-logo img { height: 30px; transition: filter 0.3s; }
        .op-nav.top .op-nav-logo img { filter: brightness(0) invert(1); }
        .op-nav.scrolled .op-nav-logo img { filter: none; }

        .op-nav-links { display: flex; gap: 32px; align-items: center; }
        .op-nav-links a { font-size: 14px; text-decoration: none; letter-spacing: -.01em; opacity: 0.65; transition: opacity 0.2s; }
        .op-nav.top .op-nav-links a { color: #fff; }
        .op-nav.scrolled .op-nav-links a { color: #0a0a0a; }
        .op-nav-links a:hover { opacity: 1; }
        .op-nav-links a.active { opacity: 1; font-weight: 600; }

        .op-btn-conn {
          font-size: 13px; text-decoration: none; padding: 8px 18px;
          border: 1px solid; transition: all 0.2s; font-weight: 500;
        }
        .op-nav.top .op-btn-conn { color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.2); background: transparent; }
        .op-nav.top .op-btn-conn:hover { color: #fff; border-color: rgba(255,255,255,0.6); }
        .op-nav.scrolled .op-btn-conn { color: #0a0a0a; border-color: rgba(10,10,10,0.2); background: transparent; }
        .op-nav.scrolled .op-btn-conn:hover { border-color: #0a0a0a; }

        .op-btn-signup {
          font-size: 13px; text-decoration: none; padding: 8px 18px;
          font-weight: 600; transition: all 0.2s; border: 2px solid;
        }
        .op-nav.top .op-btn-signup { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.25); }
        .op-nav.top .op-btn-signup:hover { background: #fff; color: #0a0a0a; }
        .op-nav.scrolled .op-btn-signup { background: #0a0a0a; color: #FAFAF8; border-color: #0a0a0a; }
        .op-nav.scrolled .op-btn-signup:hover { background: #333; }

        .op-hero { background: #0a0a0a; padding: 110px 5vw 56px; position: relative; overflow: hidden; }
        .op-hero-grid { position: absolute; inset: 0; pointer-events: none;
          background-image: repeating-linear-gradient(0deg, transparent, transparent 59px, rgba(255,255,255,0.025) 59px, rgba(255,255,255,0.025) 60px), repeating-linear-gradient(90deg, transparent, transparent 59px, rgba(255,255,255,0.025) 59px, rgba(255,255,255,0.025) 60px); }
        .op-hero-inner { max-width: 1200px; margin: 0 auto; position: relative; }
        .op-hero-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.3); margin-bottom: 18px; display: block; }
        .op-hero-title { font-size: clamp(2.8rem,5.5vw,4.5rem); font-weight: 900; color: #FAFAF8; letter-spacing: -2.5px; line-height: 1.05; margin-bottom: 14px; }
        .op-hero-title em { font-style: italic; color: #777; }
        .op-hero-sub { font-size: 0.95rem; color: #555; font-weight: 300; margin-bottom: 36px; }

        .op-searchbar { display: flex; background: #111; border: 1px solid #1e1e1e; overflow: hidden; max-width: 780px; }
        .op-searchbar-main { flex: 1; display: flex; align-items: center; gap: 12px; padding: 0 20px; border-right: 1px solid #1e1e1e; }
        .op-searchbar-main input { flex: 1; border: none; outline: none; background: transparent; font-size: 0.95rem; color: #FAFAF8; padding: 15px 0; }
        .op-searchbar-main input::placeholder { color: #444; }
        .op-searchbar-ville { display: flex; align-items: center; padding: 0 16px; gap: 8px; border-right: 1px solid #1e1e1e; }
        .op-searchbar-ville input { border: none; outline: none; background: transparent; font-size: 0.875rem; color: #FAFAF8; width: 120px; padding: 15px 0; }
        .op-searchbar-ville input::placeholder { color: #444; }
        .op-searchbtn { background: #FAFAF8; color: #0a0a0a; border: none; padding: 0 28px; font-weight: 700; font-size: 0.8rem; cursor: pointer; letter-spacing: 0.5px; transition: background 0.2s; white-space: nowrap; }
        .op-searchbtn:hover { background: #e8e8e8; }

        .op-filters { position: sticky; top: 64px; z-index: 50; background: #fff; border-bottom: 1px solid #e5e5e5; display: flex; align-items: center; }
        .op-filter-group { display: flex; align-items: center; gap: 10px; padding: 0 24px; height: 52px; border-right: 1px solid #efefef; }
        .op-filter-group label { font-size: 0.65rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #bbb; white-space: nowrap; }
        .op-filter-group select { border: none; outline: none; background: transparent; font-size: 0.875rem; color: #0a0a0a; font-weight: 500; cursor: pointer; }
        .op-count { margin-left: auto; padding: 0 24px; font-size: 0.75rem; color: #bbb; white-space: nowrap; }
        .op-count strong { color: #0a0a0a; }

        .op-main { max-width: 1200px; margin: 0 auto; padding: 48px 5vw 96px; }
        .op-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #e8e8e8; border: 1px solid #e8e8e8; }

        .op-card { background: #fff; padding: 28px 28px 24px; cursor: pointer; position: relative; transition: background 0.2s; animation: opFadeUp 0.4s ease both; }
        .op-card:hover { background: #FAFAF8; }
        .op-card-top-line { position: absolute; top: 0; left: 0; right: 0; height: 2px; background: #0a0a0a; opacity: 0; transition: opacity 0.2s; }
        .op-card:hover .op-card-top-line { opacity: 1; }
        .op-card-header { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 18px; }
        .op-card-logo { width: 44px; height: 44px; flex-shrink: 0; background: #0a0a0a; color: #FAFAF8; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.3px; }
        .op-card-meta { flex: 1; min-width: 0; }
        .op-card-company { font-size: 0.72rem; font-weight: 600; color: #aaa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .op-card-title { font-size: 1rem; font-weight: 700; color: #0a0a0a; line-height: 1.3; letter-spacing: -0.3px; }
        .op-card-contract { flex-shrink: 0; font-size: 0.65rem; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; background: #0a0a0a; color: #FAFAF8; }
        .op-card-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
        .op-tag { font-size: 0.7rem; font-weight: 500; padding: 4px 10px; border: 1px solid #ebebeb; color: #666; }
        .op-card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid #f5f5f5; }
        .op-card-date { font-size: 0.72rem; color: #ccc; }
        .op-card-action { font-size: 0.75rem; font-weight: 700; color: #0a0a0a; display: flex; align-items: center; gap: 6px; opacity: 0; transition: opacity 0.2s; letter-spacing: 0.3px; }
        .op-card:hover .op-card-action { opacity: 1; }

        .op-skeleton { background: #fff; padding: 28px; animation: opPulse 1.5s ease-in-out infinite; }
        .op-skel-line { background: #f0f0f0; border-radius: 2px; margin-bottom: 10px; }
        @keyframes opPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .op-empty { grid-column: 1 / -1; padding: 80px 40px; text-align: center; background: #fff; }
        .op-empty-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.15; }
        .op-empty h3 { font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; letter-spacing: -0.3px; }
        .op-empty p { font-size: 0.875rem; color: #aaa; }

        .op-cta { background: #0a0a0a; color: #FAFAF8; padding: 80px 5vw; text-align: center; margin-top: 80px; }
        .op-cta h2 { font-size: clamp(2rem,4vw,3rem); font-weight: 900; letter-spacing: -1.5px; margin-bottom: 10px; }
        .op-cta p { color: #666; margin-bottom: 28px; font-weight: 300; }
        .op-btn-w { background: #FAFAF8; color: #0a0a0a; border: 2px solid #FAFAF8; padding: 13px 32px; font-weight: 700; font-size: 0.85rem; cursor: pointer; text-decoration: none; display: inline-block; letter-spacing: 0.5px; transition: background 0.2s, color 0.2s; margin: 0 6px; }
        .op-btn-w:hover { background: transparent; color: #FAFAF8; }
        .op-btn-o { background: transparent; color: rgba(255,255,255,.6); border: 2px solid rgba(255,255,255,.15); padding: 13px 32px; font-weight: 400; font-size: 0.85rem; cursor: pointer; text-decoration: none; display: inline-block; margin: 0 6px; transition: border-color 0.2s, color 0.2s; }
        .op-btn-o:hover { border-color: rgba(255,255,255,.5); color: #fff; }

        @keyframes opFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 768px) {
          .op-nav-links { display: none !important; }
          .op-nav-ctas { display: none !important; }
          .op-burger { display: block !important; }
          .op-searchbar { flex-direction: column; }
          .op-searchbar-ville { border-right: none; border-top: 1px solid #1e1e1e; }
          .op-filters { overflow-x: auto; }
          .op-grid { grid-template-columns: 1fr; }
          .op-cta { padding: 60px 20px; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className={`op-nav ${scrolled ? "scrolled" : "top"}`}>
        <Link to="/" className="op-nav-logo" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Logo" />
        </Link>
        <div className="op-nav-links" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link to="/offres-public" className="active">Offres</Link>
          <Link to="/entreprises-public">Entreprises</Link>
          <Link to="/comment-ca-marche">Comment ça marche</Link>
        </div>
        <div className="op-nav-ctas" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link to="/login" className="op-btn-conn">Se connecter</Link>
          <Link to="/signup" className="op-btn-signup">S'inscrire</Link>
        </div>
        <button
          className="op-burger"
          onClick={() => setMenuOpen((o) => !o)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: scrolled ? "#0a0a0a" : "#fff" }}
        >☰</button>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "28px" }}>
          <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: "24px", right: "5vw", background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>✕</button>
          {[
            ["Offres", "/offres-public"],
            ["Entreprises", "/entreprises-public"],
            ["Comment ça marche", "/comment-ca-marche"],
            ["Se connecter", "/login"],
            ["S'inscrire", "/signup"],
          ].map(([l, to]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)} style={{ fontSize: "26px", fontWeight: 600, color: "#0a0a0a", textDecoration: "none", letterSpacing: "-.03em" }}>{l}</Link>
          ))}
        </div>
      )}

      {/* HERO */}
      <section className="op-hero">
        <div className="op-hero-grid" />
        <div className="op-hero-inner">
          <span className="op-hero-eyebrow">Offres d'emploi</span>
          <h1 className="op-hero-title">
            {loading
              ? <>Chargement<br /><em>des offres…</em></>
              : <><strong>{offres.length}</strong> offre{offres.length !== 1 ? "s" : ""}<br /><em>vous attendent.</em></>}
          </h1>
          <p className="op-hero-sub">Recherchez, filtrez, postulez — tout en un seul endroit.</p>

          <div className="op-searchbar">
            <div className="op-searchbar-main">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Titre, entreprise, domaine, compétence…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="op-searchbar-ville">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <input
                type="text"
                placeholder="Ville…"
                value={ville}
                onChange={(e) => setVille(e.target.value)}
                list="villes-list"
              />
              <datalist id="villes-list">
                {villes.map((v) => <option key={v} value={v} />)}
              </datalist>
            </div>
            <button className="op-searchbtn">Rechercher</button>
          </div>
        </div>
      </section>

      {/* FILTERS STICKY */}
      <div className="op-filters">
        <div className="op-filter-group">
          <label>Contrat</label>
          <select value={typeContrat} onChange={(e) => setTypeContrat(e.target.value)}>
            {TYPES_CONTRAT.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="op-filter-group">
          <label>Mode</label>
          <select value={modeWork} onChange={(e) => setModeWork(e.target.value)}>
            {MODES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="op-count">
          <strong>{filtered.length}</strong> résultat{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* OFFRES GRID */}
      <div className="op-main">
        <div className="op-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="op-skeleton">
                <div className="op-skel-line" style={{ width: "40%", height: 12 }} />
                <div className="op-skel-line" style={{ width: "75%", height: 18, marginBottom: 20 }} />
                <div className="op-skel-line" style={{ width: "60%", height: 10 }} />
                <div className="op-skel-line" style={{ width: "45%", height: 10 }} />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="op-empty">
              <div className="op-empty-icon">◎</div>
              <h3>Aucune offre trouvée</h3>
              <p>Essayez de modifier vos filtres ou votre recherche.</p>
            </div>
          ) : (
            filtered.map((offre, idx) => (
              <div
                key={offre.offreId || idx}
                className="op-card"
                style={{ animationDelay: `${Math.min(idx, 8) * 0.05}s` }}
                onClick={() => navigate("/login")}
              >
                <div className="op-card-top-line" />
                <div className="op-card-header">
                  <div className="op-card-logo">{getInitials(offre.entreprise_nom)}</div>
                  <div className="op-card-meta">
                    <div className="op-card-company">{offre.entreprise_nom || "Entreprise"}</div>
                    <div className="op-card-title">{offre.titre}</div>
                  </div>
                  {offre.type_contrat && (
                    <div className="op-card-contract">{offre.type_contrat}</div>
                  )}
                </div>
                <div className="op-card-tags">
                  {offre.domaine && <span className="op-tag">💼 {offre.domaine}</span>}
                  {offre.ville && <span className="op-tag">📍 {offre.ville}{offre.pays ? `, ${offre.pays}` : ""}</span>}
                  {offre.mode_travail && <span className="op-tag">{offre.mode_travail}</span>}
                  {offre.specialite && <span className="op-tag">{offre.specialite}</span>}
                </div>
                <div className="op-card-footer">
                  <span className="op-card-date">{timeAgo(offre.date_publication || offre.created_at)}</span>
                  <span className="op-card-action">Voir l'offre →</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="op-cta">
        <h2>Prêt à postuler ?</h2>
        <p>Créez votre compte gratuit et accédez à toutes les offres.</p>
        <Link to="/signup" className="op-btn-w">Créer mon compte</Link>
        <Link to="/login" className="op-btn-o">Me connecter</Link>
      </div>
    </div>
  );
}