import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import logo from "../assets/logo.svg";

export default function EntreprisesPublic() {
  const navigate = useNavigate();
  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [secteur, setSecteur] = useState("Tous");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        try {
          const res = await api.get("/entreprises/");
          setEntreprises(res.data?.entreprises || res.data || []);
        } catch {
          const res = await api.get("/offres/");
          const offres = res.data?.offres || [];
          const map = {};
          offres.forEach((o) => {
            const id = o.entreprise_id || o.entreprise_nom;
            if (id && !map[id]) {
              map[id] = {
                id,
                nom: o.entreprise_nom || "—",
                secteur: o.domaine || "—",
                ville: o.ville || "—",
                pays: o.pays || "",
                offres_count: 1,
                logo: o.entreprise_logo || null,
              };
            } else if (id) {
              map[id].offres_count += 1;
            }
          });
          setEntreprises(Object.values(map));
        }
      } catch {
        setEntreprises([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const secteurs = useMemo(() => {
    const set = new Set(entreprises.map((e) => e.secteur || e.domaine).filter((s) => s && s !== "—"));
    return ["Tous", ...Array.from(set)];
  }, [entreprises]);

  const filtered = useMemo(() => {
    return entreprises.filter((e) => {
      if (search) {
        const q = search.toLowerCase();
        const hay = `${e.nom || ""} ${e.secteur || ""} ${e.domaine || ""} ${e.ville || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (secteur !== "Tous") {
        const s = e.secteur || e.domaine || "";
        if (!s.toLowerCase().includes(secteur.toLowerCase())) return false;
      }
      return true;
    });
  }, [entreprises, search, secteur]);

  const getInitials = (name) => {
    if (!name || name === "—") return "??";
    return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", background: "#FAFAF8", minHeight: "100vh", color: "#0a0a0a" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ep-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 5vw; height: 64px; transition: all 0.3s ease; }
        .ep-nav.scrolled { background: rgba(250,250,248,0.97); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(10,10,10,.08); }
        .ep-nav.top { background: transparent; }

        .ep-nav-logo img { height: 30px; transition: filter 0.3s; }
        .ep-nav.top .ep-nav-logo img { filter: brightness(0) invert(1); }
        .ep-nav.scrolled .ep-nav-logo img { filter: none; }

        .ep-nav-links { display: flex; gap: 32px; align-items: center; }
        .ep-nav-links a { font-size: 14px; text-decoration: none; letter-spacing: -.01em; opacity: 0.65; transition: opacity 0.2s; }
        .ep-nav.top .ep-nav-links a { color: #fff; }
        .ep-nav.scrolled .ep-nav-links a { color: #0a0a0a; }
        .ep-nav-links a:hover { opacity: 1; }
        .ep-nav-links a.active { opacity: 1; font-weight: 600; }

        .ep-btn-conn {
          font-size: 13px; text-decoration: none; padding: 8px 18px;
          border: 1px solid; transition: all 0.2s; font-weight: 500;
        }
        .ep-nav.top .ep-btn-conn { color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.2); background: transparent; }
        .ep-nav.top .ep-btn-conn:hover { color: #fff; border-color: rgba(255,255,255,0.6); }
        .ep-nav.scrolled .ep-btn-conn { color: #0a0a0a; border-color: rgba(10,10,10,0.2); background: transparent; }
        .ep-nav.scrolled .ep-btn-conn:hover { border-color: #0a0a0a; }

        .ep-btn-signup {
          font-size: 13px; text-decoration: none; padding: 8px 18px;
          font-weight: 600; transition: all 0.2s; border: 2px solid;
        }
        .ep-nav.top .ep-btn-signup { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.25); }
        .ep-nav.top .ep-btn-signup:hover { background: #fff; color: #0a0a0a; }
        .ep-nav.scrolled .ep-btn-signup { background: #0a0a0a; color: #FAFAF8; border-color: #0a0a0a; }
        .ep-nav.scrolled .ep-btn-signup:hover { background: #333; }

        .ep-hero { background: #0a0a0a; padding: 110px 5vw 64px; position: relative; overflow: hidden; }
        .ep-hero::after { content: 'ENTREPRISES'; position: absolute; right: -10px; bottom: -20px; font-size: 9rem; font-weight: 900; color: rgba(255,255,255,0.025); letter-spacing: -4px; pointer-events: none; white-space: nowrap; }
        .ep-hero-inner { max-width: 1200px; margin: 0 auto; position: relative; }
        .ep-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.3); margin-bottom: 18px; display: block; }
        .ep-hero-title { font-size: clamp(2.8rem,5.5vw,4.5rem); font-weight: 900; color: #FAFAF8; letter-spacing: -2.5px; line-height: 1.05; margin-bottom: 14px; }
        .ep-hero-title em { font-style: italic; color: #777; }
        .ep-hero-sub { font-size: 0.95rem; color: #555; font-weight: 300; margin-bottom: 36px; }

        .ep-search-row { display: flex; gap: 0; background: #111; border: 1px solid #1e1e1e; max-width: 560px; }
        .ep-search-inner { flex: 1; display: flex; align-items: center; gap: 12px; padding: 0 20px; }
        .ep-search-inner input { flex: 1; border: none; outline: none; background: transparent; font-size: 0.95rem; color: #FAFAF8; padding: 14px 0; }
        .ep-search-inner input::placeholder { color: #444; }
        .ep-searchbtn { background: #FAFAF8; color: #0a0a0a; border: none; padding: 0 24px; font-weight: 700; font-size: 0.8rem; cursor: pointer; letter-spacing: 0.5px; transition: background 0.2s; }
        .ep-searchbtn:hover { background: #e8e8e8; }

        .ep-pills { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 20px; }
        .ep-pill { font-size: 0.72rem; font-weight: 600; padding: 6px 14px; cursor: pointer; border: 1px solid rgba(255,255,255,0.12); color: #666; transition: all 0.2s; background: transparent; letter-spacing: 0.3px; }
        .ep-pill:hover { border-color: rgba(255,255,255,0.3); color: #ccc; }
        .ep-pill.active { background: #FAFAF8; color: #0a0a0a; border-color: #FAFAF8; }

        .ep-main { max-width: 1200px; margin: 0 auto; padding: 56px 5vw 96px; }
        .ep-section-label { font-size: 0.65rem; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #aaa; margin-bottom: 20px; display: flex; align-items: center; gap: 12px; }
        .ep-section-label::after { content: ''; flex: 1; height: 1px; background: #e8e8e8; }

        .ep-featured-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #e8e8e8; border: 1px solid #e8e8e8; margin-bottom: 56px; }
        .ep-feat-card { background: #fff; padding: 28px 24px; cursor: pointer; transition: background 0.25s; position: relative; overflow: hidden; }
        .ep-feat-card::before { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 0; background: #0a0a0a; transition: height 0.3s ease; }
        .ep-feat-card:hover::before { height: 100%; }
        .ep-feat-card:hover .ep-fc-logo { background: #FAFAF8; color: #0a0a0a; }
        .ep-feat-card:hover .ep-fc-nom { color: #FAFAF8; }
        .ep-feat-card:hover .ep-fc-meta { color: #555; }
        .ep-feat-card:hover .ep-fc-count { color: #FAFAF8; }
        .ep-fc-logo { width: 48px; height: 48px; background: #0a0a0a; color: #FAFAF8; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; margin-bottom: 20px; position: relative; z-index: 1; transition: all 0.3s; letter-spacing: 0.3px; }
        .ep-fc-nom { font-size: 1rem; font-weight: 700; letter-spacing: -0.2px; margin-bottom: 6px; position: relative; z-index: 1; transition: color 0.3s; }
        .ep-fc-meta { font-size: 0.75rem; color: #999; position: relative; z-index: 1; transition: color 0.3s; margin-bottom: 3px; }
        .ep-fc-count { font-size: 0.8rem; font-weight: 700; color: #0a0a0a; margin-top: 16px; position: relative; z-index: 1; transition: color 0.3s; }

        .ep-list { display: flex; flex-direction: column; gap: 1px; background: #e8e8e8; border: 1px solid #e8e8e8; }
        .ep-row { background: #fff; padding: 24px 28px; display: grid; grid-template-columns: 52px 1fr auto auto auto; align-items: center; gap: 20px; cursor: pointer; transition: background 0.2s; animation: epFadeUp 0.4s ease both; }
        .ep-row:hover { background: #FAFAF8; }
        .ep-row-logo { width: 44px; height: 44px; background: #0a0a0a; color: #FAFAF8; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; flex-shrink: 0; letter-spacing: 0.3px; }
        .ep-row-body { min-width: 0; }
        .ep-row-nom { font-size: 0.95rem; font-weight: 700; letter-spacing: -0.2px; margin-bottom: 4px; }
        .ep-row-meta { font-size: 0.75rem; color: #aaa; }
        .ep-row-secteur { font-size: 0.75rem; color: #888; padding: 4px 12px; border: 1px solid #ebebeb; white-space: nowrap; }
        .ep-row-offres { font-size: 0.8rem; font-weight: 700; color: #0a0a0a; white-space: nowrap; text-align: right; }
        .ep-row-arrow { color: #ccc; font-size: 1rem; transition: color 0.2s; }
        .ep-row:hover .ep-row-arrow { color: #0a0a0a; }

        .ep-skel { background: #fff; padding: 24px 28px; display: flex; gap: 16px; align-items: center; animation: epPulse 1.5s ease-in-out infinite; }
        .ep-skel-logo { width: 44px; height: 44px; background: #f0f0f0; flex-shrink: 0; }
        .ep-skel-lines { flex: 1; }
        .ep-skel-line { background: #f0f0f0; border-radius: 2px; margin-bottom: 8px; }
        @keyframes epPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .ep-empty { padding: 80px; text-align: center; color: #aaa; background: #fff; }
        .ep-empty h3 { font-size: 1.3rem; color: #0a0a0a; margin-bottom: 8px; }

        .ep-cta { background: #0a0a0a; color: #FAFAF8; padding: 80px 5vw; text-align: center; }
        .ep-cta h2 { font-size: clamp(2rem,4vw,3rem); font-weight: 900; letter-spacing: -1.5px; margin-bottom: 10px; }
        .ep-cta p { color: #666; margin-bottom: 28px; font-weight: 300; }
        .ep-btn-w { background: #FAFAF8; color: #0a0a0a; border: 2px solid #FAFAF8; padding: 13px 32px; font-weight: 700; font-size: 0.85rem; cursor: pointer; text-decoration: none; display: inline-block; letter-spacing: 0.5px; transition: background 0.2s; margin: 0 6px; }
        .ep-btn-w:hover { background: transparent; color: #FAFAF8; }
        .ep-btn-o { background: transparent; color: rgba(255,255,255,.6); border: 2px solid rgba(255,255,255,.15); padding: 13px 32px; font-weight: 400; font-size: 0.85rem; cursor: pointer; text-decoration: none; display: inline-block; margin: 0 6px; transition: border-color 0.2s, color 0.2s; }
        .ep-btn-o:hover { border-color: rgba(255,255,255,.5); color: #fff; }

        @keyframes epFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        @media (max-width: 900px) {
          .ep-nav-links { display: none !important; }
          .ep-nav-ctas { display: none !important; }
          .ep-burger { display: block !important; }
          .ep-featured-grid { grid-template-columns: 1fr 1fr; }
          .ep-row { grid-template-columns: 44px 1fr auto; }
          .ep-row-secteur { display: none; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className={`ep-nav ${scrolled ? "scrolled" : "top"}`}>
        <Link to="/" className="ep-nav-logo" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Logo" />
        </Link>
        <div className="ep-nav-links" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link to="/offres-public">Offres</Link>
          <Link to="/entreprises-public" className="active">Entreprises</Link>
          <Link to="/comment-ca-marche">Comment ça marche</Link>
        </div>
        <div className="ep-nav-ctas" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link to="/login" className="ep-btn-conn">Se connecter</Link>
          <Link to="/signup" className="ep-btn-signup">S'inscrire</Link>
        </div>
        <button
          className="ep-burger"
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
      <section className="ep-hero">
        <div className="ep-hero-inner">
          <span className="ep-eyebrow">Entreprises</span>
          <h1 className="ep-hero-title">
            {loading
              ? <>Chargement…</>
              : <><strong>{entreprises.length}</strong> entreprise{entreprises.length !== 1 ? "s" : ""}<br /><em>recrutent.</em></>}
          </h1>
          <p className="ep-hero-sub">Découvrez les entreprises qui font confiance à Talentic pour trouver leurs talents.</p>

          <div className="ep-search-row">
            <div className="ep-search-inner">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Nom, secteur, ville…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="ep-searchbtn">Rechercher</button>
          </div>

          {!loading && secteurs.length > 1 && (
            <div className="ep-pills">
              {secteurs.map((s) => (
                <button key={s} className={`ep-pill ${secteur === s ? "active" : ""}`} onClick={() => setSecteur(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CONTENT */}
      <div className="ep-main">
        {!loading && !search && secteur === "Tous" && filtered.length >= 4 && (
          <>
            <div className="ep-section-label">À la une</div>
            <div className="ep-featured-grid">
              {[...filtered].sort((a, b) => (b.offres_count || 0) - (a.offres_count || 0)).slice(0, 4).map((e, idx) => (
                <div key={e.id || idx} className="ep-feat-card" onClick={() => navigate("/login")}>
                  <div className="ep-fc-logo">{getInitials(e.nom)}</div>
                  <div className="ep-fc-nom">{e.nom}</div>
                  <div className="ep-fc-meta">{e.secteur || e.domaine || "—"}</div>
                  <div className="ep-fc-meta">📍 {e.ville || "—"}</div>
                  <div className="ep-fc-count">{e.offres_count || 0} offre{e.offres_count !== 1 ? "s" : ""}</div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="ep-section-label">
          {loading ? "Chargement…" : `${filtered.length} entreprise${filtered.length !== 1 ? "s" : ""}`}
        </div>
        <div className="ep-list">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="ep-skel">
                <div className="ep-skel-logo" />
                <div className="ep-skel-lines">
                  <div className="ep-skel-line" style={{ width: "35%", height: 14 }} />
                  <div className="ep-skel-line" style={{ width: "55%", height: 10 }} />
                </div>
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="ep-empty">
              <h3>Aucune entreprise trouvée</h3>
              <p>Modifiez votre recherche ou les filtres secteur.</p>
            </div>
          ) : (
            filtered.map((e, idx) => (
              <div
                key={e.id || idx}
                className="ep-row"
                style={{ animationDelay: `${Math.min(idx, 10) * 0.04}s` }}
                onClick={() => navigate("/login")}
              >
                <div className="ep-row-logo">{getInitials(e.nom)}</div>
                <div className="ep-row-body">
                  <div className="ep-row-nom">{e.nom}</div>
                  <div className="ep-row-meta">
                    {[e.ville, e.pays].filter(Boolean).join(", ") || "—"}
                  </div>
                </div>
                <div className="ep-row-secteur">{e.secteur || e.domaine || "—"}</div>
                <div className="ep-row-offres">{e.offres_count || 0} offre{e.offres_count !== 1 ? "s" : ""}</div>
                <div className="ep-row-arrow">→</div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="ep-cta">
        <h2>Vous recrutez ?</h2>
        <p>Rejoignez les entreprises qui font confiance à Talentic pour trouver leurs talents.</p>
        <Link to="/signup?role=entreprise" className="ep-btn-w">Publier une offre</Link>
        <Link to="/comment-ca-marche" className="ep-btn-o">En savoir plus</Link>
      </div>
    </div>
  );
}