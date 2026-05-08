import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronRight, Building2, User } from "lucide-react";
import vite from "../../../public/vite.svg";
import logo from "../../assets/logowh.svg";
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [domainValid, setDomainValid] = useState(null);
  const debounceTimer = useRef(null);

  const navigate = useNavigate();

  // Liste blanche des domaines d'email connus (vous pouvez l'enrichir)
  const knownDomains = [
    // Internationaux
    "gmail.com", "yahoo.com", "yahoo.fr", "outlook.com", "hotmail.com",
    "live.com", "msn.com", "aol.com", "protonmail.com", "proton.me",
    "icloud.com", "me.com", "mac.com", "yandex.com", "yandex.ru",
    "mail.ru", "gmx.com", "gmx.fr", "tutanota.com", "tutanota.de",
    "posteo.net", "mailbox.org", "zoho.com", "fastmail.com",
    // Français
    "laposte.net", "orange.fr", "sfr.fr", "free.fr", "bbox.fr",
    "wanadoo.fr", "aliceadsl.fr", "numericable.fr", "bouygues.fr",
    "cegetel.net", "dartybox.com", "club-internet.fr", "voila.fr",
    "caramail.com", "ifrance.com", "hotmail.fr", "live.fr", "outlook.fr",
    // Allemands
    "gmx.net", "web.de", "t-online.de",
    // Italiens
    "libero.it", "virgilio.it", "tin.it", "tele2.it", "vodafone.it", "tiscali.it",
    // Polonais
    "wp.pl", "o2.pl", "interia.pl", "onet.pl",
    // Tchèques
    "seznam.cz", "atlas.cz", "centrum.cz", "email.cz", "post.cz",
    // Autres
    "chello.at", "aon.at", "gmx.at", "mail.com", "inbox.com"
  ];

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Vérification DNS : soit domaine en liste blanche, soit MX existant
  const checkDomainExists = useCallback(async (email) => {
    if (!email || !email.includes('@')) {
      setDomainValid(null);
      return false;
    }
    const domain = email.split('@')[1].toLowerCase();

    // Liste blanche
    if (knownDomains.includes(domain)) {
      setDomainValid(true);
      return true;
    }

    // Vérification MX
    try {
      setIsCheckingDomain(true);
      const response = await fetch(`https://dns.google/resolve?name=${domain}&type=MX`);
      if (!response.ok) throw new Error('DNS API error');
      const data = await response.json();
      const hasMx = data.Answer && data.Answer.some(record => record.type === 15);
      if (!hasMx) {
        setDomainValid(false);
        return false;
      }
      setDomainValid(true);
      return true;
    } catch (error) {
      console.error("DNS check error:", error);
      setDomainValid(false);
      return false;
    } finally {
      setIsCheckingDomain(false);
    }
  }, [knownDomains]);

  // --- Validations de format ---
  const validateEmailFormat = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validateAlgerianPhone = (phone) => {
    if (!phone) return true;
    const phoneRegex = /^(0[567]\d{8})|(\+213[567]\d{8})$/;
    return phoneRegex.test(phone);
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_.]{3,30}$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password) => {
    return password.length >= 8 && password.length <= 128;
  };

  const validateName = (name) => {
    return name === "" || /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/.test(name);
  };

  const validateBirthDate = (dateStr) => {
    if (!dateStr) return true;
    const today = new Date();
    const birth = new Date(dateStr);
    if (isNaN(birth.getTime())) return false;
    if (birth > today) return false;
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 16;
  };

  // Restriction des saisies + messages d'erreur temps réel
  const handleInputRestriction = (e, fieldType) => {
    let value = e.target.value;
    let error = "";

    switch (fieldType) {
      case 'username':
        value = value.replace(/[^a-zA-Z0-9_.]/g, '');
        if (value.length > 30) value = value.slice(0, 30);
        if (value && !validateUsername(value)) {
          error = "3-30 caractères : lettres, chiffres, _ ou .";
        }
        break;
      case 'email':
        value = value.toLowerCase();
        if (value.length > 254) value = value.slice(0, 254);
        if (!value) {
          error = "";
          setDomainValid(null);
        } else if (!validateEmailFormat(value)) {
          error = "Format email invalide (ex: nom@domaine.com)";
          setDomainValid(null);
        } else {
          error = "";
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(async () => {
            const exists = await checkDomainExists(value);
            if (exists === false) {
              setFieldErrors(prev => ({ ...prev, email: "Domaine d'email non reconnu ou ne recevant pas de courrier." }));
            } else if (exists === true) {
              setFieldErrors(prev => ({ ...prev, email: "" }));
            }
          }, 800);
        }
        break;
      case 'telephone':
        value = value.replace(/[^0-9+]/g, '');
        if (value.length > 13) value = value.slice(0, 13);
        if (value && !validateAlgerianPhone(value)) {
          error = "Format: 05XXXXXXXX, 06XXXXXXXX, 07XXXXXXXX ou +213XXXXXXXXX";
        }
        break;
      case 'nom':
      case 'prenom':
      case 'nomEntreprise':
      case 'ville':
        value = value.replace(/[^a-zA-ZÀ-ÿ\s\-']/g, '');
        if (value.length > 50) value = value.slice(0, 50);
        if (value && !validateName(value) && fieldType !== 'nomEntreprise') {
          error = "2-50 lettres, espaces, tirets ou apostrophes";
        }
        break;
      case 'secteur':
        value = value.replace(/[^a-zA-Z0-9À-ÿ\s\-&]/g, '');
        if (value.length > 100) value = value.slice(0, 100);
        break;
      case 'pays':
        value = value.replace(/[^a-zA-ZÀ-ÿ\s\-]/g, '');
        if (value.length > 50) value = value.slice(0, 50);
        break;
      case 'password':
      case 'password_confirm':
        if (value.length > 128) value = value.slice(0, 128);
        break;
      case 'dateNaissance':
        if (value && !validateBirthDate(value)) {
          error = "Date invalide : vous devez avoir au moins 16 ans.";
        }
        break;
      default:
        break;
    }

    setFormData({ ...formData, [e.target.name]: value });
    setFieldErrors(prev => ({ ...prev, [e.target.name]: error }));
  };

  const handleChange = (e) => {
    handleInputRestriction(e, e.target.name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isCheckingDomain) {
      toast.error("Vérification de l'email en cours, veuillez patienter.");
      return;
    }

    if (!validateUsername(formData.username)) {
      toast.error("Nom d'utilisateur invalide : 3-30 caractères (lettres, chiffres, _, .)");
      return;
    }
    if (!validateEmailFormat(formData.email)) {
      toast.error("Format d'email invalide");
      return;
    }
    // Vérification DNS finale
    if (domainValid === null && formData.email) {
      const exists = await checkDomainExists(formData.email);
      if (!exists) {
        toast.error("Domaine d'email non reconnu ou ne recevant pas de courrier.");
        return;
      }
    } else if (domainValid === false) {
      toast.error("Domaine d'email non reconnu ou ne recevant pas de courrier.");
      return;
    }

    if (formData.telephone && !validateAlgerianPhone(formData.telephone)) {
      toast.error("Numéro de téléphone algérien invalide");
      return;
    }
    if (formData.password !== formData.password_confirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!validatePassword(formData.password)) {
      toast.error("Le mot de passe doit contenir entre 8 et 128 caractères.");
      return;
    }
    if (formData.type === "candidat") {
      if (formData.prenom && !validateName(formData.prenom)) {
        toast.error("Prénom invalide (2-50 lettres, espaces, tirets, apostrophes)");
        return;
      }
      if (formData.nom && !validateName(formData.nom)) {
        toast.error("Nom invalide (2-50 lettres, espaces, tirets, apostrophes)");
        return;
      }
      if (formData.dateNaissance && !validateBirthDate(formData.dateNaissance)) {
        toast.error("Date de naissance invalide : vous devez avoir au moins 16 ans.");
        return;
      }
    }
    if (formData.type === "entreprise" && !formData.nomEntreprise.trim()) {
      toast.error("Le nom de l'entreprise est obligatoire.");
      return;
    }

    setIsLoading(true);
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

    .sg-panel-footer {
      position: relative; z-index: 1;
      font-size: .72rem;
      color: rgba(255,255,255,.2);
      letter-spacing: .04em;
    }

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

    .sg-input-error {
      border-color: #e74c3c;
    }
    .sg-input-error:focus {
      border-color: #e74c3c;
      box-shadow: 0 0 0 3px rgba(231,76,60,.1);
    }
    .sg-input-valid {
      border-color: #2ecc71;
    }

    .sg-error-msg {
      font-size: .7rem;
      color: #e74c3c;
      margin-top: 4px;
      margin-left: 12px;
    }

    .sg-domain-status {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }

    .sg-divider {
      height: 1px;
      background: #ebebeb;
      margin: 4px 0;
    }

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
  const getInputClass = (fieldName) => {
    let cls = inputClass;
    if (fieldErrors[fieldName]) cls += " sg-input-error";
    else if (fieldName === "email" && domainValid === true && formData.email) cls += " sg-input-valid";
    return cls;
  };

  const candidatFields = (
    <>
      <div className="sg-row sg-field">
        <input name="prenom" placeholder="Prénom" value={formData.prenom}
          onChange={handleChange} className={getInputClass("prenom")} />
        <input name="nom" placeholder="Nom" value={formData.nom}
          onChange={handleChange} className={getInputClass("nom")} />
      </div>
      <div className="sg-field">
        <input name="username" placeholder="Nom d'utilisateur *" value={formData.username}
          onChange={handleChange} required className={getInputClass("username")} />
        {fieldErrors.username && <div className="sg-error-msg">{fieldErrors.username}</div>}
      </div>
      <div className="sg-field">
        <input name="email" type="email" placeholder="Email *" value={formData.email}
          onChange={handleChange} required className={getInputClass("email")} />
        {isCheckingDomain && <span className="sg-domain-status">🔍</span>}
        {fieldErrors.email && <div className="sg-error-msg">{fieldErrors.email}</div>}
        {domainValid === true && formData.email && !fieldErrors.email && <div className="sg-error-msg" style={{ color: "#2ecc71" }}>✓ Domaine valide</div>}
      </div>
      <div className="sg-field">
        <input name="telephone" placeholder="Téléphone (05/06/07XXXXXXXX)" value={formData.telephone}
          onChange={handleChange} className={getInputClass("telephone")} />
        {fieldErrors.telephone && <div className="sg-error-msg">{fieldErrors.telephone}</div>}
      </div>
      <div className="sg-field" style={{ position: "relative" }}>
        <input name="dateNaissance" type="date" value={formData.dateNaissance}
          onChange={handleChange} className={inputClass} style={{ colorScheme: "light" }} />
        {fieldErrors.dateNaissance && <div className="sg-error-msg">{fieldErrors.dateNaissance}</div>}
      </div>
    </>
  );

  const entrepriseFields = (
    <>
      <div className="sg-field">
        <input name="nomEntreprise" placeholder="Nom de l'entreprise *" value={formData.nomEntreprise}
          onChange={handleChange} required className={getInputClass("nomEntreprise")} />
      </div>
      <div className="sg-row sg-field">
        <input name="secteur" placeholder="Secteur" value={formData.secteur}
          onChange={handleChange} className={inputClass} />
        <input name="ville" placeholder="Ville" value={formData.ville}
          onChange={handleChange} className={getInputClass("ville")} />
      </div>
      <div className="sg-field">
        <input name="pays" placeholder="Pays" value={formData.pays}
          onChange={handleChange} className={inputClass} />
      </div>
      <div className="sg-field">
        <input name="username" placeholder="Nom d'utilisateur *" value={formData.username}
          onChange={handleChange} required className={getInputClass("username")} />
        {fieldErrors.username && <div className="sg-error-msg">{fieldErrors.username}</div>}
      </div>
      <div className="sg-field">
        <input name="email" type="email" placeholder="Email *" value={formData.email}
          onChange={handleChange} required className={getInputClass("email")} />
        {isCheckingDomain && <span className="sg-domain-status">🔍</span>}
        {fieldErrors.email && <div className="sg-error-msg">{fieldErrors.email}</div>}
        {domainValid === true && formData.email && !fieldErrors.email && <div className="sg-error-msg" style={{ color: "#2ecc71" }}>✓ Domaine valide</div>}
      </div>
      <div className="sg-field">
        <input name="telephone" placeholder="Téléphone (05/06/07XXXXXXXX)" value={formData.telephone}
          onChange={handleChange} className={getInputClass("telephone")} />
        {fieldErrors.telephone && <div className="sg-error-msg">{fieldErrors.telephone}</div>}
      </div>
    </>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="sg-root">
        <div className="sg-panel">
          <div className="sg-panel-grid" />
          <div className="sg-panel-circle sg-circle-1" />
          <div className="sg-panel-circle sg-circle-2" />
          <div className="sg-panel-circle sg-circle-3" />
          <div className="sg-panel-logo">
            <div className="sg-logo-icon">
              <img src={vite} alt="logo" style={{ width: 20, height: 20 }} />
            </div>
            <img src={logo} alt="AutoCandidature" style={{ height: 24 }} />
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

        <div className="sg-dots" />

        <div className="sg-form-side">
          <div className={`sg-form-wrap ${mounted ? "visible" : ""}`}>
            <div className="sg-form-header">
              <p className="sg-form-eyebrow">Inscription</p>
              <h2 className="sg-form-title">Créer un compte</h2>
              <p className="sg-form-sub">
                Rejoignez des milliers de candidats qui automatisent leur recherche d'emploi.
              </p>
            </div>

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