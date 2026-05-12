import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../lib/auth";
import logo from "../assets/logo.svg";
/* ─── data ─────────────────────────────────────────────────────────────────── */
const STATS = [
  { value: "12 000+", label: "Offres actives" },
  { value: "3 400+",  label: "Entreprises" },
  { value: "98 %",   label: "Candidats satisfaits" },
  { value: "48 h",   label: "Réponse moyenne" },
];

const STEPS = [
  { num: "01", title: "Créez votre profil",    desc: "Compétences, expériences, ambitions. Votre profil est votre vitrine.", icon: "◎" },
  { num: "02", title: "Explorez les offres",   desc: "Filtrez par secteur, localisation, type de contrat. Des milliers d'opportunités.", icon: "◈" },
  { num: "03", title: "Postulez en un clic",   desc: "Candidature envoyée en quelques secondes. Suivi en temps réel.", icon: "◉" },
  { num: "04", title: "Décrochez le poste",    desc: "Entretiens planifiés, échanges directs, carrière construite.", icon: "◆" },
];

const CATEGORIES = [
  { label: "Tech & Data",      count: "2 841", dark: true  },
  { label: "Marketing",        count: "1 203", dark: false },
  { label: "Finance",          count: "987",   dark: true  },
  { label: "Design & Créatif", count: "654",   dark: false },
  { label: "RH & Management",  count: "512",   dark: true  },
  { label: "Commerce & Vente", count: "1 876", dark: false },
];

const TESTIMONIALS = [
  { name: "Amina Belkadi",  role: "Dev Full Stack · Paris",  initials: "AB", text: "En moins de deux semaines, j'avais trois entretiens et une offre en main. La plateforme est intuitive et les offres sont de vraie qualité." },
  { name: "Karim Meziane",  role: "Chef de projet · Lyon",   initials: "KM", text: "Ce qui m'a convaincu, c'est la transparence des entreprises. On sait exactement dans quoi on s'engage avant même de postuler." },
  { name: "Sarah Ouchen",   role: "UX Designer · Alger",     initials: "SO", text: "La génération de CV m'a sauvé la mise. Résultat propre et professionnel en quelques minutes chrono." },
];

/* ─── hooks ─────────────────────────────────────────────────────────────────── */
function useScrollY() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const h = () => setY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return y;
}

function useVisible() {
  const [vis, setVis] = useState({});
  useEffect(() => {
    const obs = new IntersectionObserver(
      (es) => es.forEach(e => e.isIntersecting && setVis(p => ({ ...p, [e.target.dataset.v]: true }))),
      { threshold: 0.12 }
    );
    document.querySelectorAll("[data-v]").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
  return vis;
}

/* ─── component ─────────────────────────────────────────────────────────────── */
export default function Welcomepage() {
  const navigate  = useNavigate();
  const scrollY   = useScrollY();
  const vis       = useVisible();
  const heroRef   = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  /* redirect if already logged in */
  useEffect(() => {
    if (isAuthenticated()) {
      const role = getUserRole();
      navigate(role === "entreprise" ? "/dashboard-entreprise" : "/dashboard-candidat", { replace: true });
    }
  }, [navigate]);

  const appear = (id, delay = 0) => ({
    opacity:   vis[id] ? 1 : 0,
    transform: vis[id] ? "translateY(0px)" : "translateY(28px)",
    transition: `opacity .65s cubic-bezier(.22,1,.36,1) ${delay}s,
                 transform .65s cubic-bezier(.22,1,.36,1) ${delay}s`,
  });

  return (
    <div style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", background: "#fff", color: "#0a0a0a", overflowX: "hidden" }}>

      {/* ═══ GLOBAL STYLES ═══════════════════════════════════════════════════ */}
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::selection { background: #0a0a0a; color: #fff; }

        .wl-nl {
          color: #0a0a0a; text-decoration: none; font-size: 14px; font-weight: 400;
          letter-spacing: -.01em; opacity: .55; transition: opacity .2s;
        }
        .wl-nl:hover { opacity: 1; }

        .wl-btn-p {
          display: inline-flex; align-items: center; gap: 6px;
          background: #0a0a0a; color: #fff;
          padding: 12px 24px; border-radius: 0;
          font-size: 14px; font-weight: 500; letter-spacing: -.02em;
          text-decoration: none; border: 2px solid #0a0a0a; cursor: pointer;
          transition: background .2s, color .2s, transform .15s;
          white-space: nowrap;
        }
        .wl-btn-p:hover { background: #fff; color: #0a0a0a; transform: translateY(-1px); }

        .wl-btn-g {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent; color: #0a0a0a;
          padding: 12px 24px; border-radius: 0;
          font-size: 14px; font-weight: 400; letter-spacing: -.02em;
          text-decoration: none; border: 2px solid rgba(10,10,10,.18); cursor: pointer;
          transition: border-color .2s, transform .15s;
          white-space: nowrap;
        }
        .wl-btn-g:hover { border-color: #0a0a0a; transform: translateY(-1px); }

        .wl-btn-gi {
          display: inline-flex; align-items: center; gap: 6px;
          background: transparent; color: rgba(255,255,255,.65);
          padding: 14px 28px; border-radius: 0;
          font-size: 14px; font-weight: 400; letter-spacing: -.02em;
          text-decoration: none; border: 2px solid rgba(255,255,255,.15); cursor: pointer;
          transition: border-color .2s, color .2s;
        }
        .wl-btn-gi:hover { border-color: rgba(255,255,255,.55); color: #fff; }

        .wl-btn-pi {
          display: inline-flex; align-items: center; gap: 6px;
          background: #fff; color: #0a0a0a;
          padding: 14px 28px; border-radius: 0;
          font-size: 15px; font-weight: 500; letter-spacing: -.02em;
          text-decoration: none; border: 2px solid #fff; cursor: pointer;
          transition: background .2s, color .2s, transform .15s;
        }
        .wl-btn-pi:hover { background: transparent; color: #fff; transform: translateY(-1px); }

        .wl-sc {
          border: 1px solid rgba(10,10,10,.1); padding: 32px 28px;
          transition: border-color .25s, transform .25s; cursor: default;
        }
        .wl-sc:hover { border-color: #0a0a0a; transform: translateY(-3px); }

        .wl-cat {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px; cursor: pointer; text-decoration: none;
          transition: opacity .2s, transform .2s;
        }
        .wl-cat:hover { opacity: .85; transform: scale(1.015); }

        .wl-tc {
          border: 1px solid rgba(10,10,10,.08); padding: 32px 28px;
          transition: border-color .25s, transform .25s;
        }
        .wl-tc:hover { border-color: #0a0a0a; transform: translateY(-2px); }

        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); clip-path: inset(0 0 100% 0); }
          to   { opacity: 1; transform: translateY(0);    clip-path: inset(0 0 0% 0); }
        }
        .hero-line-1 { animation: slideUp .9s cubic-bezier(.22,1,.36,1) .05s both; }
        .hero-line-2 { animation: slideUp .9s cubic-bezier(.22,1,.36,1) .18s both; }
        .hero-line-3 { animation: slideUp .9s cubic-bezier(.22,1,.36,1) .31s both; }
        .hero-sub    { animation: slideUp .9s cubic-bezier(.22,1,.36,1) .44s both; }
        .hero-cta    { animation: slideUp .9s cubic-bezier(.22,1,.36,1) .55s both; }
        .hero-badge  { animation: slideUp .7s cubic-bezier(.22,1,.36,1) 0s   both; }

        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }

        @media (max-width: 768px) {
          .wl-hero-title  { font-size: 42px !important; line-height: 1.05 !important; }
          .wl-steps-grid  { grid-template-columns: 1fr 1fr !important; }
          .wl-cats-grid   { grid-template-columns: 1fr !important; }
          .wl-testi-grid  { grid-template-columns: 1fr !important; }
          .wl-stats-grid  { grid-template-columns: 1fr 1fr !important; }
          .wl-nav-links   { display: none !important; }
          .wl-burger      { display: block !important; }
          .wl-footer-cols { flex-direction: column !important; }
          .wl-split       { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .wl-hero-title { font-size: 32px !important; }
          .wl-steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ═══ NAVBAR ══════════════════════════════════════════════════════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        height: "64px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 5vw",
        background: scrollY > 50 ? "rgba(255,255,255,0.97)" : "transparent",
        borderBottom: scrollY > 50 ? "1px solid rgba(10,10,10,.08)" : "none",
        backdropFilter: scrollY > 50 ? "blur(16px)" : "none",
        transition: "background .4s, border-color .4s, backdrop-filter .4s",
      }}>
        {/* logo */}
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "2px" }}>
          <img src={logo} alt="AutoCandidature" style={{ height: 30 }} />
        </Link>

        {/* desktop nav links — pointent vers les pages publiques */}
        <div className="wl-nav-links" style={{ display: "flex", alignItems: "center", gap: "36px" }}>
          <Link to="/offres-public"         className="wl-nl">Offres</Link>
          <Link to="/entreprises-public"    className="wl-nl">Entreprises</Link>
          <Link to="/comment-ca-marche"     className="wl-nl">Comment ça marche</Link>
        </div>

        {/* desktop CTA */}
        <div className="wl-nav-links" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link to="/login"  className="wl-btn-g" style={{ padding: "9px 20px", fontSize: "13px" }}>Se connecter</Link>
          <Link to="/signup" className="wl-btn-p" style={{ padding: "9px 20px", fontSize: "13px" }}>Commencer →</Link>
        </div>

        {/* burger */}
        <button
          className="wl-burger"
          onClick={() => setMenuOpen(o => !o)}
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#0a0a0a" }}
        >☰</button>
      </nav>

      {/* mobile menu */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 190,
          background: "#fff", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "28px",
        }}>
          <button onClick={() => setMenuOpen(false)} style={{ position: "absolute", top: "24px", right: "5vw", background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>✕</button>
          {[
            ["Offres",           "/offres-public"],
            ["Entreprises",      "/entreprises-public"],
            ["Comment ça marche","/comment-ca-marche"],
            ["Se connecter",     "/login"],
            ["S'inscrire",       "/signup"],
          ].map(([l, to]) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              style={{ fontSize: "26px", fontWeight: 600, color: "#0a0a0a", textDecoration: "none", letterSpacing: "-.03em" }}>
              {l}
            </Link>
          ))}
        </div>
      )}

      {/* ═══ HERO ════════════════════════════════════════════════════════════ */}
      <section ref={heroRef} style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "100px 5vw 80px",
        position: "relative", overflow: "hidden",
        borderBottom: "1px solid rgba(10,10,10,.08)",
      }}>
        {/* grid background */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: "linear-gradient(rgba(10,10,10,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(10,10,10,.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }} />

        {/* badge */}
        <div className="hero-badge" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "#fff", border: "1px solid rgba(10,10,10,.12)",
          padding: "6px 14px", fontSize: "11px", fontWeight: 500,
          letterSpacing: ".08em", color: "#555",
          marginBottom: "40px", width: "fit-content",
          position: "relative", zIndex: 1,
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#16a34a", display: "inline-block", animation: "float 2s ease-in-out infinite" }} />
          12 000+ OFFRES DISPONIBLES MAINTENANT
        </div>

        {/* title */}
        <h1 className="wl-hero-title" style={{
          fontSize: "clamp(48px,7.5vw,96px)",
          fontWeight: 700, letterSpacing: "-.05em",
          lineHeight: 1.0, maxWidth: "900px",
          position: "relative", zIndex: 1,
        }}>
          <span className="hero-line-1" style={{ display: "block" }}>La carrière</span>
          <span className="hero-line-2" style={{ display: "block" }}>que vous méritez</span>
          <span className="hero-line-3" style={{ display: "block", color: "rgba(10,10,10,.18)" }}>commence ici.</span>
        </h1>

        {/* sub */}
        <p className="hero-sub" style={{
          fontSize: "18px", fontWeight: 300, color: "#666",
          maxWidth: "500px", lineHeight: 1.7,
          marginTop: "32px", letterSpacing: "-.01em",
          position: "relative", zIndex: 1,
        }}>
          Des milliers d'opportunités vous attendent. Trouvez votre prochain poste ou recrutez les meilleurs talents.
        </p>

        {/* CTA */}
        <div className="hero-cta" style={{
          display: "flex", flexWrap: "wrap", gap: "12px",
          marginTop: "44px", position: "relative", zIndex: 1,
        }}>
          <Link to="/signup" className="wl-btn-p" style={{ padding: "14px 30px", fontSize: "15px" }}>
            Trouver un emploi →
          </Link>
          <Link to="/signup?role=entreprise" className="wl-btn-g" style={{ padding: "14px 30px", fontSize: "15px" }}>
            Je recrute
          </Link>
        </div>

        {/* scroll hint */}
        <div style={{
          position: "absolute", bottom: "36px", left: "5vw",
          display: "flex", alignItems: "center", gap: "10px",
          fontSize: "11px", color: "#bbb", letterSpacing: ".08em", fontWeight: 500,
          animation: "slideUp .8s cubic-bezier(.22,1,.36,1) .8s both",
        }}>
          <div style={{ width: "1px", height: "36px", background: "linear-gradient(to bottom, transparent, #bbb)" }} />
          DÉFILER
        </div>

        {/* decorative year */}
        <div style={{
          position: "absolute", right: "4vw", top: "50%",
          transform: `translateY(calc(-50% + ${scrollY * .04}px))`,
          fontWeight: 800, fontSize: "clamp(100px,16vw,200px)",
          color: "rgba(10,10,10,.03)", letterSpacing: "-.06em",
          lineHeight: 1, userSelect: "none", pointerEvents: "none",
          transition: "transform .1s linear",
        }}>
          {new Date().getFullYear()}
        </div>
      </section>

      {/* ═══ MARQUEE ═════════════════════════════════════════════════════════ */}
      <div style={{ background: "#0a0a0a", padding: "18px 0", overflow: "hidden", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
        <div style={{ display: "flex", animation: "marquee 22s linear infinite", width: "max-content" }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: "0" }}>
              {["Tech & Data", "Marketing", "Finance", "Design", "RH", "Commerce", "Logistique", "Santé"].map((s, j) => (
                <span key={j} style={{
                  fontSize: "13px", fontWeight: 500, letterSpacing: ".06em",
                  color: "rgba(255,255,255,.35)", padding: "0 40px",
                  borderRight: "1px solid rgba(255,255,255,.08)",
                  textTransform: "uppercase", whiteSpace: "nowrap",
                }}>
                  {s}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ STATS ═══════════════════════════════════════════════════════════ */}
      <section style={{ background: "#0a0a0a", padding: "0 5vw" }}>
        <div className="wl-stats-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(4,1fr)",
          borderTop: "1px solid rgba(255,255,255,.06)",
        }}>
          {STATS.map((s, i) => (
            <div key={i} data-v={`stat${i}`} style={{
              padding: "52px 24px", textAlign: "center",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,.06)" : "none",
              ...appear(`stat${i}`, i * .1),
            }}>
              <div style={{ fontWeight: 800, fontSize: "clamp(36px,4vw,52px)", letterSpacing: "-.04em", color: "#fff", lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ color: "rgba(255,255,255,.35)", fontSize: "12px", marginTop: "10px", letterSpacing: ".06em", textTransform: "uppercase" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ COMMENT ÇA MARCHE ═══════════════════════════════════════════════ */}
      <section id="comment" style={{ padding: "120px 5vw" }}>
        <div data-v="sh" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "24px", marginBottom: "64px", ...appear("sh") }}>
          <div>
            <p style={{ fontSize: "11px", letterSpacing: ".1em", color: "#999", textTransform: "uppercase", marginBottom: "14px", fontWeight: 500 }}>
              Comment ça marche
            </p>
            <h2 style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 700, letterSpacing: "-.04em", lineHeight: 1.05 }}>
              Quatre étapes.<br />
              <span style={{ color: "rgba(10,10,10,.2)" }}>Un seul objectif.</span>
            </h2>
          </div>
          <Link to="/comment-ca-marche" className="wl-btn-p">En savoir plus →</Link>
        </div>

        <div className="wl-steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px", background: "rgba(10,10,10,.08)" }}>
          {STEPS.map((s, i) => (
            <div key={i} data-v={`step${i}`} className="wl-sc" style={{ background: "#fff", ...appear(`step${i}`, i * .1) }}>
              <div style={{ fontSize: "28px", marginBottom: "28px", color: "rgba(10,10,10,.15)", fontWeight: 100 }}>{s.icon}</div>
              <div style={{ fontSize: "10px", letterSpacing: ".12em", color: "#ccc", marginBottom: "14px", fontWeight: 600 }}>{s.num}</div>
              <h3 style={{ fontSize: "17px", fontWeight: 600, letterSpacing: "-.025em", marginBottom: "12px" }}>{s.title}</h3>
              <p style={{ fontSize: "13px", color: "#777", lineHeight: 1.7, fontWeight: 300 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CATÉGORIES ══════════════════════════════════════════════════════ */}
      <section id="entreprises" style={{ padding: "0 5vw 120px" }}>
        <div data-v="ch" style={{ marginBottom: "48px", ...appear("ch") }}>
          <p style={{ fontSize: "11px", letterSpacing: ".1em", color: "#999", textTransform: "uppercase", marginBottom: "14px", fontWeight: 500 }}>
            Secteurs d'activité
          </p>
          <h2 style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 700, letterSpacing: "-.04em" }}>
            Explorez par domaine.
          </h2>
        </div>

        <div className="wl-cats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px", background: "rgba(10,10,10,.08)" }}>
          {CATEGORIES.map((c, i) => (
            <Link
              key={i} to="/offres-public" data-v={`cat${i}`}
              className="wl-cat"
              style={{
                background: c.dark ? "#0a0a0a" : "#fff",
                color:      c.dark ? "#fff"    : "#0a0a0a",
                ...appear(`cat${i}`, i * .07),
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: 600, letterSpacing: "-.02em" }}>{c.label}</span>
              <span style={{ fontSize: "12px", opacity: .45, fontWeight: 400 }}>{c.count} offres →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ SPLIT SECTION ═══════════════════════════════════════════════════ */}
      <section className="wl-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderTop: "1px solid rgba(10,10,10,.08)", borderBottom: "1px solid rgba(10,10,10,.08)" }}>
        {/* candidat */}
        <div data-v="split1" style={{ padding: "80px 5vw", borderRight: "1px solid rgba(10,10,10,.08)", ...appear("split1") }}>
          <div style={{ fontSize: "40px", marginBottom: "24px" }}>👤</div>
          <h3 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-.035em", marginBottom: "16px" }}>
            Vous cherchez un emploi ?
          </h3>
          <p style={{ fontSize: "15px", color: "#666", lineHeight: 1.7, fontWeight: 300, marginBottom: "32px" }}>
            Créez votre profil, importez votre CV ou laissez notre IA en générer un, et postulez aux meilleures offres en un clic.
          </p>
          <Link to="/signup" className="wl-btn-p">Créer mon profil →</Link>
        </div>

        {/* entreprise */}
        <div data-v="split2" style={{ padding: "80px 5vw", background: "#0a0a0a", ...appear("split2", .12) }}>
          <div style={{ fontSize: "40px", marginBottom: "24px" }}>🏢</div>
          <h3 style={{ fontSize: "28px", fontWeight: 700, letterSpacing: "-.035em", marginBottom: "16px", color: "#fff" }}>
            Vous recrutez ?
          </h3>
          <p style={{ fontSize: "15px", color: "rgba(255,255,255,.5)", lineHeight: 1.7, fontWeight: 300, marginBottom: "32px" }}>
            Publiez vos offres, parcourez des centaines de profils qualifiés et planifiez vos entretiens directement sur la plateforme.
          </p>
          <Link to="/signup?role=entreprise" className="wl-btn-pi">Publier une offre →</Link>
        </div>
      </section>

      {/* ═══ TÉMOIGNAGES ═════════════════════════════════════════════════════ */}
      <section style={{ padding: "120px 5vw" }}>
        <div data-v="th" style={{ marginBottom: "64px", ...appear("th") }}>
          <p style={{ fontSize: "11px", letterSpacing: ".1em", color: "#999", textTransform: "uppercase", marginBottom: "14px", fontWeight: 500 }}>
            Ils nous font confiance
          </p>
          <h2 style={{ fontSize: "clamp(32px,4vw,52px)", fontWeight: 700, letterSpacing: "-.04em" }}>
            Des parcours qui<br />
            <span style={{ color: "rgba(10,10,10,.2)" }}>inspirent.</span>
          </h2>
        </div>

        <div className="wl-testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "2px", background: "rgba(10,10,10,.08)" }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} data-v={`tt${i}`} className="wl-tc" style={{ background: "#fff", ...appear(`tt${i}`, i * .12) }}>
              <div style={{ display: "flex", gap: "3px", marginBottom: "22px" }}>
                {[...Array(5)].map((_, k) => <span key={k} style={{ color: "#0a0a0a", fontSize: "13px" }}>★</span>)}
              </div>
              <p style={{ fontSize: "15px", color: "#333", lineHeight: 1.75, fontWeight: 300, marginBottom: "28px", fontStyle: "italic" }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: "#0a0a0a", color: "#fff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "11px", fontWeight: 700, letterSpacing: ".04em", flexShrink: 0,
                }}>{t.initials}</div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: "12px", color: "#999", marginTop: "2px" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA FINAL ═══════════════════════════════════════════════════════ */}
      <section data-v="cta" style={{
        background: "#0a0a0a", padding: "120px 5vw",
        textAlign: "center", position: "relative", overflow: "hidden",
        ...appear("cta"),
      }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "11px", letterSpacing: ".1em", color: "rgba(255,255,255,.3)", textTransform: "uppercase", marginBottom: "20px", fontWeight: 500 }}>
            Commencer maintenant
          </p>
          <h2 style={{
            fontSize: "clamp(40px,6vw,80px)", fontWeight: 800,
            letterSpacing: "-.05em", color: "#fff", lineHeight: 1.0,
            marginBottom: "12px",
          }}>
            Votre avenir<br />
            <span style={{ color: "rgba(255,255,255,.2)" }}>ne peut pas attendre.</span>
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,.4)", marginBottom: "48px", fontWeight: 300 }}>
            Inscription gratuite · Aucune carte requise · 2 minutes
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
            <Link to="/signup" className="wl-btn-pi" style={{ fontSize: "15px", padding: "16px 36px" }}>
              Créer un compte →
            </Link>
            <Link to="/offres-public" className="wl-btn-gi" style={{ fontSize: "15px", padding: "16px 36px" }}>
              Voir les offres
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ══════════════════════════════════════════════════════════ */}
      <footer style={{ background: "#050505", padding: "72px 5vw 36px", borderTop: "1px solid rgba(255,255,255,.04)" }}>
        <div className="wl-footer-cols" style={{ display: "flex", justifyContent: "space-between", gap: "48px", marginBottom: "64px", flexWrap: "wrap" }}>

          {/* brand */}
          <div style={{ maxWidth: "280px" }}>
            <Link to="/" style={{ textDecoration: "none", display: "inline-flex", gap: "2px", marginBottom: "16px" }}>
              <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-.04em", color: "#fff" }}>talent</span>
              <span style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-.04em", color: "rgba(255,255,255,.25)" }}>link</span>
            </Link>
            <p style={{ color: "rgba(255,255,255,.3)", fontSize: "13px", lineHeight: 1.7, fontWeight: 300 }}>
              La plateforme qui connecte les talents aux meilleures opportunités professionnelles.
            </p>
          </div>

          {/* columns */}
          <div style={{ display: "flex", gap: "64px", flexWrap: "wrap" }}>
            {[
              {
                title: "Candidats",
                links: [
                  { label: "Offres d'emploi",   to: "/offres-public" },
                  { label: "Créer mon profil",  to: "/signup" },
                  { label: "Générer un CV",      to: "/generer-cv" },
                  { label: "Mes candidatures",   to: "/candidatures" },
                ],
              },
              {
                title: "Entreprises",
                links: [
                  { label: "Nos entreprises",      to: "/entreprises-public" },
                  { label: "Publier une offre",    to: "/signup?role=entreprise" },
                  { label: "Tableau de bord",      to: "/dashboard-entreprise" },
                  { label: "Candidatures reçues",  to: "/entreprise/candidatures" },
                ],
              },
              {
                title: "Découvrir",
                links: [
                  { label: "Comment ça marche",   to: "/comment-ca-marche" },
                  { label: "Se connecter",         to: "/login" },
                  { label: "S'inscrire",           to: "/signup" },
                  { label: "Mot de passe oublié",  to: "/forgot-password" },
                ],
              },
            ].map((col, ci) => (
              <div key={ci}>
                <p style={{ color: "#fff", fontSize: "13px", fontWeight: 600, marginBottom: "16px", letterSpacing: ".01em" }}>{col.title}</p>
                {col.links.map((lnk, li) => (
                  <Link key={li} to={lnk.to} style={{
                    display: "block", color: "rgba(255,255,255,.3)", fontSize: "13px",
                    marginBottom: "10px", textDecoration: "none", fontWeight: 300,
                    transition: "color .2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = "rgba(255,255,255,.7)"}
                    onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.3)"}
                  >{lnk.label}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,.04)",
          paddingTop: "28px", display: "flex",
          justifyContent: "space-between", flexWrap: "wrap", gap: "12px",
        }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,.18)", letterSpacing: ".02em" }}>
            © {new Date().getFullYear()} Talentlink — Tous droits réservés
          </p>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,.18)" }}>
            Fait avec soin 🖤
          </p>
        </div>
      </footer>

    </div>
  );
}