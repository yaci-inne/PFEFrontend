import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LogIn } from "lucide-react";
import vite from "../../public/vite.svg";
import logo from "../assets/logowh.svg";
import { toast } from "sonner";
import api from "../lib/api";
import { getApiError } from "../lib/apiError";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
  }, []);

  const handleLogin = () => {
    setIsLoading(true);
    api
      .post("/api/accessToken/", { username, password }, { showErrorToast: false, showSuccessToast: false })
      .then((res) => {
        localStorage.setItem("accessToken", res.data.access);
        localStorage.setItem("refreshToken", res.data.refresh);
        toast.success("Connexion réussie.");
        navigate("/");
      })
      .catch((err) => {
        const apiError = getApiError(err, "Erreur de connexion.");
        toast.error(apiError.message, {
          description: apiError.details[0] || undefined,
        });
      })
      .finally(() => setIsLoading(false));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    .lg-root {
      min-height: 100vh;
      background: #f8f8f6;
      font-family: 'Outfit', sans-serif;
      display: flex;
      position: relative;
      overflow: hidden;
    }

    /* ── Left dark panel ── */
    .lg-panel {
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
    @media(max-width:900px){ .lg-panel{ display:none; } }

    .lg-panel-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px);
      background-size: 36px 36px;
      pointer-events: none;
    }
    .lg-panel-circle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }
    .lg-circle-1 {
      width: 320px; height: 320px;
      top: -80px; right: -80px;
      border: 1px solid rgba(255,255,255,.08);
    }
    .lg-circle-2 {
      width: 200px; height: 200px;
      bottom: 80px; left: -60px;
      border: 1px solid rgba(255,255,255,.06);
    }
    .lg-circle-3 {
      width: 100px; height: 100px;
      bottom: 180px; left: 30px;
      border: 1px solid rgba(255,255,255,.1);
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
    @keyframes floatA {
      0%,100%{ transform: translateY(0); }
      50%{ transform: translateY(-12px); }
    }

    .lg-panel-logo {
      display: flex; align-items: center; gap: 12px;
      position: relative; z-index: 1;
    }
    .lg-logo-icon {
      width: 40px; height: 40px;
      background: #fff;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
    }
    .lg-logo-name {
      font-family: 'Playfair Display', serif;
      font-weight: 600;
      font-size: 1.05rem;
      color: #fff;
      letter-spacing: .01em;
    }

    .lg-panel-body { position: relative; z-index: 1; }

    .lg-panel-tagline {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: #fff;
      line-height: 1.18;
      margin-bottom: 20px;
    }
    .lg-panel-tagline em {
      font-style: normal;
      color: rgba(255,255,255,.4);
    }
    .lg-panel-desc {
      font-size: .88rem;
      color: rgba(255,255,255,.4);
      line-height: 1.75;
      max-width: 300px;
      margin-bottom: 36px;
    }

    .lg-features { display: flex; flex-direction: column; gap: 12px; }
    .lg-feature {
      display: flex; align-items: center; gap: 14px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 12px;
      padding: 14px 18px;
      animation: floatA 8s ease-in-out infinite;
    }
    .lg-feature:nth-child(2){ animation-delay: 1s; }
    .lg-feature:nth-child(3){ animation-delay: 2s; }
    .lg-feature-dot {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: #fff;
      opacity: .5;
      flex-shrink: 0;
    }
    .lg-feature-text {
      font-size: .82rem;
      color: rgba(255,255,255,.6);
      font-weight: 400;
    }

    .lg-stats-card {
      margin-top: 28px;
      background: rgba(255,255,255,.05);
      border: 1px solid rgba(255,255,255,.08);
      border-radius: 16px;
      padding: 22px 24px;
      animation: rotateCard 10s ease-in-out infinite;
    }
    .lg-stats-label {
      font-size: .65rem;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: rgba(255,255,255,.3);
      margin-bottom: 16px;
      font-weight: 500;
    }
    .lg-stat-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,.06);
    }
    .lg-stat-row:last-child { border-bottom: none; }
    .lg-stat-name { font-size: .82rem; color: rgba(255,255,255,.45); }
    .lg-stat-val { font-size: .82rem; color: #fff; font-weight: 600; }

    .lg-panel-footer {
      position: relative; z-index: 1;
      font-size: .72rem;
      color: rgba(255,255,255,.2);
      letter-spacing: .04em;
    }

    /* ── Right form side ── */
    .lg-form-side {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 32px;
      position: relative;
    }

    .lg-form-wrap {
      width: 100%;
      max-width: 400px;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity .6s ease, transform .6s ease;
    }
    .lg-form-wrap.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .lg-form-header { margin-bottom: 32px; }
    .lg-form-eyebrow {
      font-size: .68rem;
      letter-spacing: .28em;
      text-transform: uppercase;
      color: #aaa;
      font-weight: 500;
      margin-bottom: 8px;
    }
    .lg-form-title {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      font-weight: 700;
      color: #0f0f0f;
      line-height: 1.1;
    }
    .lg-form-sub {
      margin-top: 8px;
      font-size: .85rem;
      color: #888;
      line-height: 1.6;
    }

    .lg-fields { display: flex; flex-direction: column; gap: 14px; }

    .lg-label {
      display: block;
      font-size: .78rem;
      font-weight: 500;
      color: #555;
      margin-bottom: 6px;
      letter-spacing: .02em;
    }

    .lg-input {
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
    }
    .lg-input::placeholder { color: #bbb; }
    .lg-input:focus {
      border-color: #0f0f0f;
      box-shadow: 0 0 0 3px rgba(15,15,15,.08);
    }
    .lg-input:hover:not(:focus) { border-color: #ccc; }

    .lg-pw-wrap { position: relative; }
    .lg-pw-toggle {
      position: absolute;
      right: 14px; top: 50%;
      transform: translateY(-50%);
      background: none; border: none;
      cursor: pointer;
      color: #bbb;
      display: flex; align-items: center;
      transition: color .2s;
      padding: 0;
    }
    .lg-pw-toggle:hover { color: #555; }

    .lg-forgot {
      text-align: right;
    }
    .lg-forgot a {
      font-size: .78rem;
      color: #999;
      text-decoration: none;
      transition: color .2s;
    }
    .lg-forgot a:hover { color: #0f0f0f; text-decoration: underline; }

    .lg-divider {
      height: 1px;
      background: #ebebeb;
      margin: 4px 0;
    }

    .lg-btn {
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
      transition: transform .2s, box-shadow .2s;
      display: flex; align-items: center; justify-content: center; gap: 10px;
    }
    .lg-btn::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
      background-size: 400px 100%;
      animation: shimmer 2.5s infinite;
    }
    .lg-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 14px 36px rgba(15,15,15,.22);
    }
    .lg-btn:active:not(:disabled) { transform: translateY(0); }
    .lg-btn:disabled { opacity: .5; cursor: not-allowed; }

    .lg-spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }

    .lg-foot {
      margin-top: 24px;
      text-align: center;
      font-size: .82rem;
      color: #aaa;
    }
    .lg-foot a {
      color: #0f0f0f;
      font-weight: 600;
      text-decoration: none;
    }
    .lg-foot a:hover { text-decoration: underline; }

    .lg-separator {
      position: absolute;
      right: 0; top: 0; bottom: 0;
      width: 1px;
      background: linear-gradient(to bottom, transparent, #e0e0e0 30%, #e0e0e0 70%, transparent);
      display: none;
    }
    @media(min-width:900px){ .lg-separator{ display:block; } }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="lg-root">

        {/* ── Left dark panel ── */}
        <div className="lg-panel">
          <div className="lg-panel-grid" />
          <div className="lg-panel-circle lg-circle-1" />
          <div className="lg-panel-circle lg-circle-2" />
          <div className="lg-panel-circle lg-circle-3" />

          <div className="lg-panel-logo">
            <div className="lg-logo-icon">
              <img src={vite} alt="logo" style={{ width: 20, height: 20 }} />
            </div>
            <img src={logo} alt="AutoCandidature" style={{ height: 24 }} />
          </div>

          <div className="lg-panel-body">
            <h1 className="lg-panel-tagline">
              Bienvenue,<br />
              <em>bon retour.</em>
            </h1>
            <p className="lg-panel-desc">
              Reprenez là où vous en étiez. Vos candidatures, vos relances et vos entretiens vous attendent.
            </p>

            <div className="lg-features">
              {[
                "Visibilité complète sur vos envois",
                "Suivi des statuts en temps réel",
                "Relances automatisées et ciblées",
              ].map((f) => (
                <div className="lg-feature" key={f}>
                  <span className="lg-feature-dot" />
                  <span className="lg-feature-text">{f}</span>
                </div>
              ))}
            </div>

            
          </div>

          <div className="lg-panel-footer">© 2025 AutoCandidature</div>
        </div>

        {/* Separator */}
        <div className="lg-separator" />

        {/* ── Right form side ── */}
        <div className="lg-form-side">
          <div className={`lg-form-wrap ${mounted ? "visible" : ""}`}>

            <div className="lg-form-header">
              <p className="lg-form-eyebrow">Connexion</p>
              <h2 className="lg-form-title">Se connecter</h2>
              <p className="lg-form-sub">
                Accédez à votre espace et reprenez votre recherche d'emploi.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="lg-fields">

                {/* Username */}
                <div>
                  <label className="lg-label">Nom d'utilisateur ou email</label>
                  <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="lg-input"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="lg-label">Mot de passe</label>
                  <div className="lg-pw-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="lg-input"
                      style={{ paddingRight: 44 }}
                    />
                    <button
                      type="button"
                      className="lg-pw-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Forgot */}
                <div className="lg-forgot">
                  <Link to="/forgot-password">Mot de passe oublié ?</Link>
                </div>

                <div className="lg-divider" />

                {/* Submit */}
                <button type="submit" disabled={isLoading} className="lg-btn">
                  {isLoading ? (
                    <>
                      <span className="lg-spinner" />
                      Connexion en cours…
                    </>
                  ) : (
                    <>
                      Se connecter
                      <LogIn size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="lg-foot">
              Pas encore de compte ?{" "}
              <Link to="/signup">S'inscrire →</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;