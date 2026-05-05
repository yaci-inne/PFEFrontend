import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ══════════════════════════════════════════
   HOOKS
══════════════════════════════════════════ */
const useReveal = (threshold = 0.12) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const useScrollProgress = () => {
  const ref = useRef(null);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const winH = window.innerHeight;
      const p = Math.min(1, Math.max(0, (winH - rect.top) / (winH + rect.height)));
      setProgress(p);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return [ref, progress];
};

/* ── Word-by-word reveal ── */
const WordReveal = ({ children, delay = 0, className = "" }) => {
  const [ref, visible] = useReveal(0.15);
  const words = String(children).split(" ");
  return (
    <span ref={ref} className={className} style={{ display: "inline" }}>
      {words.map((w, i) => (
        <span key={i} style={{
          display: "inline-block", overflow: "hidden",
          verticalAlign: "bottom", marginRight: "0.25em",
        }}>
          <span style={{
            display: "inline-block",
            transform: visible ? "translateY(0)" : "translateY(110%)",
            opacity: visible ? 1 : 0,
            transition: `transform 0.7s cubic-bezier(.22,1,.36,1) ${delay + i * 0.06}s,
                         opacity 0.4s ease ${delay + i * 0.06}s`,
          }}>{w}</span>
        </span>
      ))}
    </span>
  );
};

/* ── Reveal wrapper ── */
const Reveal = ({ children, delay = 0, className = "", from = "bottom" }) => {
  const [ref, visible] = useReveal();
  const transforms = {
    bottom: "translateY(40px)",
    left:   "translateX(-40px)",
    right:  "translateX(40px)",
  };
  return (
    <div ref={ref} className={className} style={{
      opacity:   visible ? 1 : 0,
      transform: visible ? "none" : (transforms[from] || transforms.bottom),
      transition: `opacity 0.8s cubic-bezier(.22,1,.36,1) ${delay}s,
                   transform 0.8s cubic-bezier(.22,1,.36,1) ${delay}s`,
    }}>
      {children}
    </div>
  );
};

/* ── Animated counter ── */
const Counter = ({ to, suffix = "" }) => {
  const [val, setVal] = useState(0);
  const [ref, visible] = useReveal(0.3);
  useEffect(() => {
    if (!visible) return;
    let cur = 0;
    const step = Math.ceil(to / 60);
    const id = setInterval(() => {
      cur += step;
      if (cur >= to) { setVal(to); clearInterval(id); }
      else setVal(cur);
    }, 18);
    return () => clearInterval(id);
  }, [visible, to]);
  return <span ref={ref}>{val}{suffix}</span>;
};

/* ── Magnetic button ── */
const useMagnetic = () => {
  const ref = useRef(null);
  const handleMove = (e) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.25;
    const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.25;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  };
  const handleLeave = () => { if (ref.current) ref.current.style.transform = "translate(0,0)"; };
  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave };
};

/* ── 3D Tilt card ── */
const TiltCard = ({ children, className = "" }) => {
  const ref = useRef(null);
  const handleMove = (e) => {
    const el = ref.current; if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -10;
    el.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale(1.015)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(800px) rotateX(0) rotateY(0) scale(1)";
  };
  return (
    <div ref={ref} className={className}
      onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{ transition: "transform 0.3s cubic-bezier(.22,1,.36,1)", transformStyle: "preserve-3d" }}>
      {children}
    </div>
  );
};

/* ══════════════════════════════════════════
   PAGE
══════════════════════════════════════════ */
const WelcomePage = () => {
  const [mousePos, setMousePos]         = useState({ x: -200, y: -200 });
  const [scrollY, setScrollY]           = useState(0);
  const [pageProgress, setPageProgress] = useState(0);
  const [cursorHover, setCursorHover]   = useState(false);
  const magBtn      = useMagnetic();
  const timelineRef = useRef(null);
  const [tlProgress, setTlProgress]     = useState(0);
  const [stickyRef, stickyProgress]     = useScrollProgress();

  useEffect(() => {
    const onScroll = () => {
      const y   = window.scrollY;
      const max = document.body.scrollHeight - window.innerHeight;
      setScrollY(y);
      setPageProgress(y / max);
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / rect.height));
        setTlProgress(p);
      }
    };
    const onMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  /* ── data ── */
  const features = [
    { num: "01", title: "CV Intelligent",      desc: "Générez un CV optimisé par IA adapté à chaque offre en quelques secondes.", icon: "✦" },
    { num: "02", title: "Envoi Automatisé",     desc: "Postulez à des dizaines d'offres simultanément sans répétition manuelle.",  icon: "⟡" },
    { num: "03", title: "Suivi en Temps Réel",  desc: "Dashboard centralisé pour suivre chaque candidature et statut de réponse.", icon: "◈" },
    { num: "04", title: "Entretiens Planifiés", desc: "Choisissez vos créneaux d'entretien directement depuis votre espace.",       icon: "◎" },
  ];
  const stats = [
    { value: 94,   suffix: "%", label: "Taux de réponse"  },
    { value: 3200, suffix: "+", label: "Candidats actifs"  },
    { value: 12,   suffix: "×", label: "Plus rapide"       },
    { value: 480,  suffix: "+", label: "Entreprises"       },
  ];
  const steps = [
    { step: "01", title: "Créez votre profil",      desc: "Importez ou générez votre CV. Renseignez vos préférences de poste." },
    { step: "02", title: "Sélectionnez vos offres", desc: "Parcourez les offres ou laissez l'IA vous recommander les meilleures correspondances." },
    { step: "03", title: "Lancez l'envoi",          desc: "En un clic, vos candidatures partent automatiquement avec le bon CV." },
    { step: "04", title: "Suivez & décrochez",      desc: "Recevez les réponses, choisissez vos créneaux d'entretien, signez." },
  ];
  const testimonials = [
    { name: "Amira B.", role: "Développeuse Frontend · Alger",  text: "En 2 semaines j'ai eu 8 réponses. Avant j'en envoyais 3 par jour manuellement." },
    { name: "Karim M.", role: "Data Analyst · Oran",            text: "Le CV généré par IA était tellement mieux que le mien. Entretien la semaine suivante." },
    { name: "Sara L.",  role: "UX Designer · Constantine",      text: "La gestion des créneaux d'entretien m'a sauvé la mise. Interface vraiment propre." },
  ];

  const panelIdx = Math.round(stickyProgress * (features.length - 1));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Geist:wght@300;400;500;600;700;800&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .wp {
          --ink:   #0a0a0a;
          --ink2:  #3a3a3a;
          --ink3:  #888;
          --ink4:  #b8b8b8;
          --bg:    #f4f3ef;
          --white: #ffffff;
          --line:  #e0ddd8;
          font-family: 'Geist', sans-serif;
          background: var(--bg);
          color: var(--ink);
          overflow-x: hidden;
          cursor: none;
          -webkit-font-smoothing: antialiased;
        }

        /* ── PROGRESS ── */
        .wp-bar {
          position: fixed; top: 0; left: 0; height: 2px; z-index: 300;
          background: var(--ink); pointer-events: none;
          transition: width 0.08s linear;
        }

        /* ── CURSOR ── */
        .wp-cur-dot {
          position: fixed; pointer-events: none; z-index: 9999;
          width: 9px; height: 9px; border-radius: 50%;
          background: var(--ink); mix-blend-mode: difference;
          transform: translate(-50%,-50%);
          transition: width .2s, height .2s;
          will-change: left, top;
        }
        .wp-cur-dot.h { width: 16px; height: 16px; }
        .wp-cur-ring {
          position: fixed; pointer-events: none; z-index: 9998;
          width: 36px; height: 36px; border-radius: 50%;
          border: 1px solid rgba(10,10,10,.22);
          transform: translate(-50%,-50%);
          transition: left .1s ease, top .1s ease, width .25s, height .25s, border-color .25s;
          will-change: left, top;
        }
        .wp-cur-ring.h { width: 52px; height: 52px; border-color: rgba(10,10,10,.45); }

        /* ── NAV ── */
        .wp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 68px;
          transition: background .4s, border-color .4s, backdrop-filter .4s;
          border-bottom: 1px solid transparent;
        }
        .wp-nav.s {
          background: rgba(244,243,239,.94);
          border-color: rgba(0,0,0,.07);
          backdrop-filter: blur(18px);
        }
        .wp-nav-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
        .wp-nav-logo-box {
          width: 32px; height: 32px; background: var(--ink); border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          transition: transform .35s cubic-bezier(.22,1,.36,1), border-radius .3s;
        }
        .wp-nav-logo:hover .wp-nav-logo-box { transform: rotate(90deg); border-radius: 50%; }
        .wp-nav-logo-text { font-size: 14px; font-weight: 800; color: var(--ink); letter-spacing: -.02em; }
        .wp-nav-links { display: flex; align-items: center; gap: 2px; }
        .wp-nav-link {
          padding: 6px 13px; border-radius: 8px; font-size: 13px; font-weight: 500;
          color: var(--ink2); text-decoration: none; transition: all .15s; position: relative;
        }
        .wp-nav-link::after {
          content:''; position: absolute; bottom: 4px; left: 13px; right: 13px;
          height: 1px; background: var(--ink);
          transform: scaleX(0); transition: transform .2s; transform-origin: left;
        }
        .wp-nav-link:hover { color: var(--ink); }
        .wp-nav-link:hover::after { transform: scaleX(1); }
        .wp-nav-cta {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--ink); color: #fff; border-radius: 100px;
          padding: 9px 22px; font-size: 13px; font-weight: 600;
          text-decoration: none; cursor: none;
          box-shadow: 0 2px 0 rgba(0,0,0,.25);
          transition: transform .25s cubic-bezier(.22,1,.36,1), box-shadow .25s;
        }
        .wp-nav-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,.18); }

        /* ── HERO ── */
        .wp-hero {
          min-height: 100vh; padding-top: 68px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding-left: 24px; padding-right: 24px;
          position: relative; overflow: hidden;
        }
        .wp-hero-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(0,0,0,.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,.045) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%);
        }
        .wp-hero-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: .22em;
          text-transform: uppercase; color: var(--ink3); margin-bottom: 28px;
          display: flex; align-items: center; gap: 10px;
          opacity: 0; animation: fadeUp .6s .15s ease forwards;
        }
        .wp-hero-eyebrow::before,
        .wp-hero-eyebrow::after {
          content:''; display: inline-block; width: 24px; height: 1px; background: var(--ink4);
        }
        .wp-hero-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(80px, 13vw, 190px);
          line-height: .9; letter-spacing: -.01em; color: var(--ink);
          opacity: 0; animation: fadeUp .9s .3s cubic-bezier(.22,1,.36,1) forwards;
        }
        .wp-hero-title em { font-style: normal; color: transparent; -webkit-text-stroke: 2px var(--ink); }
        .wp-hero-sub {
          font-size: clamp(15px, 1.6vw, 17px); color: var(--ink2); font-weight: 300;
          line-height: 1.7; max-width: 480px; margin: 28px auto 0;
          opacity: 0; animation: fadeUp .7s .5s ease forwards;
        }
        .wp-hero-actions {
          display: flex; align-items: center; gap: 14px; margin-top: 44px;
          flex-wrap: wrap; justify-content: center;
          opacity: 0; animation: fadeUp .7s .65s ease forwards;
        }
        .wp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--ink); color: #fff; border-radius: 100px;
          padding: 15px 34px; font-size: 14px; font-weight: 600;
          font-family: 'Geist', sans-serif; text-decoration: none; cursor: none;
          box-shadow: 0 2px 0 rgba(0,0,0,.35), 0 8px 32px rgba(0,0,0,.09);
          transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s;
        }
        .wp-btn-primary:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 2px 0 rgba(0,0,0,.35), 0 20px 48px rgba(0,0,0,.18); }
        .wp-btn-ghost {
          display: inline-flex; align-items: center; gap: 6px; cursor: none;
          background: transparent; color: var(--ink);
          border: 1.5px solid rgba(0,0,0,.18); border-radius: 100px;
          padding: 15px 28px; font-size: 14px; font-weight: 500;
          font-family: 'Geist', sans-serif; text-decoration: none;
          transition: border-color .2s, background .2s, transform .2s;
        }
        .wp-btn-ghost:hover { border-color: var(--ink); background: rgba(0,0,0,.03); transform: translateY(-2px); }

        /* watermark — parallax factor 0.12 (réduit) */
        .wp-hero-wm {
          position: absolute; bottom: -8px; left: 0; right: 0; text-align: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(60px, 15vw, 240px);
          color: rgba(0,0,0,.038); letter-spacing: -.03em;
          pointer-events: none; white-space: nowrap; z-index: 0;
          will-change: transform;
        }
        .wp-scroll-hint {
          position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          opacity: 0; animation: fadeUp .6s 1s ease forwards; z-index: 2;
        }
        .wp-scroll-track {
          width: 1px; height: 48px; background: rgba(0,0,0,.1);
          position: relative; overflow: hidden;
        }
        .wp-scroll-fill {
          position: absolute; top: -100%; width: 1px; height: 100%;
          background: var(--ink);
          animation: lineDown 1.7s 1.1s cubic-bezier(.4,0,.2,1) infinite;
        }
        @keyframes lineDown { 0%{top:-100%} 100%{top:100%} }
        .wp-scroll-lbl { font-size: 9px; letter-spacing: .18em; text-transform: uppercase; color: var(--ink3); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }

        /* ── TICKER ── */
        .wp-ticker { overflow: hidden; background: var(--ink); padding: 14px 0; }
        .wp-ticker-track { display: flex; animation: ticker 26s linear infinite; }
        .wp-ticker:hover .wp-ticker-track { animation-play-state: paused; }
        .wp-ticker-item {
          display: inline-flex; align-items: center; gap: 18px;
          font-size: 10.5px; font-weight: 600; letter-spacing: .17em;
          text-transform: uppercase; color: rgba(255,255,255,.55);
          padding: 0 28px; white-space: nowrap;
        }
        .wp-ticker-sep { color: rgba(255,255,255,.22); font-size: 7px; }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* ── MARQUEE (scroll factor réduit à 0.06) ── */
        .wp-marquee {
          overflow: hidden; padding: 76px 0;
          border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
        }
        .wp-marquee-track {
          display: flex; white-space: nowrap;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(52px, 7.5vw, 112px);
          color: var(--line); letter-spacing: -.01em;
          will-change: transform;
        }
        .wp-marquee-item { padding: 0 28px; display: inline-flex; align-items: center; gap: 28px; }
        .wp-marquee-dot { width: 9px; height: 9px; border-radius: 50%; background: var(--line); flex-shrink: 0; }

        /* ── SECTION ── */
        .wp-section { max-width: 1100px; margin: 0 auto; padding: 120px 40px; }
        .wp-eyebrow {
          font-size: 10px; font-weight: 600; letter-spacing: .22em;
          text-transform: uppercase; color: var(--ink3); margin-bottom: 14px;
        }
        .wp-section-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 6.5vw, 90px);
          line-height: .93; letter-spacing: -.01em; color: var(--ink);
        }
        .wp-section-title em { font-style: normal; color: transparent; -webkit-text-stroke: 1.5px var(--ink); }

        /* ── FEATURES ── */
        .wp-feat-grid {
          display: grid; grid-template-columns: repeat(2,1fr);
          gap: 1px; background: var(--line);
          border: 1px solid var(--line); border-radius: 20px;
          overflow: hidden; margin-top: 56px;
        }
        @media(max-width:640px){ .wp-feat-grid{ grid-template-columns:1fr; } }
        .wp-feat-card {
          background: var(--white); padding: 44px 40px;
          position: relative; overflow: hidden; cursor: none;
          transition: background .2s;
        }
        .wp-feat-card:hover { background: #fafaf6; }
        .wp-feat-icon {
          font-size: 26px; margin-bottom: 18px; display: block;
          transition: transform .45s cubic-bezier(.22,1,.36,1);
        }
        .wp-feat-card:hover .wp-feat-icon { transform: scale(1.18) rotate(12deg); }
        .wp-feat-num   { font-family: 'Bebas Neue', sans-serif; font-size: 11px; letter-spacing: .13em; color: var(--ink4); margin-bottom: 10px; }
        .wp-feat-title { font-size: 20px; font-weight: 700; color: var(--ink); margin-bottom: 9px; letter-spacing: -.02em; }
        .wp-feat-desc  { font-size: 13px; color: var(--ink2); line-height: 1.65; font-weight: 300; }
        .wp-feat-line {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: var(--ink);
          transform: scaleX(0); transform-origin: left;
          transition: transform .45s cubic-bezier(.22,1,.36,1);
        }
        .wp-feat-card:hover .wp-feat-line { transform: scaleX(1); }

        /* ── TRUST ── */
        .wp-trust {
          border-top: 1px solid var(--line); padding: 36px 40px;
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; gap: 28px; flex-wrap: wrap;
        }
        .wp-trust-lbl { font-size: 10px; letter-spacing: .18em; text-transform: uppercase; color: var(--ink4); flex-shrink: 0; }
        .wp-trust-sep  { width: 1px; height: 16px; background: var(--line); flex-shrink: 0; }
        .wp-trust-items{ display: flex; gap: 4px; flex-wrap: wrap; align-items: center; }
        .wp-trust-item {
          font-size: 13px; font-weight: 500; color: var(--ink4);
          padding: 4px 12px; border-radius: 6px; cursor: default;
          transition: color .2s, background .2s;
        }
        .wp-trust-item:hover { color: var(--ink); background: rgba(0,0,0,.04); }

        /* ── STATS ── */
        .wp-stats { background: var(--white); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
        .wp-stats-grid { max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(4,1fr); }
        @media(max-width:768px){ .wp-stats-grid{ grid-template-columns:repeat(2,1fr); } }
        .wp-stat {
          padding: 64px 32px; text-align: center;
          border-right: 1px solid var(--line); position: relative; overflow: hidden;
          transition: background .2s; cursor: default;
        }
        .wp-stat:last-child { border-right: none; }
        .wp-stat:hover { background: #fafaf6; }
        .wp-stat::after {
          content:''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: var(--ink); transform: scaleX(0); transform-origin: left;
          transition: transform .5s cubic-bezier(.22,1,.36,1);
        }
        .wp-stat:hover::after { transform: scaleX(1); }
        .wp-stat-val {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(52px, 5.5vw, 80px); color: var(--ink); line-height: 1;
        }
        .wp-stat-lbl { font-size: 12px; color: var(--ink3); margin-top: 10px; letter-spacing: .05em; }

        /* ── STICKY ── */
        .wp-sticky-outer { height: 300vh; position: relative; }
        .wp-sticky-inner {
          position: sticky; top: 68px; height: calc(100vh - 68px);
          display: flex; align-items: center; overflow: hidden;
          background: var(--ink);
        }
        .wp-sticky-panels { display: flex; height: 100%; will-change: transform; }
        .wp-sticky-panel {
          min-width: 100vw; height: 100%;
          display: flex; flex-direction: column; justify-content: center;
          padding: 0 clamp(28px, 6vw, 100px);
        }
        .wp-sticky-lbl {
          font-size: 10px; font-weight: 600; letter-spacing: .22em;
          text-transform: uppercase; color: rgba(255,255,255,.28); margin-bottom: 18px;
        }
        .wp-sticky-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(52px, 8vw, 118px);
          color: #fff; line-height: .9; letter-spacing: -.01em;
        }
        .wp-sticky-title em { font-style: normal; color: transparent; -webkit-text-stroke: 1px #fff; }
        .wp-sticky-desc {
          font-size: 15.5px; color: rgba(255,255,255,.45); font-weight: 300;
          max-width: 460px; margin-top: 24px; line-height: 1.7;
        }
        .wp-sticky-phantom {
          position: absolute; top: 50%; right: 56px; transform: translateY(-50%);
          font-family: 'Bebas Neue', sans-serif; font-size: 220px;
          color: rgba(255,255,255,.03); letter-spacing: -.06em; pointer-events: none; line-height: 1;
        }
        .wp-sticky-progress {
          position: absolute; bottom: 0; left: 0; height: 2px; background: rgba(255,255,255,.6);
          transition: width .06s linear;
        }
        .wp-sticky-dots {
          position: absolute; bottom: 28px; right: 52px;
          display: flex; gap: 7px; align-items: center;
        }
        .wp-sticky-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: rgba(255,255,255,.22);
          transition: background .3s, transform .3s, width .3s;
        }
        .wp-sticky-dot.on { background: #fff; transform: scale(1.3); width: 18px; border-radius: 3px; }

        /* ── TIMELINE ── */
        .wp-tl { position: relative; padding: 72px 0; }
        .wp-tl-line {
          position: absolute; left: 39px; top: 72px; bottom: 72px; width: 1px;
          background: var(--line);
        }
        .wp-tl-fill {
          position: absolute; top: 0; left: 0; width: 100%; background: var(--ink);
          transition: height .1s linear;
        }
        .wp-tl-item {
          display: grid; grid-template-columns: 80px 1fr; gap: 28px;
          margin-bottom: 52px;
        }
        .wp-tl-item:last-child { margin-bottom: 0; }
        .wp-tl-dot-col { display: flex; flex-direction: column; align-items: center; padding-top: 4px; }
        .wp-tl-dot {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid var(--line); background: var(--bg);
          flex-shrink: 0; position: relative; z-index: 1;
          transition: all .4s cubic-bezier(.22,1,.36,1);
        }
        .wp-tl-dot.lit { border-color: var(--ink); background: var(--ink); box-shadow: 0 0 0 4px rgba(10,10,10,.08); }
        .wp-tl-step  { font-family: 'Bebas Neue', sans-serif; font-size: 10px; letter-spacing: .1em; color: var(--ink4); margin-top: 7px; }
        .wp-tl-title { font-size: 21px; font-weight: 700; color: var(--ink); margin-bottom: 7px; letter-spacing: -.02em; }
        .wp-tl-desc  { font-size: 13.5px; color: var(--ink2); font-weight: 300; line-height: 1.65; }

        /* ── TESTIMONIALS ── */
        .wp-testi-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; margin-top: 56px; }
        @media(max-width:768px){ .wp-testi-grid{ grid-template-columns:1fr; } }
        .wp-testi {
          background: var(--white); border: 1px solid var(--line); border-radius: 16px;
          padding: 32px; position: relative; overflow: hidden; cursor: none;
          transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s;
        }
        .wp-testi:hover { transform: translateY(-6px); box-shadow: 0 20px 52px rgba(0,0,0,.07); }
        .wp-testi-quote {
          position: absolute; top: -6px; right: 18px;
          font-family: 'Bebas Neue', sans-serif; font-size: 96px;
          color: rgba(0,0,0,.045); pointer-events: none; line-height: 1;
        }
        .wp-testi-stars { display: flex; gap: 2px; margin-bottom: 16px; }
        .wp-testi-star  { color: #c8a03e; font-size: 12px; }
        .wp-testi-text  { font-size: 13.5px; color: var(--ink2); line-height: 1.72; font-weight: 300; font-style: italic; margin-bottom: 22px; }
        .wp-testi-name  { font-size: 13px; font-weight: 700; color: var(--ink); }
        .wp-testi-role  { font-size: 11px; color: var(--ink3); margin-top: 2px; }

        /* ── CTA ── */
        .wp-cta { background: var(--ink); position: relative; overflow: hidden; }
        .wp-cta-inner {
          max-width: 1100px; margin: 0 auto; padding: 120px 40px;
          display: flex; align-items: center; justify-content: space-between; gap: 48px;
        }
        @media(max-width:768px){ .wp-cta-inner{ flex-direction:column; text-align:center; padding:80px 24px; } }
        .wp-cta-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(56px, 8vw, 108px); color: #fff; line-height: .9; flex: 1;
        }
        .wp-cta-title em { font-style: normal; color: transparent; -webkit-text-stroke: 1px #fff; }
        .wp-cta-right { flex-shrink: 0; display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
        @media(max-width:768px){ .wp-cta-right{ align-items:center; } }
        .wp-cta-sub { font-size: 14px; color: rgba(255,255,255,.38); font-weight: 300; line-height: 1.65; max-width: 280px; }
        .wp-btn-white {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fff; color: var(--ink); border-radius: 100px;
          padding: 15px 34px; font-size: 14px; font-weight: 700; cursor: none;
          font-family: 'Geist', sans-serif; text-decoration: none;
          box-shadow: 0 8px 28px rgba(255,255,255,.12);
          transition: transform .3s cubic-bezier(.22,1,.36,1), box-shadow .3s;
        }
        .wp-btn-white:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 20px 52px rgba(255,255,255,.22); }
        .wp-cta-link {
          font-size: 13px; color: rgba(255,255,255,.3); text-decoration: none;
          transition: color .2s; display: flex; align-items: center; gap: 5px;
        }
        .wp-cta-link:hover { color: rgba(255,255,255,.6); }
        .wp-cta-wm {
          position: absolute; bottom: -24px; left: 0; right: 0; text-align: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(72px, 14vw, 220px); color: rgba(255,255,255,.025);
          pointer-events: none; white-space: nowrap;
        }

        /* ── FOOTER ── */
        .wp-footer {
          background: #090909; padding: 22px 48px;
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 14px;
        }
        .wp-footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 15px; color: rgba(255,255,255,.3); letter-spacing: .04em; }
        .wp-footer-copy { font-size: 11px; color: rgba(255,255,255,.2); }
        .wp-footer-links { display: flex; gap: 22px; }
        .wp-footer-link { font-size: 11.5px; color: rgba(255,255,255,.22); text-decoration: none; transition: color .2s; }
        .wp-footer-link:hover { color: rgba(255,255,255,.5); }

        @media(max-width:640px){
          .wp-nav{ padding:0 20px; }
          .wp-nav-links{ display:none; }
          .wp-section{ padding:72px 20px; }
          .wp-trust{ padding:28px 20px; }
          .wp-footer{ padding:18px 20px; }
        }
      `}</style>

      {/* PROGRESS */}
      <div className="wp-bar" style={{ width: `${pageProgress * 100}%` }} />

      {/* CURSOR */}
      <div className={`wp-cur-dot${cursorHover ? " h" : ""}`} style={{ left: mousePos.x, top: mousePos.y }} />
      <div className={`wp-cur-ring${cursorHover ? " h" : ""}`} style={{ left: mousePos.x, top: mousePos.y }} />

      <div className="wp">

        {/* NAV */}
        <nav className={`wp-nav${scrollY > 30 ? " s" : ""}`}>
          <a href="/" className="wp-nav-logo">
            <div className="wp-nav-logo-box">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M12 3L3 8.5V15.5L12 21L21 15.5V8.5L12 3Z" fill="#fff"/>
                <path d="M12 3v18M3 8.5l18 7M21 8.5l-18 7" stroke="rgba(255,255,255,.35)" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="wp-nav-logo-text">YourDreamJob</span>
          </a>
          <div className="wp-nav-links">
            {["Candidats", "Entreprises", "Fonctionnalités", "À propos"].map((l) => (
              <a key={l} href="#" className="wp-nav-link"
                onMouseEnter={() => setCursorHover(true)}
                onMouseLeave={() => setCursorHover(false)}
              >{l}</a>
            ))}
          </div>
          <Link to="/login" className="wp-nav-cta"
            onMouseEnter={() => setCursorHover(true)}
            onMouseLeave={() => setCursorHover(false)}
          >Commencer <span>→</span></Link>
        </nav>

        {/* HERO */}
        <section className="wp-hero">
          <div className="wp-hero-grid" />
          <p className="wp-hero-eyebrow">Plateforme d'AutoCandidature</p>
          <h1 className="wp-hero-title">
            Décroche<br />ton <em>Dream</em><br />Job.
          </h1>
          <p className="wp-hero-sub">
            Automatisez vos candidatures, générez des CV sur mesure et suivez chaque réponse — tout en un seul endroit.
          </p>
          <div className="wp-hero-actions">
            <div {...magBtn}>
              <Link to="/register" className="wp-btn-primary" ref={magBtn.ref}
                onMouseEnter={() => setCursorHover(true)}
                onMouseLeave={() => setCursorHover(false)}
              >Créer un compte gratuit <span>→</span></Link>
            </div>
            <Link to="/login" className="wp-btn-ghost"
              onMouseEnter={() => setCursorHover(true)}
              onMouseLeave={() => setCursorHover(false)}
            >Se connecter</Link>
          </div>

          {/* parallax factor: 0.12 au lieu de 0.28 — beaucoup plus doux */}
          <div className="wp-hero-wm" style={{ transform: `translateY(${scrollY * 0.12}px)` }}>
            YOURDREAMJOB
          </div>

          <div className="wp-scroll-hint">
            <div className="wp-scroll-track"><div className="wp-scroll-fill" /></div>
            <span className="wp-scroll-lbl">Scroll</span>
          </div>
        </section>

        {/* TICKER */}
        <div className="wp-ticker">
          <div className="wp-ticker-track">
            {Array(10).fill(null).map((_, i) => (
              <span key={i} className="wp-ticker-item">
                AutoCandidature <span className="wp-ticker-sep">✦</span>
                CV Intelligent <span className="wp-ticker-sep">✦</span>
                Entretiens Planifiés <span className="wp-ticker-sep">✦</span>
                Suivi Temps Réel <span className="wp-ticker-sep">✦</span>
              </span>
            ))}
          </div>
        </div>

        {/* MARQUEE — translateX factor: 0.06 au lieu de 0.15 */}
        <div className="wp-marquee">
          <div className="wp-marquee-track" style={{ transform: `translateX(${-scrollY * 0.06}px)` }}>
            {Array(6).fill(null).map((_, i) => (
              <span key={i} className="wp-marquee-item">
                POSTULEZ PLUS VITE <span className="wp-marquee-dot" />
                DÉCROCHEZ PLUS <span className="wp-marquee-dot" />
              </span>
            ))}
          </div>
        </div>

        {/* FEATURES */}
        <div className="wp-section">
          <Reveal>
            <p className="wp-eyebrow">Ce qu'on vous offre</p>
            <h2 className="wp-section-title">
              <WordReveal>Tout ce dont vous</WordReveal><br />
              <WordReveal delay={0.2}><em>avez besoin</em></WordReveal>
            </h2>
          </Reveal>
          <div className="wp-feat-grid">
            {features.map((f, i) => (
              <Reveal key={f.num} delay={i * 0.08} from="bottom">
                <TiltCard>
                  <div className="wp-feat-card"
                    onMouseEnter={() => setCursorHover(true)}
                    onMouseLeave={() => setCursorHover(false)}
                  >
                    <span className="wp-feat-icon">{f.icon}</span>
                    <p className="wp-feat-num">{f.num}</p>
                    <p className="wp-feat-title">{f.title}</p>
                    <p className="wp-feat-desc">{f.desc}</p>
                    <div className="wp-feat-line" />
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>

        {/* TRUST */}
        <Reveal>
          <div className="wp-trust">
            <span className="wp-trust-lbl">Candidats actifs dans</span>
            <div className="wp-trust-sep" />
            <div className="wp-trust-items">
              {["Alger", "Oran", "Constantine", "Annaba", "Tlemcen", "Sétif"].map((c) => (
                <span key={c} className="wp-trust-item">{c}</span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* STATS */}
        <div className="wp-stats">
          <div className="wp-stats-grid">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.07} from="bottom">
                <div className="wp-stat">
                  <div className="wp-stat-val"><Counter to={s.value} suffix={s.suffix} /></div>
                  <p className="wp-stat-lbl">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* STICKY PANELS */}
        <div className="wp-sticky-outer" ref={stickyRef}>
          <div className="wp-sticky-inner">
            <div
              className="wp-sticky-panels"
              style={{
                transform: `translateX(${-Math.min(stickyProgress, 0.999) * (features.length - 1) * 100}vw)`,
                transition: "transform 0.06s linear",
              }}
            >
              {features.map((f, i) => {
                const active = panelIdx === i;
                return (
                  <div key={f.num} className="wp-sticky-panel">
                    <p className="wp-sticky-lbl">Fonctionnalité {f.num} / 0{features.length}</p>
                    <h2 className="wp-sticky-title" style={{
                      opacity: active ? 1 : 0.15,
                      transform: active ? "none" : "translateX(-16px)",
                      transition: "opacity .5s, transform .5s cubic-bezier(.22,1,.36,1)",
                    }}>{f.title}</h2>
                    <p className="wp-sticky-desc" style={{
                      opacity: active ? 1 : 0,
                      transform: active ? "none" : "translateY(12px)",
                      transition: "opacity .45s .1s, transform .45s .1s cubic-bezier(.22,1,.36,1)",
                    }}>{f.desc}</p>
                    <span className="wp-sticky-phantom">{f.num}</span>
                  </div>
                );
              })}
            </div>
            <div className="wp-sticky-progress" style={{ width: `${stickyProgress * 100}%` }} />
            <div className="wp-sticky-dots">
              {features.map((_, i) => (
                <div key={i} className={`wp-sticky-dot${panelIdx === i ? " on" : ""}`} />
              ))}
            </div>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="wp-section">
          <Reveal>
            <p className="wp-eyebrow">Comment ça marche</p>
            <h2 className="wp-section-title">
              <WordReveal>Simple.</WordReveal><br />
              <WordReveal delay={0.15}><em>Efficace.</em></WordReveal>
            </h2>
          </Reveal>
          <div className="wp-tl" ref={timelineRef}>
            <div className="wp-tl-line">
              <div className="wp-tl-fill" style={{ height: `${Math.min(tlProgress * 1.5, 1) * 100}%` }} />
            </div>
            {steps.map((s, i) => {
              const lit = tlProgress * 4 > i + 0.3;
              return (
                <Reveal key={s.step} delay={i * 0.1}>
                  <div className="wp-tl-item">
                    <div className="wp-tl-dot-col">
                      <div className={`wp-tl-dot${lit ? " lit" : ""}`} />
                      <span className="wp-tl-step">{s.step}</span>
                    </div>
                    <div style={{ paddingTop: 2 }}>
                      <p className="wp-tl-title">{s.title}</p>
                      <p className="wp-tl-desc">{s.desc}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>

        {/* TESTIMONIALS */}
        <div className="wp-section" style={{ paddingTop: 0 }}>
          <Reveal>
            <p className="wp-eyebrow">Ils ont trouvé leur job</p>
            <h2 className="wp-section-title">
              <WordReveal>Ce qu'ils en disent</WordReveal>
            </h2>
          </Reveal>
          <div className="wp-testi-grid">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.09} from="bottom">
                <TiltCard>
                  <div className="wp-testi"
                    onMouseEnter={() => setCursorHover(true)}
                    onMouseLeave={() => setCursorHover(false)}
                  >
                    <div className="wp-testi-stars">
                      {[1,2,3,4,5].map(s => <span key={s} className="wp-testi-star">★</span>)}
                    </div>
                    <p className="wp-testi-text">"{t.text}"</p>
                    <p className="wp-testi-name">{t.name}</p>
                    <p className="wp-testi-role">{t.role}</p>
                    <div className="wp-testi-quote">"</div>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="wp-cta">
          <div className="wp-cta-inner">
            <Reveal from="left">
              <h2 className="wp-cta-title">
                Prêt à<br />décrocher<br />votre <em>job ?</em>
              </h2>
            </Reveal>
            <Reveal delay={0.15} from="right">
              <div className="wp-cta-right">
                <p className="wp-cta-sub">Rejoignez des milliers de candidats qui ont automatisé leur recherche d'emploi.</p>
                <Link to="/register" className="wp-btn-white"
                  onMouseEnter={() => setCursorHover(true)}
                  onMouseLeave={() => setCursorHover(false)}
                >Commencer maintenant →</Link>
                <Link to="/login" className="wp-cta-link"
                  onMouseEnter={() => setCursorHover(true)}
                  onMouseLeave={() => setCursorHover(false)}
                >Déjà un compte ? Se connecter →</Link>
              </div>
            </Reveal>
          </div>
          <div className="wp-cta-wm">YOURDREAMJOB</div>
        </div>

        {/* FOOTER */}
        <footer className="wp-footer">
          <span className="wp-footer-logo">YourDreamJob</span>
          <span className="wp-footer-copy">© 2025 · Tous droits réservés</span>
          <div className="wp-footer-links">
            {["Confidentialité", "Conditions", "Contact"].map(l => (
              <a key={l} href="#" className="wp-footer-link">{l}</a>
            ))}
          </div>
        </footer>

      </div>
    </>
  );
};

export default WelcomePage;