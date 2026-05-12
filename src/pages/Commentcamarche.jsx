import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.svg";

const STEPS_CANDIDAT = [
  { num: "01", titre: "Créez votre profil", desc: "Renseignez vos compétences, expériences et aspirations en quelques minutes. Importez ou générez votre CV directement depuis la plateforme.", icon: "◎" },
  { num: "02", titre: "Explorez les offres", desc: "Parcourez des centaines d'offres sélectionnées. Chaque fiche entreprise vous donne une vision claire de la culture et des valeurs.", icon: "◈" },
  { num: "03", titre: "Postulez en un clic", desc: "Votre dossier est prêt. Envoyez votre candidature en un instant. Suivez l'avancement en temps réel depuis votre tableau de bord.", icon: "◉" },
  { num: "04", titre: "Décrochez le poste", desc: "Échangez directement avec les recruteurs, planifiez vos entretiens et recevez vos offres — tout en un seul endroit.", icon: "◆" },
];

const STEPS_ENTREPRISE = [
  { num: "01", titre: "Créez votre page", desc: "Présentez votre entreprise, votre culture et vos avantages. Une page employeur soignée attire les meilleurs candidats.", icon: "◎" },
  { num: "02", titre: "Publiez vos offres", desc: "Rédigez vos annonces en quelques minutes grâce à nos outils intelligents. Diffusez vers des milliers de candidats qualifiés.", icon: "◈" },
  { num: "03", titre: "Gérez les candidatures", desc: "Centralisez toutes vos candidatures, commentez, filtrez et collaborez avec votre équipe RH depuis un tableau de bord unifié.", icon: "◉" },
  { num: "04", titre: "Recrutez les meilleurs", desc: "Planifiez vos entretiens, faites vos offres et onboardez vos nouvelles recrues — Talentic vous accompagne jusqu'à la signature.", icon: "◆" },
];

const FAQ = [
  { q: "Talentic est-il gratuit pour les candidats ?", r: "Oui, totalement. Créer un profil, postuler aux offres et générer votre CV sont entièrement gratuits pour les candidats." },
  { q: "Comment sont sélectionnées les entreprises ?", r: "Chaque entreprise passe par un processus de validation. Nous vérifions leur identité et la qualité de leurs offres avant toute publication." },
  { q: "Comment fonctionne le générateur de CV ?", r: "Renseignez vos informations une fois, choisissez un modèle professionnel, et téléchargez un CV PDF en quelques secondes." },
  { q: "Puis-je suivre mes candidatures en temps réel ?", r: "Oui. Votre tableau de bord affiche l'état de chaque candidature : vue, en cours, entretien planifié, offre reçue." },
  { q: "Les entreprises paient-elles pour utiliser Talentic ?", r: "Les entreprises disposent d'un abonnement mensuel pour publier des offres et accéder aux outils RH. Une période d'essai gratuite est disponible." },
];

const FEATURES = [
  { icon: "⚡", name: "Générateur de CV", desc: "Créez un CV professionnel en PDF en quelques secondes grâce à nos modèles soignés." },
  { icon: "◎", name: "Suivi des candidatures", desc: "Tableau de bord complet pour suivre chaque candidature de l'envoi à l'entretien." },
  { icon: "◈", name: "Alertes personnalisées", desc: "Recevez les offres qui correspondent exactement à vos critères en temps réel." },
  { icon: "◆", name: "Messagerie intégrée", desc: "Échangez directement avec les recruteurs sans quitter la plateforme." },
  { icon: "◉", name: "Profils vérifiés", desc: "Entreprises et candidats vérifiés pour des échanges en toute confiance." },
  { icon: "✦", name: "Analytics recruteurs", desc: "Statistiques détaillées sur la portée et la performance de vos offres." },
];

export default function CommentCaMarche() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("candidat");
  const [openFaq, setOpenFaq] = useState(null);
  const [visible, setVisible] = useState({});
  const refs = useRef({});

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible((v) => ({ ...v, [e.target.dataset.id]: true }));
      }),
      { threshold: 0.15 }
    );
    Object.values(refs.current).forEach((r) => r && observer.observe(r));
    return () => observer.disconnect();
  }, []);

  const setRef = (key) => (el) => { refs.current[key] = el; };
  const steps = activeTab === "candidat" ? STEPS_CANDIDAT : STEPS_ENTREPRISE;

  return (
    <div style={{ fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", background: "#FAFAF8", minHeight: "100vh", color: "#0a0a0a" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        .cm-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 5vw; height: 64px; transition: all 0.3s ease; }
        .cm-nav.scrolled { background: rgba(250,250,248,0.97); backdrop-filter: blur(14px); border-bottom: 1px solid rgba(10,10,10,.08); }
        .cm-nav.top { background: transparent; }

        .cm-nav-logo img { height: 30px; transition: filter 0.3s; }
        .cm-nav.top .cm-nav-logo img { filter: brightness(0) invert(1); }
        .cm-nav.scrolled .cm-nav-logo img { filter: none; }

        .cm-nav-links { display: flex; gap: 32px; align-items: center; }
        .cm-nav-links a { font-size: 14px; text-decoration: none; transition: opacity 0.2s; letter-spacing: -.01em; opacity: 0.65; }
        .cm-nav.top .cm-nav-links a { color: #fff; }
        .cm-nav.scrolled .cm-nav-links a { color: #0a0a0a; }
        .cm-nav-links a:hover { opacity: 1; }
        .cm-nav-links a.active { opacity: 1; font-weight: 600; }

        .cm-btn-conn {
          font-size: 13px; text-decoration: none; padding: 8px 18px;
          border: 1px solid; transition: all 0.2s; font-weight: 500;
        }
        .cm-nav.top .cm-btn-conn { color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.2); background: transparent; }
        .cm-nav.top .cm-btn-conn:hover { color: #fff; border-color: rgba(255,255,255,0.6); }
        .cm-nav.scrolled .cm-btn-conn { color: #0a0a0a; border-color: rgba(10,10,10,0.2); background: transparent; }
        .cm-nav.scrolled .cm-btn-conn:hover { border-color: #0a0a0a; }

        .cm-btn-signup {
          font-size: 13px; text-decoration: none; padding: 8px 18px;
          font-weight: 600; transition: all 0.2s; border: 2px solid;
        }
        .cm-nav.top .cm-btn-signup { background: rgba(255,255,255,0.12); color: #fff; border-color: rgba(255,255,255,0.25); }
        .cm-nav.top .cm-btn-signup:hover { background: #fff; color: #0a0a0a; }
        .cm-nav.scrolled .cm-btn-signup { background: #0a0a0a; color: #FAFAF8; border-color: #0a0a0a; }
        .cm-nav.scrolled .cm-btn-signup:hover { background: #333; }

        .cm-hero { background: #0a0a0a; padding: 130px 5vw 90px; position: relative; overflow: hidden; text-align: center; }
        .cm-hero-grid { position: absolute; inset: 0; pointer-events: none; background-image: repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.018) 80px, rgba(255,255,255,0.018) 81px), repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.018) 80px, rgba(255,255,255,0.018) 81px); }
        .cm-hero-inner { position: relative; max-width: 700px; margin: 0 auto; }
        .cm-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.3); margin-bottom: 24px; display: block; }
        .cm-hero-title { font-size: clamp(52px,8vw,88px); font-weight: 700; color: #FAFAF8; letter-spacing: -.05em; line-height: 0.95; margin-bottom: 28px; }
        .cm-hero-title em { font-style: italic; color: rgba(255,255,255,.2); }
        .cm-hero-sub { font-size: 17px; color: rgba(255,255,255,.4); line-height: 1.7; margin-bottom: 40px; font-weight: 300; }
        .cm-hero-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .cm-btn-w { background: #FAFAF8; color: #0a0a0a; border: 2px solid #FAFAF8; padding: 13px 32px; font-size: 14px; font-weight: 500; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; letter-spacing: -.02em; transition: background .2s, color .2s; }
        .cm-btn-w:hover { background: transparent; color: #FAFAF8; }
        .cm-btn-o { background: transparent; color: rgba(255,255,255,.6); border: 2px solid rgba(255,255,255,.15); padding: 13px 32px; font-size: 14px; font-weight: 400; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; transition: border-color .2s, color .2s; }
        .cm-btn-o:hover { border-color: rgba(255,255,255,.5); color: #fff; }

        .cm-stats { background: #fff; border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5; display: grid; grid-template-columns: repeat(4, 1fr); }
        .cm-stat { padding: 44px 24px; text-align: center; border-right: 1px solid #e8e8e8; opacity: 0; transform: translateY(16px); transition: all 0.55s ease; }
        .cm-stat.visible { opacity: 1; transform: translateY(0); }
        .cm-stat:last-child { border-right: none; }
        .cm-stat-num { font-size: clamp(32px,3.5vw,48px); font-weight: 700; letter-spacing: -.04em; color: #0a0a0a; line-height: 1; margin-bottom: 8px; }
        .cm-stat-label { font-size: 11px; color: #aaa; font-weight: 500; letter-spacing: .06em; text-transform: uppercase; }

        .cm-steps-section { max-width: 1200px; margin: 0 auto; padding: 100px 5vw; }
        .cm-section-header { text-align: center; margin-bottom: 56px; }
        .cm-section-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #bbb; margin-bottom: 16px; display: block; }
        .cm-section-title { font-size: clamp(32px,4vw,52px); font-weight: 700; letter-spacing: -.04em; margin-bottom: 10px; line-height: 1.05; }
        .cm-section-sub { font-size: 15px; color: #aaa; font-weight: 300; }

        .cm-tabs { display: flex; border: 1px solid rgba(10,10,10,.1); width: fit-content; margin: 0 auto 56px; }
        .cm-tab { font-size: 14px; font-weight: 500; padding: 11px 28px; cursor: pointer; border: none; background: transparent; color: #aaa; letter-spacing: -.01em; transition: all 0.2s; }
        .cm-tab.active { background: #0a0a0a; color: #FAFAF8; }
        .cm-tab:hover:not(.active) { background: #f5f5f5; color: #0a0a0a; }

        .cm-steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: rgba(10,10,10,.08); position: relative; }
        .cm-step { background: #fff; padding: 36px 28px; text-align: center; opacity: 0; transform: translateY(20px); transition: all 0.5s ease; border: 1px solid transparent; }
        .cm-step:hover { border-color: rgba(10,10,10,.1); transform: translateY(-3px) !important; }
        .cm-step.visible { opacity: 1; transform: translateY(0); }
        .cm-step-bubble { width: 60px; height: 60px; margin: 0 auto 24px; background: #fff; border: 1.5px solid #0a0a0a; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; position: relative; }
        .cm-step-num { position: absolute; top: -9px; right: -9px; font-size: 9px; font-weight: 700; background: #0a0a0a; color: #FAFAF8; padding: 2px 5px; letter-spacing: 1px; }
        .cm-step-title { font-size: 16px; font-weight: 600; letter-spacing: -.025em; margin-bottom: 10px; }
        .cm-step-desc { font-size: 13px; color: #888; line-height: 1.7; font-weight: 300; }

        .cm-features { background: #0a0a0a; padding: 100px 5vw; }
        .cm-features-inner { max-width: 1200px; margin: 0 auto; }
        .cm-features-title { font-size: clamp(28px,3.5vw,48px); font-weight: 700; color: #FAFAF8; letter-spacing: -.04em; margin-bottom: 56px; text-align: center; }
        .cm-feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: #161616; border: 1px solid #161616; }
        .cm-feat-item { background: #0a0a0a; padding: 40px 32px; opacity: 0; transform: translateY(14px); transition: all 0.5s ease; border-bottom: 2px solid transparent; }
        .cm-feat-item:hover { border-bottom-color: #fff; }
        .cm-feat-item.visible { opacity: 1; transform: translateY(0); }
        .cm-feat-icon { font-size: 1.8rem; margin-bottom: 20px; }
        .cm-feat-name { font-size: 15px; font-weight: 600; color: #FAFAF8; margin-bottom: 8px; letter-spacing: -.02em; }
        .cm-feat-desc { font-size: 13px; color: #555; line-height: 1.7; font-weight: 300; }

        .cm-compare-section { max-width: 900px; margin: 0 auto; padding: 100px 5vw; }
        .cm-compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: rgba(10,10,10,.08); border: 1px solid rgba(10,10,10,.08); }
        .cm-compare-col { background: #fff; padding: 44px 40px; }
        .cm-compare-col.dark { background: #0a0a0a; }
        .cm-compare-header { font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #ccc; margin-bottom: 8px; }
        .cm-compare-col.dark .cm-compare-header { color: #444; }
        .cm-compare-role { font-size: clamp(22px,2.5vw,30px); font-weight: 700; letter-spacing: -.035em; margin-bottom: 28px; }
        .cm-compare-col.dark .cm-compare-role { color: #FAFAF8; }
        .cm-compare-list { list-style: none; display: flex; flex-direction: column; gap: 14px; }
        .cm-compare-list li { font-size: 14px; display: flex; gap: 10px; align-items: flex-start; color: #555; font-weight: 300; }
        .cm-compare-col.dark .cm-compare-list li { color: #666; }
        .cm-check { flex-shrink: 0; font-size: 13px; margin-top: 1px; }
        .cm-compare-link { margin-top: 36px; display: inline-block; font-size: 13px; font-weight: 600; text-decoration: none; letter-spacing: -.01em; padding-bottom: 2px; }
        .cm-compare-col:not(.dark) .cm-compare-link { color: #0a0a0a; border-bottom: 1px solid #0a0a0a; }
        .cm-compare-col.dark .cm-compare-link { color: #FAFAF8; border-bottom: 1px solid rgba(255,255,255,.2); }

        .cm-faq-section { max-width: 760px; margin: 0 auto; padding: 0 5vw 100px; }
        .cm-faq-item { border-bottom: 1px solid rgba(10,10,10,.08); }
        .cm-faq-q { width: 100%; border: none; background: transparent; font-size: 16px; font-weight: 600; color: #0a0a0a; text-align: left; padding: 22px 0; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 16px; letter-spacing: -.02em; font-family: inherit; }
        .cm-faq-q:hover { color: #444; }
        .cm-faq-icon { font-size: 1.3rem; color: #ccc; flex-shrink: 0; transition: transform 0.3s, color 0.2s; }
        .cm-faq-icon.open { transform: rotate(45deg); color: #0a0a0a; }
        .cm-faq-a { font-size: 14px; color: #777; line-height: 1.75; overflow: hidden; max-height: 0; transition: max-height 0.35s ease, padding 0.3s ease; font-weight: 300; }
        .cm-faq-a.open { max-height: 200px; padding-bottom: 22px; }

        .cm-cta { background: #0a0a0a; padding: 120px 5vw; text-align: center; position: relative; overflow: hidden; }
        .cm-cta::before { content: ''; position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 700px; height: 700px; background: radial-gradient(circle, rgba(255,255,255,0.035), transparent 70%); pointer-events: none; }
        .cm-cta-inner { position: relative; }
        .cm-cta h2 { font-size: clamp(40px,6vw,80px); font-weight: 700; color: #FAFAF8; letter-spacing: -.05em; line-height: 1; margin-bottom: 20px; }
        .cm-cta h2 span { color: rgba(255,255,255,.2); }
        .cm-cta p { font-size: 16px; color: rgba(255,255,255,.35); margin-bottom: 40px; font-weight: 300; }
        .cm-cta-row { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        @media (max-width: 900px) {
          .cm-nav-links { display: none !important; }
          .cm-nav-ctas { display: none !important; }
          .cm-burger { display: block !important; }
          .cm-steps-grid { grid-template-columns: 1fr 1fr; }
          .cm-stats { grid-template-columns: 1fr 1fr; }
          .cm-feat-grid { grid-template-columns: 1fr; }
          .cm-compare-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .cm-steps-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav className={`cm-nav ${scrolled ? "scrolled" : "top"}`}>
        <Link to="/" className="cm-nav-logo" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
          <img src={logo} alt="Logo" />
        </Link>
        <div className="cm-nav-links" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          <Link to="/offres-public">Offres</Link>
          <Link to="/entreprises-public">Entreprises</Link>
          <Link to="/comment-ca-marche" className="active">Comment ça marche</Link>
        </div>
        <div className="cm-nav-ctas" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link to="/login" className="cm-btn-conn">Se connecter</Link>
          <Link to="/signup" className="cm-btn-signup">S'inscrire</Link>
        </div>
        <button
          className="cm-burger"
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
      <section className="cm-hero">
        <div className="cm-hero-grid" />
        <div className="cm-hero-inner">
          <span className="cm-eyebrow">Comment ça marche</span>
          <h1 className="cm-hero-title">
            Simple.<br /><em>Rapide.</em><br />Efficace.
          </h1>
          <p className="cm-hero-sub">
            De la création de profil à l'offre signée —<br />
            nous vous accompagnons à chaque étape.
          </p>
          <div className="cm-hero-btns">
            <Link to="/signup" className="cm-btn-w">Je suis candidat →</Link>
            <Link to="/signup?role=entreprise" className="cm-btn-o">Je recrute</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="cm-stats">
        {[
          { num: "12 000+", label: "Offres publiées" },
          { num: "3 400+",  label: "Entreprises partenaires" },
          { num: "18 000+", label: "Candidats inscrits" },
          { num: "98%",     label: "Taux de satisfaction" },
        ].map((s, i) => (
          <div
            key={i}
            className={`cm-stat ${visible[`stat-${i}`] ? "visible" : ""}`}
            data-id={`stat-${i}`}
            ref={setRef(`stat-${i}`)}
            style={{ transitionDelay: `${i * 0.1}s` }}
          >
            <div className="cm-stat-num">{s.num}</div>
            <div className="cm-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* STEPS */}
      <section className="cm-steps-section">
        <div className="cm-section-header">
          <span className="cm-section-eyebrow">Le processus</span>
          <h2 className="cm-section-title">4 étapes pour réussir</h2>
          <p className="cm-section-sub">Que vous soyez candidat ou recruteur, tout est pensé pour aller à l'essentiel.</p>
        </div>
        <div className="cm-tabs">
          <button className={`cm-tab ${activeTab === "candidat" ? "active" : ""}`} onClick={() => setActiveTab("candidat")}>
            Je cherche un emploi
          </button>
          <button className={`cm-tab ${activeTab === "entreprise" ? "active" : ""}`} onClick={() => setActiveTab("entreprise")}>
            Je recrute
          </button>
        </div>
        <div className="cm-steps-grid">
          {steps.map((s, i) => (
            <div
              key={`${activeTab}-${i}`}
              className={`cm-step ${visible[`step-${i}`] ? "visible" : ""}`}
              data-id={`step-${i}`}
              ref={setRef(`step-${i}`)}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="cm-step-bubble">
                {s.icon}
                <span className="cm-step-num">{s.num}</span>
              </div>
              <div className="cm-step-title">{s.titre}</div>
              <div className="cm-step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="cm-features">
        <div className="cm-features-inner">
          <h2 className="cm-features-title">Tout ce dont vous avez besoin</h2>
          <div className="cm-feat-grid">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`cm-feat-item ${visible[`feat-${i}`] ? "visible" : ""}`}
                data-id={`feat-${i}`}
                ref={setRef(`feat-${i}`)}
                style={{ transitionDelay: `${i * 0.08}s` }}
              >
                <div className="cm-feat-icon">{f.icon}</div>
                <div className="cm-feat-name">{f.name}</div>
                <div className="cm-feat-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARE */}
      <section className="cm-compare-section">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="cm-section-eyebrow">Vous êtes…</span>
          <h2 className="cm-section-title">Fait pour vous,<br />quel que soit votre rôle</h2>
        </div>
        <div className="cm-compare-grid">
          <div className="cm-compare-col">
            <div className="cm-compare-header">Candidat</div>
            <div className="cm-compare-role">Je cherche un emploi</div>
            <ul className="cm-compare-list">
              {["Profil et CV 100% gratuits", "Accès à toutes les offres", "Suivi candidatures en temps réel", "Messagerie avec les recruteurs", "Alertes emploi personnalisées", "Générateur de CV professionnel"].map((item, i) => (
                <li key={i}><span className="cm-check">✓</span>{item}</li>
              ))}
            </ul>
            <Link to="/signup" className="cm-compare-link">Commencer gratuitement →</Link>
          </div>
          <div className="cm-compare-col dark">
            <div className="cm-compare-header">Recruteur</div>
            <div className="cm-compare-role">Je cherche des talents</div>
            <ul className="cm-compare-list">
              {["Page entreprise complète", "Publication d'offres illimitées", "Gestion centralisée des CVs", "Collaboration équipe RH", "Statistiques et analytics", "Messagerie avec les candidats"].map((item, i) => (
                <li key={i}><span className="cm-check">✓</span>{item}</li>
              ))}
            </ul>
            <Link to="/signup?role=entreprise" className="cm-compare-link">Essai gratuit →</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="cm-faq-section">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="cm-section-eyebrow">FAQ</span>
          <h2 className="cm-section-title">Questions fréquentes</h2>
        </div>
        {FAQ.map((item, i) => (
          <div key={i} className="cm-faq-item">
            <button className="cm-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              {item.q}
              <span className={`cm-faq-icon ${openFaq === i ? "open" : ""}`}>+</span>
            </button>
            <div className={`cm-faq-a ${openFaq === i ? "open" : ""}`}>{item.r}</div>
          </div>
        ))}
      </section>

      {/* CTA FINAL */}
      <section className="cm-cta">
        <div className="cm-cta-inner">
          <h2>Votre avenir<br /><span>ne peut pas attendre.</span></h2>
          <p>Inscription gratuite · Aucune carte requise · 2 minutes</p>
          <div className="cm-cta-row">
            <Link to="/signup" className="cm-btn-w">Créer mon compte →</Link>
            <Link to="/offres-public" className="cm-btn-o">Voir les offres</Link>
          </div>
        </div>
      </section>
    </div>
  );
}