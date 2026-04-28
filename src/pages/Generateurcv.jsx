/**
 * GenerateurCV.jsx
 * 
 * Page candidat — Générateur de CV PDF professionnel
 * 
 * DÉPENDANCES À INSTALLER :
 *   npm install @react-pdf/renderer
 */

import { useState, useCallback, useRef } from "react";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import {
  User,
  Briefcase,
  GraduationCap,
  Code2,
  Globe,
  Plus,
  Trash2,
  Download,
  ChevronDown,
  ChevronUp,
  FileText,
  Award,
  Camera,
  X,
} from "lucide-react";
import AppShell from "../components/layout/AppShell";

// ─────────────────────────────────────────────
// 1. PDF STYLES (react-pdf uses pt, not px)
// ─────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1a1a1a",
    backgroundColor: "#ffffff",
    paddingTop: 0,
    paddingBottom: 0,
  },

  header: {
    backgroundColor: "#0f0f0f",
    paddingHorizontal: 40,
    paddingVertical: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flex: 1 },
  headerName: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 14,
  },
  headerContacts: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  headerContact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    color: "rgba(255,255,255,0.75)",
    fontSize: 8,
  },

  // ── Photo dans le header ──
  headerPhoto: {
    width: 72,
    height: 72,
    borderRadius: 36,
    border: "2pt solid rgba(255,255,255,0.25)",
    objectFit: "cover",
    marginLeft: 20,
    flexShrink: 0,
  },

  body: {
    flexDirection: "row",
    flex: 1,
    minHeight: 600,
  },
  leftCol: {
    width: "34%",
    backgroundColor: "#f5f5f3",
    paddingHorizontal: 22,
    paddingVertical: 26,
  },
  rightCol: {
    width: "66%",
    paddingHorizontal: 28,
    paddingVertical: 26,
    backgroundColor: "#ffffff",
  },

  sectionTitle: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#0f0f0f",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1.5,
    borderBottomColor: "#0f0f0f",
  },
  sectionTitleLight: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#555",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  sectionBlock: { marginBottom: 20 },

  summary: {
    fontSize: 8.5,
    lineHeight: 1.65,
    color: "#444",
  },

  item: { marginBottom: 14 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemTitle: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: "#0f0f0f", flex: 1 },
  itemDate: {
    fontSize: 7.5,
    color: "#888",
    backgroundColor: "#f0f0ee",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  itemSubtitle: { fontSize: 8, color: "#555", marginTop: 2, marginBottom: 5, fontFamily: "Helvetica-Oblique" },
  itemDesc: { fontSize: 8, lineHeight: 1.6, color: "#444" },
  bullet: { flexDirection: "row", marginBottom: 2.5 },
  bulletDot: { color: "#0f0f0f", marginRight: 6, fontSize: 8, fontFamily: "Helvetica-Bold" },
  bulletText: { flex: 1, fontSize: 8, lineHeight: 1.5, color: "#444" },

  skillGroup: { marginBottom: 12 },
  skillCat: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#333", marginBottom: 5 },
  skillPills: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  skillPill: {
    backgroundColor: "#e8e8e6",
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 7.5,
    color: "#0f0f0f",
  },

  langRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7,
  },
  langName: { fontSize: 8.5, color: "#222" },
  langLevel: {
    fontSize: 7,
    color: "#888",
    fontFamily: "Helvetica-Oblique",
  },
  langBar: {
    height: 3,
    backgroundColor: "#e0e0de",
    borderRadius: 2,
    marginTop: 3,
    marginBottom: 3,
  },
  langFill: { height: 3, backgroundColor: "#0f0f0f", borderRadius: 2 },

  certItem: { marginBottom: 8 },
  certName: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#0f0f0f" },
  certOrg: { fontSize: 7.5, color: "#888", marginTop: 1 },

  footer: {
    backgroundColor: "#0f0f0f",
    paddingHorizontal: 40,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: { color: "rgba(255,255,255,0.3)", fontSize: 7, letterSpacing: 0.5 },
});

const LANG_LEVELS = {
  "Natif": 1,
  "Courant (C1/C2)": 0.85,
  "Avancé (B2)": 0.7,
  "Intermédiaire (B1)": 0.55,
  "Débutant (A1/A2)": 0.3,
};

function CVDocument({ data }) {
  const {
    prenom, nom, titre, email, telephone, ville, pays, linkedin, github,
    resume,
    experiences,
    formations,
    competences,
    langues,
    certifications,
    photoBase64, // ← photo
  } = data;

  const fullName = `${prenom} ${nom}`.trim();

  return (
    <Document title={`CV – ${fullName}`} author={fullName}>
      <Page size="A4" style={S.page}>
        {/* ── HEADER avec photo en haut à gauche ── */}
        <View style={S.header}>
          {/* Photo ronde en haut à gauche */}
          {photoBase64 && (
            <Image
              src={photoBase64}
              style={S.headerPhoto}
            />
          )}

          <View style={[S.headerLeft, photoBase64 ? { marginLeft: 20 } : {}]}>
            <Text style={S.headerName}>{fullName || "Votre Nom"}</Text>
            <Text style={S.headerTitle}>{titre || "Titre du poste"}</Text>
            <View style={S.headerContacts}>
              {email && <Text style={S.headerContact}>{email}</Text>}
              {telephone && <Text style={S.headerContact}>· {telephone}</Text>}
              {ville && <Text style={S.headerContact}>· {ville}{pays ? `, ${pays}` : ""}</Text>}
              {linkedin && <Text style={S.headerContact}>· {linkedin}</Text>}
              {github && <Text style={S.headerContact}>· {github}</Text>}
            </View>
          </View>
        </View>

        <View style={S.body}>
          <View style={S.leftCol}>
            {resume && (
              <View style={S.sectionBlock}>
                <Text style={S.sectionTitleLight}>Profil</Text>
                <Text style={S.summary}>{resume}</Text>
              </View>
            )}

            {competences.length > 0 && (
              <View style={S.sectionBlock}>
                <Text style={S.sectionTitleLight}>Compétences</Text>
                {competences.map((grp, i) => (
                  <View key={i} style={S.skillGroup}>
                    {grp.categorie && <Text style={S.skillCat}>{grp.categorie}</Text>}
                    <View style={S.skillPills}>
                      {grp.items.filter(s => s.trim()).map((s, j) => (
                        <Text key={j} style={S.skillPill}>{s.trim()}</Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {langues.length > 0 && (
              <View style={S.sectionBlock}>
                <Text style={S.sectionTitleLight}>Langues</Text>
                {langues.map((l, i) => {
                  const ratio = LANG_LEVELS[l.niveau] ?? 0.5;
                  return (
                    <View key={i}>
                      <View style={S.langRow}>
                        <Text style={S.langName}>{l.nom}</Text>
                        <Text style={S.langLevel}>{l.niveau}</Text>
                      </View>
                      <View style={S.langBar}>
                        <View style={[S.langFill, { width: `${ratio * 100}%` }]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {certifications.length > 0 && (
              <View style={S.sectionBlock}>
                <Text style={S.sectionTitleLight}>Certifications</Text>
                {certifications.map((c, i) => (
                  <View key={i} style={S.certItem}>
                    <Text style={S.certName}>{c.nom}</Text>
                    {c.organisme && <Text style={S.certOrg}>{c.organisme}{c.annee ? ` · ${c.annee}` : ""}</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={S.rightCol}>
            {experiences.length > 0 && (
              <View style={S.sectionBlock}>
                <Text style={S.sectionTitle}>Expérience professionnelle</Text>
                {experiences.map((exp, i) => (
                  <View key={i} style={S.item}>
                    <View style={S.itemHeader}>
                      <Text style={S.itemTitle}>{exp.poste || "Poste"}</Text>
                      {(exp.debut || exp.fin) && (
                        <Text style={S.itemDate}>{exp.debut}{exp.fin ? ` – ${exp.fin}` : " – Présent"}</Text>
                      )}
                    </View>
                    <Text style={S.itemSubtitle}>{exp.entreprise}{exp.lieu ? ` · ${exp.lieu}` : ""}</Text>
                    {exp.description && exp.description.split("\n").filter(Boolean).map((line, j) => (
                      <View key={j} style={S.bullet}>
                        <Text style={S.bulletDot}>›</Text>
                        <Text style={S.bulletText}>{line.replace(/^[-•›]\s*/, "")}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {formations.length > 0 && (
              <View style={S.sectionBlock}>
                <Text style={S.sectionTitle}>Formation</Text>
                {formations.map((f, i) => (
                  <View key={i} style={S.item}>
                    <View style={S.itemHeader}>
                      <Text style={S.itemTitle}>{f.diplome || "Diplôme"}</Text>
                      {(f.debut || f.fin) && (
                        <Text style={S.itemDate}>{f.debut}{f.fin ? ` – ${f.fin}` : ""}</Text>
                      )}
                    </View>
                    <Text style={S.itemSubtitle}>{f.etablissement}{f.lieu ? ` · ${f.lieu}` : ""}</Text>
                    {f.mention && <Text style={S.itemDesc}>Mention : {f.mention}</Text>}
                    {f.description && <Text style={S.itemDesc}>{f.description}</Text>}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={S.footer} fixed>
          <Text style={S.footerText}>
            {fullName} — CV généré via AutoCandidature
          </Text>
          <Text style={S.footerText}>{new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}</Text>
        </View>
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────
// 3. FORM HELPERS
// ─────────────────────────────────────────────
const NIVEAUX_LANGUE = ["Natif", "Courant (C1/C2)", "Avancé (B2)", "Intermédiaire (B1)", "Débutant (A1/A2)"];

const defaultData = () => ({
  prenom: "",
  nom: "",
  titre: "",
  email: "",
  telephone: "",
  ville: "",
  pays: "Algérie",
  linkedin: "",
  github: "",
  resume: "",
  photoBase64: null, // ← photo
  experiences: [{ poste: "", entreprise: "", lieu: "", debut: "", fin: "", description: "" }],
  formations: [{ diplome: "", etablissement: "", lieu: "", debut: "", fin: "", mention: "", description: "" }],
  competences: [{ categorie: "Technique", items: [""] }],
  langues: [{ nom: "Arabe", niveau: "Natif" }],
  certifications: [{ nom: "", organisme: "", annee: "" }],
});

// ─────────────────────────────────────────────
// 4. REUSABLE UI COMPONENTS (Tailwind version)
// ─────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl mb-4 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 bg-none border-none cursor-pointer gap-2.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <Icon size={15} color="#fff" />
          </div>
          <span className="font-semibold text-sm text-gray-900">{title}</span>
        </div>
        {open ? <ChevronUp size={16} color="#999" /> : <ChevronDown size={16} color="#999" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, children, half }) {
  return (
    <div className={`${half ? "flex-1 min-w-[140px]" : "w-full"}`}>
      {label && (
        <label className="block text-[11px] font-semibold text-gray-400 tracking-wide uppercase mb-1.5 font-sans">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// 5. MAIN PAGE COMPONENT
// ─────────────────────────────────────────────
export default function GenerateurCV() {
  const [data, setData] = useState(defaultData());
  const [generating, setGenerating] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null); // URL preview locale
  const photoInputRef = useRef(null);

  const set = (field, value) => setData(p => ({ ...p, [field]: value }));

  const setArr = (key, index, field, value) =>
    setData(p => {
      const arr = [...p[key]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...p, [key]: arr };
    });

  const addArr = (key, template) =>
    setData(p => ({ ...p, [key]: [...p[key], { ...template }] }));

  const removeArr = (key, index) =>
    setData(p => ({ ...p, [key]: p[key].filter((_, i) => i !== index) }));

  const setSkillItem = (groupIdx, itemIdx, value) =>
    setData(p => {
      const competences = p.competences.map((g, gi) =>
        gi === groupIdx
          ? { ...g, items: g.items.map((it, ii) => ii === itemIdx ? value : it) }
          : g
      );
      return { ...p, competences };
    });

  const addSkillItem = (groupIdx) =>
    setData(p => ({
      ...p,
      competences: p.competences.map((g, gi) =>
        gi === groupIdx ? { ...g, items: [...g.items, ""] } : g
      ),
    }));

  const removeSkillItem = (groupIdx, itemIdx) =>
    setData(p => ({
      ...p,
      competences: p.competences.map((g, gi) =>
        gi === groupIdx ? { ...g, items: g.items.filter((_, ii) => ii !== itemIdx) } : g
      ),
    }));

  // ── Gestion de la photo ──────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification type
    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image (JPG, PNG, WEBP…)");
      return;
    }
    // Vérification taille (max 5 Mo)
    if (file.size > 5 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 5 Mo.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result; // data:image/jpeg;base64,...
      setPhotoPreview(base64);
      set("photoBase64", base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    set("photoBase64", null);
    if (photoInputRef.current) photoInputRef.current.value = "";
  };

  const handleDownload = useCallback(async () => {
    setGenerating(true);
    try {
      const blob = await pdf(<CVDocument data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CV_${data.prenom || "candidat"}_${data.nom || ""}.pdf`.replace(/\s+/g, "_");
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la génération du PDF. Vérifiez que tous les champs sont bien remplis.");
    } finally {
      setGenerating(false);
    }
  }, [data]);

  // Input styles réutilisables avec Tailwind
  const inputClasses = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-sans text-sm text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all";
  const textareaClasses = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-sans text-sm text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all resize-y min-h-[80px] leading-relaxed";
  const selectClasses = "w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-sans text-sm text-gray-900 outline-none focus:border-black focus:ring-2 focus:ring-black/10 transition-all cursor-pointer";
  const addButtonClasses = "inline-flex items-center gap-1.5 bg-none border border-dashed border-gray-300 rounded-lg px-3.5 py-1.5 text-gray-500 text-xs cursor-pointer font-sans hover:border-gray-400 hover:text-gray-700 transition-colors mt-2.5";
  const removeButtonClasses = "bg-none border-none cursor-pointer text-gray-300 p-1 flex items-center rounded-md hover:text-red-500 hover:bg-red-50 transition-colors";

  return (
    <AppShell
      title="Générateur de CV"
      subtitle="Créez un CV professionnel et téléchargez-le en PDF"
      actions={
        <div className="flex gap-2.5">
          <button
            onClick={() => { setData(defaultData()); setPhotoPreview(null); }}
            className="inline-flex items-center gap-1.5 bg-none text-gray-600 border border-gray-300 rounded-xl px-4 py-2 font-sans text-sm font-medium cursor-pointer hover:border-black hover:text-black transition-colors"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="inline-flex items-center gap-2 bg-black text-white border-none rounded-xl px-5 py-2 font-sans text-sm font-semibold cursor-pointer transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <div className="w-[15px] h-[15px] border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Download size={15} />
            )}
            {generating ? "Génération…" : "Télécharger PDF"}
          </button>
        </div>
      }
    >
      <div className="h-[calc(100vh-130px)] overflow-y-auto scroll-smooth px-6 pb-6">
        <style>{`
          .h-\\[calc\\(100vh-130px\\)\\]::-webkit-scrollbar { width: 8px; }
          .h-\\[calc\\(100vh-130px\\)\\]::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
          .h-\\[calc\\(100vh-130px\\)\\]::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
          .h-\\[calc\\(100vh-130px\\)\\]::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
        `}</style>

        <div className="max-w-[900px] mx-auto">

          {/* SECTION 1 — Informations personnelles (avec photo) */}
          <SectionCard icon={User} title="Informations personnelles">
            <div className="flex flex-wrap gap-3 pt-3">

              {/* ── Champ photo — en haut de la section ── */}
              <Field label="Photo de profil (optionnelle — apparaît en haut à gauche du CV)">
                <div className="flex items-center gap-4 mt-1">
                  {/* Preview circulaire */}
                  <div
                    className="relative w-20 h-20 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400 transition-colors group flex-shrink-0"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {photoPreview ? (
                      <>
                        <img
                          src={photoPreview}
                          alt="Aperçu"
                          className="w-full h-full object-cover rounded-full"
                        />
                        {/* Overlay au hover */}
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera size={18} className="text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-gray-500 transition-colors">
                        <Camera size={22} />
                        <span className="text-[10px] font-medium text-center leading-tight">Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Infos + boutons */}
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-700 bg-white hover:border-black hover:text-black transition-colors cursor-pointer"
                    >
                      <Camera size={13} />
                      {photoPreview ? "Changer la photo" : "Ajouter une photo"}
                    </button>

                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1.5 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 bg-white hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <X size={13} />
                        Supprimer
                      </button>
                    )}

                    <p className="text-[10px] text-gray-400 leading-snug">
                      JPG, PNG ou WEBP · max 5 Mo<br />
                      Apparaît en haut à gauche du PDF
                    </p>
                  </div>

                  {/* Input file caché */}
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              </Field>

              {/* Champs existants inchangés */}
              <Field label="Prénom" half>
                <input className={inputClasses} value={data.prenom}
                  onChange={e => set("prenom", e.target.value)} placeholder="Jean" />
              </Field>
              <Field label="Nom" half>
                <input className={inputClasses} value={data.nom}
                  onChange={e => set("nom", e.target.value)} placeholder="Dupont" />
              </Field>
              <Field label="Titre / Poste visé">
                <input className={inputClasses} value={data.titre}
                  onChange={e => set("titre", e.target.value)}
                  placeholder="Ingénieur Logiciel Senior" />
              </Field>
              <Field label="Email" half>
                <input className={inputClasses} type="email" value={data.email}
                  onChange={e => set("email", e.target.value)} placeholder="jean.dupont@email.com" />
              </Field>
              <Field label="Téléphone" half>
                <input className={inputClasses} value={data.telephone}
                  onChange={e => set("telephone", e.target.value)} placeholder="+213 6XX XXX XXX" />
              </Field>
              <Field label="Ville" half>
                <input className={inputClasses} value={data.ville}
                  onChange={e => set("ville", e.target.value)} placeholder="Alger" />
              </Field>
              <Field label="Pays" half>
                <input className={inputClasses} value={data.pays}
                  onChange={e => set("pays", e.target.value)} placeholder="Algérie" />
              </Field>
              <Field label="LinkedIn" half>
                <input className={inputClasses} value={data.linkedin}
                  onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/in/jean-dupont" />
              </Field>
              <Field label="GitHub / Portfolio" half>
                <input className={inputClasses} value={data.github}
                  onChange={e => set("github", e.target.value)} placeholder="github.com/jeandupont" />
              </Field>
              <Field label="Résumé / Profil professionnel">
                <textarea className={textareaClasses}
                  value={data.resume}
                  onChange={e => set("resume", e.target.value)}
                  placeholder="Ingénieur passionné avec 5 ans d'expérience en développement web full-stack..." />
              </Field>
            </div>
          </SectionCard>

          {/* SECTION 2 — Expériences professionnelles */}
          <SectionCard icon={Briefcase} title="Expériences professionnelles">
            {data.experiences.map((exp, i) => (
              <div key={i} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 mb-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Expérience {i + 1}
                  </span>
                  {data.experiences.length > 1 && (
                    <button className={removeButtonClasses} onClick={() => removeArr("experiences", i)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Field label="Poste" half>
                    <input className={inputClasses} value={exp.poste}
                      onChange={e => setArr("experiences", i, "poste", e.target.value)}
                      placeholder="Développeur Full Stack" />
                  </Field>
                  <Field label="Entreprise" half>
                    <input className={inputClasses} value={exp.entreprise}
                      onChange={e => setArr("experiences", i, "entreprise", e.target.value)}
                      placeholder="TechCorp SARL" />
                  </Field>
                  <Field label="Lieu" half>
                    <input className={inputClasses} value={exp.lieu}
                      onChange={e => setArr("experiences", i, "lieu", e.target.value)}
                      placeholder="Alger, Algérie" />
                  </Field>
                  <Field label="Début" half>
                    <input className={inputClasses} value={exp.debut}
                      onChange={e => setArr("experiences", i, "debut", e.target.value)}
                      placeholder="Jan 2022" />
                  </Field>
                  <Field label="Fin (vide = Présent)" half>
                    <input className={inputClasses} value={exp.fin}
                      onChange={e => setArr("experiences", i, "fin", e.target.value)}
                      placeholder="Présent" />
                  </Field>
                  <Field label="Description / Réalisations (une par ligne)">
                    <textarea className={textareaClasses}
                      value={exp.description}
                      onChange={e => setArr("experiences", i, "description", e.target.value)}
                      placeholder="Développement d'une API REST avec Django&#10;Migration vers une architecture microservices" />
                  </Field>
                </div>
              </div>
            ))}
            <button className={addButtonClasses} onClick={() => addArr("experiences", { poste: "", entreprise: "", lieu: "", debut: "", fin: "", description: "" })}>
              <Plus size={14} /> Ajouter une expérience
            </button>
          </SectionCard>

          {/* SECTION 3 — Formation */}
          <SectionCard icon={GraduationCap} title="Formation">
            {data.formations.map((f, i) => (
              <div key={i} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 mb-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Formation {i + 1}
                  </span>
                  {data.formations.length > 1 && (
                    <button className={removeButtonClasses} onClick={() => removeArr("formations", i)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <Field label="Diplôme / Titre" half>
                    <input className={inputClasses} value={f.diplome}
                      onChange={e => setArr("formations", i, "diplome", e.target.value)}
                      placeholder="Master Informatique" />
                  </Field>
                  <Field label="Établissement" half>
                    <input className={inputClasses} value={f.etablissement}
                      onChange={e => setArr("formations", i, "etablissement", e.target.value)}
                      placeholder="USTHB Alger" />
                  </Field>
                  <Field label="Lieu" half>
                    <input className={inputClasses} value={f.lieu}
                      onChange={e => setArr("formations", i, "lieu", e.target.value)}
                      placeholder="Alger" />
                  </Field>
                  <Field label="Mention" half>
                    <input className={inputClasses} value={f.mention}
                      onChange={e => setArr("formations", i, "mention", e.target.value)}
                      placeholder="Très Bien" />
                  </Field>
                  <Field label="Début" half>
                    <input className={inputClasses} value={f.debut}
                      onChange={e => setArr("formations", i, "debut", e.target.value)}
                      placeholder="Sep 2018" />
                  </Field>
                  <Field label="Fin" half>
                    <input className={inputClasses} value={f.fin}
                      onChange={e => setArr("formations", i, "fin", e.target.value)}
                      placeholder="Juin 2022" />
                  </Field>
                  <Field label="Description (optionnel)">
                    <textarea className={textareaClasses}
                      value={f.description}
                      onChange={e => setArr("formations", i, "description", e.target.value)}
                      placeholder="Spécialisation en IA et systèmes distribués..." />
                  </Field>
                </div>
              </div>
            ))}
            <button className={addButtonClasses} onClick={() => addArr("formations", { diplome: "", etablissement: "", lieu: "", debut: "", fin: "", mention: "", description: "" })}>
              <Plus size={14} /> Ajouter une formation
            </button>
          </SectionCard>

          {/* SECTION 4 — Compétences */}
          <SectionCard icon={Code2} title="Compétences">
            {data.competences.map((grp, gi) => (
              <div key={gi} className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 mb-3">
                <div className="flex justify-between items-center mb-2.5">
                  <input
                    className="flex-1 max-w-[200px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-sans text-sm font-semibold text-gray-900 outline-none focus:border-black"
                    value={grp.categorie}
                    onChange={e => setData(p => ({
                      ...p,
                      competences: p.competences.map((g, i2) => i2 === gi ? { ...g, categorie: e.target.value } : g)
                    }))}
                    placeholder="ex: Frontend, Backend, DevOps…"
                  />
                  {data.competences.length > 1 && (
                    <button className={removeButtonClasses} onClick={() => removeArr("competences", gi)}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {grp.items.map((item, ii) => (
                    <div key={ii} className="flex items-center gap-0.5">
                      <input
                        className="w-[120px] px-2.5 py-1 bg-white border border-gray-200 rounded-md font-sans text-xs text-gray-900 outline-none focus:border-black"
                        value={item}
                        onChange={e => setSkillItem(gi, ii, e.target.value)}
                        placeholder="React, Django…"
                      />
                      {grp.items.length > 1 && (
                        <button className="p-0.5 text-gray-300 hover:text-red-500 transition-colors" onClick={() => removeSkillItem(gi, ii)}>
                          <Trash2 size={11} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button className="inline-flex items-center gap-1 bg-none border border-dashed border-gray-300 rounded-md px-2 py-1 text-gray-500 text-[11px] cursor-pointer hover:border-gray-400" onClick={() => addSkillItem(gi)}>
                    <Plus size={12} />
                  </button>
                </div>
              </div>
            ))}
            <button className={addButtonClasses} onClick={() => addArr("competences", { categorie: "", items: [""] })}>
              <Plus size={14} /> Ajouter une catégorie
            </button>
          </SectionCard>

          {/* SECTION 5 — Langues */}
          <SectionCard icon={Globe} title="Langues">
            {data.langues.map((l, i) => (
              <div key={i} className="flex gap-2.5 items-center mb-2.5">
                <input
                  className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-sans text-sm text-gray-900 outline-none focus:border-black"
                  value={l.nom}
                  onChange={e => setArr("langues", i, "nom", e.target.value)}
                  placeholder="Arabe, Français…"
                />
                <select
                  className="flex-[1.5] px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-sans text-sm text-gray-900 outline-none focus:border-black cursor-pointer"
                  value={l.niveau}
                  onChange={e => setArr("langues", i, "niveau", e.target.value)}
                >
                  {NIVEAUX_LANGUE.map(n => <option key={n}>{n}</option>)}
                </select>
                {data.langues.length > 1 && (
                  <button className={removeButtonClasses} onClick={() => removeArr("langues", i)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button className={addButtonClasses} onClick={() => addArr("langues", { nom: "", niveau: "Intermédiaire (B1)" })}>
              <Plus size={14} /> Ajouter une langue
            </button>
          </SectionCard>

          {/* SECTION 6 — Certifications */}
          <SectionCard icon={Award} title="Certifications & Distinctions" defaultOpen={false}>
            {data.certifications.map((c, i) => (
              <div key={i} className="flex gap-2.5 items-center mb-2.5">
                <input className="flex-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-sans text-sm text-gray-900 outline-none focus:border-black" value={c.nom}
                  onChange={e => setArr("certifications", i, "nom", e.target.value)}
                  placeholder="AWS Solutions Architect" />
                <input className="flex-1.5 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-sans text-sm text-gray-900 outline-none focus:border-black" value={c.organisme}
                  onChange={e => setArr("certifications", i, "organisme", e.target.value)}
                  placeholder="Amazon Web Services" />
                <input className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg font-sans text-sm text-gray-900 outline-none focus:border-black w-24" value={c.annee}
                  onChange={e => setArr("certifications", i, "annee", e.target.value)}
                  placeholder="2023" />
                {data.certifications.length > 0 && (
                  <button className={removeButtonClasses} onClick={() => removeArr("certifications", i)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            <button className={addButtonClasses} onClick={() => addArr("certifications", { nom: "", organisme: "", annee: "" })}>
              <Plus size={14} /> Ajouter une certification
            </button>
          </SectionCard>

          {/* Final download CTA */}
          <div className="bg-black rounded-xl p-6 flex items-center justify-between gap-5 mb-5">
            <div>
              <div className="text-white font-serif text-base font-bold">
                Prêt à télécharger votre CV ?
              </div>
              <div className="text-white/45 text-xs mt-1">
                Un PDF A4 professionnel, généré instantanément.
              </div>
            </div>
            <button
              className="inline-flex items-center gap-2 bg-white text-black border-none rounded-xl px-6 py-3 font-sans text-sm font-semibold cursor-pointer transition-all hover:bg-gray-100 disabled:opacity-50"
              onClick={handleDownload}
              disabled={generating}
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {generating ? "Génération…" : "Télécharger le PDF"}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}