import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Briefcase, UserPlus, ChevronRight, Building2, User } from "lucide-react";
import { toast } from "sonner";
import api from "../lib/api";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    type: "candidat",
    nom: "",
    prenom: "",
    telephone: "",
    nomEntreprise: "",
    secteur: "",
    ville: "",
    pays: "Algerie",
    dateNaissance: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.password_confirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.");
      setIsLoading(false);
      return;
    }
    if (formData.type === "entreprise" && !formData.nomEntreprise.trim()) {
      toast.error("Le nom de l'entreprise est obligatoire.");
      setIsLoading(false);
      return;
    }

    try {
      const userPayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password2: formData.password_confirm,
        type: formData.type,
        nom: formData.nom || "",
        prenom: formData.type === "candidat" ? formData.prenom || "" : "",
        telephone: formData.telephone || "",
      };
      if (formData.type === "candidat" && formData.dateNaissance)
        userPayload.dateNaissance = formData.dateNaissance;

      await api.post("/api/auth/register/", userPayload);
      toast.success("Inscription réussie ! Vérifiez votre email pour activer votre compte.");
      navigate("/login");
    } catch (error) {
      const d = error.response?.data;
      if (d?.email) toast.error(d.email[0]);
      else if (d?.username) toast.error(d.username[0]);
      else if (d?.password) toast.error(d.password[0]);
      else if (d?.dateNaissance) toast.error("Format de date invalide. Utilisez AAAA-MM-JJ");
      else toast.error("Erreur lors de l'inscription.");
    } finally {
      setIsLoading(false);
    }
  };

  /* ── styles ── */
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .sg-root {
      min-height: 100vh;
      background: #f8f8f6;
      font-family: 'Outfit', sans-serif;
      display: flex;
      position: relative;
      overflow: hidden;
    }

    /* left decorative panel */
    .sg-panel {
      width: 420px;
      min-height: 100vh;
      background: #0f0f0f;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 52px 48px;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }
    @media(max-width:900px){ .sg-panel{ display:none; } }

    .sg-panel-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
      background-size: 36px 36px;
      pointer-events: none;
    }
    .sg-panel-circle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }
    .sg-circle-1 {
      width: 320px; height: 320px;
      top: -80px; right: -80px;
      border: 1px solid rgba(255,255,255,.08);
    }
    .sg-circle-2 {
      width: 200px; height: 200px;
      bottom: 80px; left: -60px;
      border: 1px solid rgba(255,255,255,.06);
    }
    .sg-circle-3 {
      width: 100px; height: 100px;
      bottom: 180px; left: 30px;
      border: 1px solid rgba(255,255,255,.1);
    }

    @keyframes floatY {
      0%,100%{ transform: translateY(0); }
      50%{ transform: translateY(-14px); }
    }
    @keyframes rotateCard {
      0%,100%{ transform: perspective(900px) rotateY(-1.5deg) rotateX(1deg); }
      50%{ transform: perspective(900px) rotateY(1.5deg) rotateX(-1deg); }
    }
    @keyframes fadeUp {
      from{ opacity:0; transform:translateY(20px); }
      to{ opacity:1; transform:translateY(0); }
    }
    @keyframes shimmer {
      0%{ background-position:-400px 0; }
      100%{ background-position:400px 0; }
    }
    @keyframes spin {
      to{ transform: rotate(360deg); }
    }
    @keyframes slideRight {
      from{ opacity:0; transform:translateX(-10px); }
      to{ opacity:1; transform:translateX(0); }
    }

    .sg-panel-logo {
      display: flex; align-items: center; gap: 12px;
      position: relative; z-index: 1;
    }
    .sg-logo-icon {
      width: 40px; height: 40px;
      background: #fff;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .sg-logo-name {
      font-family: 'Playfair Display', serif;
      font-weight: 600;
      font-size: 1.05rem;
      color: #fff;
      letter-spacing: .01em;
    }

    .sg-panel-body { position: relative; z-index: 1; }

    .sg-panel-tagline {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.18;
      margin-bottom: 20px;
    }
    .sg-panel-tagline em {
      font-style: normal;
      color: rgba(255,255,255,.4);
    }

    .sg-panel-desc {
      font-size: .88rem;
      color: rgba(255,255,255,.4);
      line-height: 1.75;
      max-width: 300px;
    }

    .sg-stats-card {
      margin-top: 40px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px;
      padding: 22px 24px;
      animation: rotateCard 10s ease-in-out infinite;
    }
    .sg-stats-label {
      font-size: .65rem;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: rgba(255,255,255,.3);
      margin-bottom: 16px;
      font-weight: 500;
    }
    .sg-stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }
    .sg-stat-row:last-child { border-bottom: none; }
    .sg-stat-name { font-size: .82rem; color: rgba(255,255,255,.45); }
    .sg-stat-val { font-size: .82rem; color: #fff; font-weight: 600; }

    .sg-panel-footer {
      position: relative; z-index: 1;
      font-size: .72rem;
      color: rgba(255,255,255,.2);
      letter-spacing: .04em;
    }

    /* right form side */
    .sg-form-side {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 32px;
      position: relative;
    }

    .sg-form-wrap {
      width: 100%;
      max-width: 460px;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity .6s ease, transform .6s ease;
    }
    .sg-form-wrap.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .sg-form-header {
      margin-bottom: 32px;
    }
    .sg-form-eyebrow {
      font-size: .68rem;
      letter-spacing: .28em;
      text-transform: uppercase;
      color: #aaa;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .sg-form-title {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: #0f0f0f;
      line-height: 1.1;
    }
    .sg-form-sub {
      margin-top: 8px;
      font-size: .85rem;
      color: #888;
      line-height: 1.6;
    }

    /* toggle */
    .sg-toggle {
      display: flex;
      background: #efefed;
      border-radius: 12px;
      padding: 4px;
      gap: 4px;
      margin-bottom: 24px;
    }
    .sg-tab {
      flex: 1;
      padding: 10px 0;
      border: none;
      border-radius: 9px;
      cursor: pointer;
      font-family: 'Outfit', sans-serif;
      font-size: .82rem;
      font-weight: 500;
      display: flex; align-items: center; justify-content: center; gap: 7px;
      transition: all .25s cubic-bezier(.22,1,.36,1);
    }
    .sg-tab-active {
      background: #0f0f0f;
      color: #fff;
      box-shadow: 0 2px 12px rgba(0,0,0,.25);
    }
    .sg-tab-inactive {
      background: transparent;
      color: #999;
    }
    .sg-tab-inactive:hover { color: #333; }

    /* fields */
    .sg-fields { display: flex; flex-direction: column; gap: 12px; }
    .sg-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

    .sg-field {
      position: relative;
      animation: slideRight .3s cubic-bezier(.22,1,.36,1) both;
    }

    .sg-input {
      width: 100%;
      padding: 13px 16px;
      background: #fff;
      border: 1.5px solid #e8e8e6;
      border-radius: 11px;
      font-family: 'Outfit', sans-serif;
      font-size: .85rem;
      color: #0f0f0f;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
      color-scheme: light;
    }
    .sg-input::placeholder { color: #bbb; }
    .sg-input:focus {
      border-color: #0f0f0f;
      box-shadow: 0 0 0 3px rgba(15,15,15,.08);
    }
    .sg-input:hover:not(:focus) { border-color: #ccc; }

    .sg-dob-ph {
      position: absolute;
      left: 16px; top: 50%;
      transform: translateY(-50%);
      color: #bbb;
      font-size: .85rem;
      pointer-events: none;
      font-family: 'Outfit', sans-serif;
    }

    .sg-divider {
      height: 1px;
      background: #ebebeb;
      margin: 4px 0;
    }

    /* submit button */
    .sg-btn {
      width: 100%;
      padding: 14px;
      background: #0f0f0f;
      color: #fff;
      border: none;
      border-radius: 12px;
      font-family: 'Playfair Display', serif;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: .02em;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: transform .2s, box-shadow .2s, background .2s;
      display: flex; align-items: center; justify-content: center; gap: 10px;
    }
    .sg-btn::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
      background-size: 400px 100%;
      animation: shimmer 2.5s infinite;
    }
    .sg-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 14px 36px rgba(15,15,15,.22);
    }
    .sg-btn:active:not(:disabled) { transform: translateY(0); }
    .sg-btn:disabled { opacity: .5; cursor: not-allowed; }

    .sg-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }

    .sg-foot {
      margin-top: 22px;
      text-align: center;
      font-size: .82rem;
      color: #aaa;
    }
    .sg-foot a {
      color: #0f0f0f;
      font-weight: 600;
      text-decoration: none;
    }
    .sg-foot a:hover { text-decoration: underline; }

    /* decorative dots */
    .sg-dots {
      position: absolute;
      right: 0; top: 0; bottom: 0;
      width: 1px;
      background: linear-gradient(to bottom, transparent, #e0e0e0 30%, #e0e0e0 70%, transparent);
      display: none;
    }
    @media(min-width:900px){ .sg-dots{ display:block; } }
  `;

  const inputClass = "sg-input";

  const candidatFields = (
    <>
      <div className="sg-row sg-field">
        <input name="prenom" placeholder="Prénom" value={formData.prenom}
          onChange={handleChange} className={inputClass} />
        <input name="nom" placeholder="Nom" value={formData.nom}
          onChange={handleChange} className={inputClass} />
      </div>
      <div className="sg-field">
        <input name="username" placeholder="Nom d'utilisateur *" value={formData.username}
          onChange={handleChange} required className={inputClass} />
      </div>
      <div className="sg-field">
        <input name="email" type="email" placeholder="Email *" value={formData.email}
          onChange={handleChange} required className={inputClass} />
      </div>
      <div className="sg-field">
        <input name="telephone" placeholder="Téléphone" value={formData.telephone}
          onChange={handleChange} className={inputClass} />
      </div>
      <div className="sg-field" style={{ position: "relative" }}>
        <input name="dateNaissance" type="date" value={formData.dateNaissance}
          onChange={handleChange} className={inputClass} style={{ colorScheme: "light" }} />
        {!formData.dateNaissance && (
          <span className="sg-dob-ph"></span>
        )}
      </div>
    </>
  );

  const entrepriseFields = (
    <>
      <div className="sg-field">
        <input name="nomEntreprise" placeholder="Nom de l'entreprise *" value={formData.nomEntreprise}
          onChange={handleChange} required className={inputClass} />
      </div>
      <div className="sg-row sg-field">
        <input name="secteur" placeholder="Secteur" value={formData.secteur}
          onChange={handleChange} className={inputClass} />
        <input name="ville" placeholder="Ville" value={formData.ville}
          onChange={handleChange} className={inputClass} />
      </div>
      <div className="sg-field">
        <input name="pays" placeholder="Pays" value={formData.pays}
          onChange={handleChange} className={inputClass} />
      </div>
      <div className="sg-field">
        <input name="username" placeholder="Nom d'utilisateur *" value={formData.username}
          onChange={handleChange} required className={inputClass} />
      </div>
      <div className="sg-field">
        <input name="email" type="email" placeholder="Email *" value={formData.email}
          onChange={handleChange} required className={inputClass} />
      </div>
      <div className="sg-field">
        <input name="telephone" placeholder="Téléphone" value={formData.telephone}
          onChange={handleChange} className={inputClass} />
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="sg-root">

        {/* ── Left dark panel ── */}
        <div className="sg-panel">
          <div className="sg-panel-grid" />
          <div className="sg-panel-circle sg-circle-1" />
          <div className="sg-panel-circle sg-circle-2" />
          <div className="sg-panel-circle sg-circle-3" />

          <div className="sg-panel-logo">
            <div className="sg-logo-icon">
              <Briefcase size={20} color="#0f0f0f" />
            </div>
            <span className="sg-logo-name">AutoCandidature</span>
          </div>

          <div className="sg-panel-body">
            <h1 className="sg-panel-tagline">
              Votre carrière,<br />
              <em>automatisée.</em>
            </h1>
            <p className="sg-panel-desc">
              Postulez intelligemment, suivez vos candidatures en temps réel,
              et décrochez l'emploi qui vous correspond.
            </p>
            
          </div>

          <div className="sg-panel-footer">© 2025 AutoCandidature</div>
        </div>

        {/* ── Separator ── */}
        <div className="sg-dots" />

        {/* ── Right form side ── */}
        <div className="sg-form-side">
          <div className={`sg-form-wrap ${mounted ? "visible" : ""}`}>

            <div className="sg-form-header">
              <p className="sg-form-eyebrow">Inscription</p>
              <h2 className="sg-form-title">Créer un compte</h2>
              <p className="sg-form-sub">
                Rejoignez des milliers de candidats qui automatisent leur recherche d'emploi.
              </p>
            </div>

            {/* Type toggle */}
            <div className="sg-toggle">
              {["candidat", "entreprise"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: t })}
                  className={`sg-tab ${formData.type === t ? "sg-tab-active" : "sg-tab-inactive"}`}
                >
                  {t === "candidat"
                    ? <><User size={14} /> Candidat</>
                    : <><Building2 size={14} /> Entreprise</>}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="sg-fields">
                {formData.type === "candidat" ? candidatFields : entrepriseFields}

                {/* Password row — common */}
                <div className="sg-row sg-field">
                  <input name="password" type="password" placeholder="Mot de passe *"
                    value={formData.password} onChange={handleChange} required className={inputClass} />
                  <input name="password_confirm" type="password" placeholder="Confirmer *"
                    value={formData.password_confirm} onChange={handleChange} required className={inputClass} />
                </div>

                <div className="sg-divider" />

                <button type="submit" disabled={isLoading} className="sg-btn">
                  {isLoading ? (
                    <>
                      <span className="sg-spinner" />
                      Inscription en cours…
                    </>
                  ) : (
                    <>
                      Créer mon compte
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="sg-foot">
              Déjà un compte ?{" "}
              <Link to="/login">Se connecter →</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;