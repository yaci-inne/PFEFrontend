import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Send,
  CheckCircle,
  Loader2,
  FileText,
  Briefcase,
  MapPin,
  Search,
  CheckSquare,
  AlertCircle,
  Upload,
  X,
  Maximize2,
  Globe,
  SlidersHorizontal,
  GraduationCap,
  BadgeDollarSign,
  Clock,
  Languages,
  Wrench,
  AlertTriangle,
  Info,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import AppShell from "../components/layout/AppShell";
import { getApiError } from "../lib/apiError";

// Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://pfebackend-production-5d5d.up.railway.app";
const MAX_CV_SIZE_MB = 10;
const MAX_CV_SIZE_BYTES = MAX_CV_SIZE_MB * 1024 * 1024;

const fastNormalize = (str) =>
  (str || "")
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]/g, "");

const getAiTone = (cv) => {
  if (cv?.ai_status === "validated") {
    return {
      label: "Valide IA",
      badge: "bg-emerald-100 text-emerald-700",
    };
  }
  if (cv?.ai_status === "rejected") {
    return {
      label: "Refuse IA",
      badge: "bg-red-100 text-red-700",
    };
  }
  return {
    label: "En attente IA",
    badge: "bg-amber-100 text-amber-700",
  };
};

const Envoi = () => {
  const [cvs, setCvs] = useState([]);
  const [selectedCV, setSelectedCV] = useState(null);

  const [allOffres, setAllOffres] = useState([]);
  const [selectedOffreIds, setSelectedOffreIds] = useState([]);

  // filtres principaux
  const [domaine, setDomaine] = useState("");
  const [specialite, setSpecialite] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");

  // filtres avancés
  const [typeContrat, setTypeContrat] = useState("");
  const [modeTravail, setModeTravail] = useState("");
  const [niveau, setNiveau] = useState("");
  const [expMin, setExpMin] = useState("");
  const [salaireMin, setSalaireMin] = useState("");
  const [etudeMin, setEtudeMin] = useState("");
  const [tags, setTags] = useState("");

  const [debouncedFilters, setDebouncedFilters] = useState({
    domaine: "",
    specialite: "",
    ville: "",
    pays: "",
    typeContrat: "",
    modeTravail: "",
    niveau: "",
    expMin: "",
    salaireMin: "",
    etudeMin: "",
    tags: "",
  });

  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [isFetching, setIsFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [message, setMessage] = useState({ type: "", text: "" });
  const [messageTimeoutId, setMessageTimeoutId] = useState(null);

  const pushMessage = (type, text, timeout = 8000) => {
    if (messageTimeoutId) clearTimeout(messageTimeoutId);
    setMessage({ type, text });
    if (!timeout) return;
    const id = setTimeout(() => setMessage({ type: "", text: "" }), timeout);
    setMessageTimeoutId(id);
  };

  const api = useMemo(() => {
    const instance = axios.create({ baseURL: API_BASE_URL });
    instance.interceptors.request.use((config) => {
      const token = localStorage.getItem("accessToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return instance;
  }, []);

  // debounce filtres
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters({
        domaine,
        specialite,
        ville,
        pays,
        typeContrat,
        modeTravail,
        niveau,
        expMin,
        salaireMin,
        etudeMin,
        tags,
      });
    }, 300);
    return () => clearTimeout(handler);
  }, [
    domaine,
    specialite,
    ville,
    pays,
    typeContrat,
    modeTravail,
    niveau,
    expMin,
    salaireMin,
    etudeMin,
    tags,
  ]);

  const loadData = async () => {
    setIsFetching(true);
    try {
      const [cvRes, offresRes] = await Promise.all([api.get("/cvs/"), api.get("/offres/")]);

      const cvData = cvRes.data?.cvs ?? cvRes.data ?? [];
      const offresData = offresRes.data?.offres ?? offresRes.data ?? [];

      const optimized = (offresData || []).map((o) => ({
        ...o,
        _normDomaine: fastNormalize(o.domaine),
        _normSpecialite: fastNormalize(o.specialite),
        _normVille: fastNormalize(o.ville),
        _normPays: fastNormalize(o.pays),
        _normTypeContrat: fastNormalize(o.type_contrat),
        _normModeTravail: fastNormalize(o.mode_travail),
        _normNiveau: fastNormalize(o.niveau),
        _normTags: fastNormalize(o.tags),
        _expMin: o.experience_min ?? null,
        _salaireMin: o.salaire_min ?? null,
        _etudeMin: fastNormalize(o.etude_min),
      }));

      setCvs(cvData || []);
      setAllOffres(optimized);
    } catch (err) {
      console.error(err);
      const apiError = getApiError(err, "Erreur lors du chargement des donnees.");
      pushMessage("error", apiError.details[0] || apiError.message);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutId) clearTimeout(messageTimeoutId);
    };
  }, [messageTimeoutId]);

  const filteredOffres = useMemo(() => {
    const f = debouncedFilters;

    const nD = fastNormalize(f.domaine);
    const nS = fastNormalize(f.specialite);
    const nV = fastNormalize(f.ville);
    const nP = fastNormalize(f.pays);

    const nTC = fastNormalize(f.typeContrat);
    const nMT = fastNormalize(f.modeTravail);
    const nN = fastNormalize(f.niveau);
    const nTags = fastNormalize(f.tags);

    const exp = f.expMin ? parseInt(f.expMin, 10) : null;
    const sal = f.salaireMin ? parseInt(f.salaireMin, 10) : null;
    const nEtude = fastNormalize(f.etudeMin);

    return allOffres.filter((o) => {
      // important: offre doit accepter candidatures, être publiée, non archivée
      if (o.estArchivee) return false;
      
      if (!o.recevoirCandidatures) return false;

      if (nD && !o._normDomaine?.includes(nD)) return false;
      if (nS && !o._normSpecialite?.includes(nS)) return false;
      if (nV && !o._normVille?.includes(nV)) return false;
      if (nP && !o._normPays?.includes(nP)) return false;

      if (nTC && !o._normTypeContrat?.includes(nTC)) return false;
      if (nMT && !o._normModeTravail?.includes(nMT)) return false;
      if (nN && !o._normNiveau?.includes(nN)) return false;

      if (nTags && !o._normTags?.includes(nTags)) return false;

      // logique actuelle: "adapté au candidat"
      // expMin: si l'offre demande + que ce que le candidat met => exclure
      if (exp !== null && o._expMin !== null && o._expMin > exp) return false;
      if (sal !== null && o._salaireMin !== null && o._salaireMin > sal) return false;
      if (nEtude && o._etudeMin && !o._etudeMin.includes(nEtude)) return false;

      return true;
    });
  }, [allOffres, debouncedFilters]);

  const selectedCvObject = useMemo(
    () => cvs.find((cv) => cv.cvId === selectedCV) || null,
    [cvs, selectedCV]
  );
  const canSendSelectedCv = selectedCvObject ? selectedCvObject.ai_status === "validated" : false;

  // Auto-sélection "smart":
  // - Si le user n'a rien sélectionné -> sélectionner tous les matchs
  // - Sinon -> ne pas écraser sa sélection manuelle à chaque filtre
  useEffect(() => {
    setSelectedOffreIds((prev) => {
      if (prev.length > 0) return prev;
      return filteredOffres.map((o) => o.offreId);
    });
  }, [filteredOffres]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    const ext = `.${(file.name.split(".").pop() || "").toLowerCase()}`;
    const allowedExt = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png", ".jfif"];
    if (!allowed.includes(file.type) && !allowedExt.includes(ext)) {
      pushMessage("warning", "Format non supporte. Utilisez PDF, DOC, DOCX, JPEG, PNG ou JFIF.");
      return;
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
      pushMessage(
        "error",
        `Fichier trop volumineux (${fileSizeMb} MB). Taille maximale: ${MAX_CV_SIZE_MB} MB.`
      );
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("fichier", file);
    formData.append("nom", file.name);
    formData.append("type", "cv");

    try {
      await api.post("/cvs/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadData();
      pushMessage("success", "CV ajoute a votre profil.");
    } catch (err) {
      console.error(err);
      const apiError = getApiError(err, "Erreur lors de l'upload.");
      pushMessage("error", apiError.details[0] || apiError.message);
    } finally {
      setUploading(false);
    }
  };

  const handleEnvoyer = async () => {
    if (!selectedCV || selectedOffreIds.length === 0) {
      pushMessage("warning", "Selectionnez un CV et au moins une offre.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/envois/", {
        cv_id: selectedCV,
        offre_ids: selectedOffreIds,
      });

      if (res.data?.success === false && typeof res.data?.message === "string") {
        pushMessage("error", res.data.message);
        return;
      }

      const created = Array.isArray(res.data?.envois_ids)
        ? res.data.envois_ids.length
        : (res.data?.created_count ?? 0);

      const refused = Array.isArray(res.data?.refusees)
        ? res.data.refusees.length
        : (res.data?.refused_count ?? 0);

      let text = `${created} candidature(s) créée(s).`;
      if (refused > 0) text += ` ${refused} refusée(s).`;

      // Optionnel: montrer 1 exemple de refus
      if (refused > 0 && Array.isArray(res.data?.refusees) && res.data.refusees.length > 0) {
        const first = res.data.refusees[0];
        const reason =
          first?.errors
            ? Object.values(first.errors).flat().join(" ")
            : "Erreur de validation.";
        text += ` Exemple: ${first.offre} (${first.entreprise}) -> ${reason}`;
      }

      pushMessage(created > 0 ? "success" : "warning", text, 5000);
    } catch (err) {
      console.error(err);
      const apiError = getApiError(err, "L'envoi a echoue.");
      pushMessage("error", apiError.details[0] || apiError.message, 5000);
    } finally {
      setLoading(false);
    }
  };

  const MapEvents = () => {
    useMapEvents({
      click: async (e) => {
        try {
          const { lat, lng } = e.latlng;
          setSelectedLocation([lat, lng]);

          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { headers: { Accept: "application/json" } }
          );
          const d = await r.json();
          if (d?.address) {
            setVille(d.address.city || d.address.town || d.address.village || "");
            setPays(d.address.country || "");
          }
        } catch (error) {
          console.error(error);
          pushMessage("error", "Impossible de recuperer l'adresse depuis la carte.");
        }
      },
    });
    return selectedLocation ? <Marker position={selectedLocation} /> : null;
  };

  return (
    <AppShell
      title="Envoi"
      subtitle="Selectionnez un CV, ciblez les offres et diffusez en masse."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* COLONNE GAUCHE */}
        <div className="lg:col-span-4 space-y-6">
          {/* UPLOAD + LISTE CVS */}
          <div className="bg-[hsl(var(--card))] p-8 rounded-3xl shadow-sm border border-slate-200/70">
            <label className="group block cursor-pointer">
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-[hsl(var(--primary)/0.2)] rounded-2xl bg-[hsl(var(--primary)/0.05)] group-hover:bg-[hsl(var(--primary)/0.08)] transition-all">
                <div className="p-4 bg-[hsl(var(--card))] rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  {uploading ? (
                    <Loader2 className="animate-spin text-[hsl(var(--primary))]" size={32} />
                  ) : (
                    <Upload className="text-[hsl(var(--primary))]" size={32} />
                  )}
                </div>
                <span className="font-black text-slate-700">Choisir un CV</span>
                <input type="file" className="hidden" onChange={handleUpload} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.jfif" />
              </div>
            </label>

            <div className="mt-6 space-y-2 max-h-40 overflow-y-auto px-1">
              {cvs.map((cv) => (
                <div
                  key={cv.cvId}
                  onClick={() => {
                    setSelectedCV(cv.cvId);
                    if (cv.ai_status !== "validated") {
                      pushMessage(
                        "warning",
                        "Ce CV n'est pas encore valide IA. Ouvrez Mes CV > Rapport IA pour le corriger."
                      );
                    }
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer flex justify-between items-center transition-all ${
                    selectedCV === cv.cvId
                      ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)]"
                      : "border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <FileText size={16} className={selectedCV === cv.cvId ? "text-[hsl(var(--primary))]" : "text-slate-300"} />
                    <div className="min-w-0">
                      <span className="block text-xs font-black truncate">{cv.nom}</span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${getAiTone(cv).badge}`}>
                          {getAiTone(cv).label}
                        </span>
                      </div>
                    </div>
                  </div>
                  {selectedCV === cv.cvId && <CheckCircle size={16} className="text-[hsl(var(--primary))]" />}
                </div>
              ))}
            </div>

            {selectedCvObject && selectedCvObject.ai_status !== "validated" && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-700">
                Envoi bloque: le CV selectionne n'est pas valide IA. Consultez le Rapport IA dans "Mes CV".
              </div>
            )}
          </div>

          {/* FILTRES */}
          <div className="bg-[hsl(var(--card))] p-6 rounded-3xl shadow-sm border border-slate-200/70 space-y-3">
            <h3 className="font-black text-lg flex items-center gap-2 px-2 mb-4">
              <SlidersHorizontal className="text-[hsl(var(--primary))]" size={20} /> Ciblage Offre
            </h3>

            <div className="relative group">
              <Briefcase
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[hsl(var(--primary))] transition-colors"
              />
              <input
                className="w-full pl-11 pr-5 py-4 bg-[hsl(var(--background))] rounded-2xl outline-none text-sm border border-transparent focus:border-[hsl(var(--primary)/0.35)] focus:bg-[hsl(var(--card))] transition-all"
                placeholder="Domaine (ex: informatique)"
                value={domaine}
                onChange={(e) => setDomaine(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Wrench
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[hsl(var(--primary))] transition-colors"
              />
              <input
                className="w-full pl-11 pr-5 py-4 bg-[hsl(var(--background))] rounded-2xl outline-none text-sm border border-transparent focus:border-[hsl(var(--primary)/0.35)] focus:bg-[hsl(var(--card))] transition-all"
                placeholder="Spécialité (ex: backend, devops...)"
                value={specialite}
                onChange={(e) => setSpecialite(e.target.value)}
              />
            </div>

            <div className="relative group">
              <MapPin
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[hsl(var(--primary))] transition-colors"
              />
              <input
                className="w-full pl-11 pr-5 py-4 bg-[hsl(var(--background))] rounded-2xl outline-none text-sm border border-transparent focus:border-[hsl(var(--primary)/0.35)] focus:bg-[hsl(var(--card))] transition-all"
                placeholder="Ville..."
                value={ville}
                onChange={(e) => setVille(e.target.value)}
              />
            </div>

            <div className="relative group">
              <Globe
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[hsl(var(--primary))] transition-colors"
              />
              <input
                className="w-full pl-11 pr-5 py-4 bg-[hsl(var(--background))] rounded-2xl outline-none text-sm border border-transparent focus:border-[hsl(var(--primary)/0.35)] focus:bg-[hsl(var(--card))] transition-all"
                placeholder="Pays..."
                value={pays}
                onChange={(e) => setPays(e.target.value)}
              />
            </div>

            {/* ADVANCED */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="relative group">
                <Clock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[hsl(var(--primary))] transition-colors"
                />
                <input
                  className="w-full pl-11 pr-5 py-4 bg-[hsl(var(--background))] rounded-2xl outline-none text-sm border border-transparent focus:border-[hsl(var(--primary)/0.35)] focus:bg-[hsl(var(--card))] transition-all"
                  placeholder="Type contrat (cdi, stage...)"
                  value={typeContrat}
                  onChange={(e) => setTypeContrat(e.target.value)}
                />
              </div>

              <div className="relative group">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[hsl(var(--primary))] transition-colors"
                />
                <input
                  className="w-full pl-11 pr-5 py-4 bg-[hsl(var(--background))] rounded-2xl outline-none text-sm border border-transparent focus:border-[hsl(var(--primary)/0.35)] focus:bg-[hsl(var(--card))] transition-all"
                  placeholder="Mode travail (remote...)"
                  value={modeTravail}
                  onChange={(e) => setModeTravail(e.target.value)}
                />
              </div>

              <div className="relative group">
                <GraduationCap
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[hsl(var(--primary))] transition-colors"
                />
                <input
                  className="w-full pl-11 pr-5 py-4 bg-[hsl(var(--background))] rounded-2xl outline-none text-sm border border-transparent focus:border-[hsl(var(--primary)/0.35)] focus:bg-[hsl(var(--card))] transition-all"
                  placeholder="Niveau (junior...)"
                  value={niveau}
                  onChange={(e) => setNiveau(e.target.value)}
                />
              </div>

              <div className="relative group">
                <BadgeDollarSign
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[hsl(var(--primary))] transition-colors"
                />
                <input
                  className="w-full pl-11 pr-5 py-4 bg-[hsl(var(--background))] rounded-2xl outline-none text-sm border border-transparent focus:border-[hsl(var(--primary)/0.35)] focus:bg-[hsl(var(--card))] transition-all"
                  placeholder="Salaire min"
                  value={salaireMin}
                  onChange={(e) => setSalaireMin(e.target.value)}
                />
              </div>

              <div className="relative group">
                <Clock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[hsl(var(--primary))] transition-colors"
                />
                <input
                  className="w-full pl-11 pr-5 py-4 bg-[hsl(var(--background))] rounded-2xl outline-none text-sm border border-transparent focus:border-[hsl(var(--primary)/0.35)] focus:bg-[hsl(var(--card))] transition-all"
                  placeholder="Exp min (années)"
                  value={expMin}
                  onChange={(e) => setExpMin(e.target.value)}
                />
              </div>

              <div className="relative group">
                <Languages
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[hsl(var(--primary))] transition-colors"
                />
                <input
                  className="w-full pl-11 pr-5 py-4 bg-[hsl(var(--background))] rounded-2xl outline-none text-sm border border-transparent focus:border-[hsl(var(--primary)/0.35)] focus:bg-[hsl(var(--card))] transition-all"
                  placeholder="Étude min (master...)"
                  value={etudeMin}
                  onChange={(e) => setEtudeMin(e.target.value)}
                />
              </div>
            </div>

            <div className="relative group">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[hsl(var(--primary))] transition-colors"
              />
              <input
                className="w-full pl-11 pr-5 py-4 bg-[hsl(var(--background))] rounded-2xl outline-none text-sm border border-transparent focus:border-[hsl(var(--primary)/0.35)] focus:bg-[hsl(var(--card))] transition-all"
                placeholder="Tags (ex: django,react...)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            {/* MAP PICKER */}
            <div
              onClick={() => setShowMapPicker(true)}
              className="group relative h-32 w-full rounded-2xl overflow-hidden cursor-pointer border-4 border-white shadow-inner mt-4"
            >
              <div className="absolute inset-0 z-10 bg-[hsl(var(--primary))/0.08] group-hover:bg-transparent transition-all flex items-center justify-center">
                <div className="bg-[hsl(var(--card))] px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2">
                  <Maximize2 size={12} className="text-[hsl(var(--primary))]" />
                  <span className="text-[9px] font-black uppercase">Carte</span>
                </div>
              </div>
              <MapContainer
                center={[36.1905, 5.4107]}
                zoom={10}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", pointerEvents: "none" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              </MapContainer>
            </div>
          </div>

          {/* ENVOI */}
          <button
            disabled={loading || !selectedCV || !canSendSelectedCv || selectedOffreIds.length === 0}
            onClick={handleEnvoyer}
            className="w-full py-5 bg-[hsl(var(--primary))] text-white rounded-2xl font-semibold shadow-sm hover:bg-[hsl(var(--primary-dark))] active:scale-95 disabled:bg-slate-200 transition-all flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />} DIFFUSER ({selectedOffreIds.length})
          </button>
        </div>

        {/* COLONNE DROITE */}
        <div className="lg:col-span-8">
          <div className="bg-[hsl(var(--card))] rounded-3xl shadow-sm h-[800px] flex flex-col overflow-hidden border border-slate-200/70">
            <div className="p-8 border-b flex justify-between items-center">
              <h2 className="text-2xl font-display font-semibold">Offres</h2>
              <div className="bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm">
                {filteredOffres.length} MATCHS
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-[hsl(var(--background))]">
              {isFetching ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="animate-spin text-[hsl(var(--primary))]" size={40} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOffres.map((offre) => (
                    <div
                      key={offre.offreId}
                      onClick={() =>
                        setSelectedOffreIds((prev) =>
                          prev.includes(offre.offreId)
                            ? prev.filter((id) => id !== offre.offreId)
                            : [...prev, offre.offreId]
                        )
                      }
                      className={`group p-6 rounded-3xl bg-[hsl(var(--card))] border-2 transition-all flex justify-between items-center cursor-pointer ${
                        selectedOffreIds.includes(offre.offreId)
                          ? "border-[hsl(var(--primary))] shadow-sm"
                          : "border-transparent hover:border-slate-200"
                      }`}
                    >
                      <div className="overflow-hidden pr-2">
                        <h4 className="font-black text-slate-800 text-lg leading-tight truncate uppercase">
                          {offre.titre}
                        </h4>

                        <div className="text-[11px] font-bold text-slate-500 mt-1 truncate">
                          {offre.entreprise_nom || "Entreprise"}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-[hsl(var(--primary)/0.08)] text-[hsl(var(--primary))] text-[9px] font-black rounded-md uppercase tracking-wider">
                            {offre.domaine}
                          </span>

                          {offre.specialite && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black rounded-md uppercase tracking-wider">
                              {offre.specialite}
                            </span>
                          )}

                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                            <MapPin size={10} /> {offre.ville || "N/A"}
                          </span>

                          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                            <Globe size={10} className="text-[hsl(var(--secondary))]" /> {offre.pays || "N/A"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {offre.type_contrat && (
                            <span className="text-[10px] font-extrabold text-slate-500 bg-[hsl(var(--background))] px-2 py-1 rounded-lg">
                              {offre.type_contrat.toUpperCase()}
                            </span>
                          )}
                          {offre.mode_travail && (
                            <span className="text-[10px] font-extrabold text-slate-500 bg-[hsl(var(--background))] px-2 py-1 rounded-lg">
                              {offre.mode_travail.toUpperCase()}
                            </span>
                          )}
                          {offre.niveau && (
                            <span className="text-[10px] font-extrabold text-slate-500 bg-[hsl(var(--background))] px-2 py-1 rounded-lg">
                              {offre.niveau.toUpperCase()}
                            </span>
                          )}
                          <span className="text-[10px] font-extrabold text-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.08)] px-2 py-1 rounded-lg">
                            RELANCE: {offre.relance_days ?? 7}j
                          </span>
                        </div>
                      </div>

                      <div
                        className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all ${
                          selectedOffreIds.includes(offre.offreId)
                            ? "bg-[hsl(var(--primary))] text-white"
                            : "bg-[hsl(var(--background))] text-slate-200"
                        }`}
                      >
                        <CheckSquare size={24} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL CARTE */}
      {showMapPicker && (
        <div className="fixed inset-0 bg-[hsl(var(--primary))/0.3] backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-[hsl(var(--card))] rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden h-[80vh] flex flex-col">
            <div className="p-8 border-b flex justify-between items-center">
              <h3 className="text-2xl font-display font-semibold">Zone de recherche</h3>
              <button onClick={() => setShowMapPicker(false)} className="p-4 hover:bg-[hsl(var(--background))] rounded-2xl">
                <X />
              </button>
            </div>
            <div className="flex-1 z-0">
              <MapContainer center={[36.1905, 5.4107]} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapEvents />
              </MapContainer>
            </div>
            <div className="p-8 bg-[hsl(var(--background))] border-t flex justify-end">
              <button
                onClick={() => setShowMapPicker(false)}
                className="px-10 py-3 bg-[hsl(var(--primary))] text-white rounded-2xl font-semibold shadow-sm"
              >
                VALIDER
              </button>
            </div>
          </div>
        </div>
      )}
      {/* TOAST */}
      {message.text && (
        <div className="fixed bottom-8 right-8 z-[9999] relative flex items-center gap-4 px-6 py-5 rounded-2xl shadow-2xl border-l-[10px] bg-[hsl(var(--card))] border-slate-200">
          {(() => {
            const styles = {
              success: {
                badge: "bg-emerald-100 text-emerald-700",
                border: "border-emerald-500",
                title: "Succes",
                icon: <CheckCircle size={24} />,
              },
              error: {
                badge: "bg-red-100 text-red-700",
                border: "border-red-500",
                title: "Erreur",
                icon: <AlertCircle size={24} />,
              },
              warning: {
                badge: "bg-amber-100 text-amber-700",
                border: "border-amber-500",
                title: "Attention",
                icon: <AlertTriangle size={24} />,
              },
              info: {
                badge: "bg-blue-100 text-blue-700",
                border: "border-blue-500",
                title: "Info",
                icon: <Info size={24} />,
              },
            };

            const tone = styles[message.type] || styles.info;

            return (
              <>
                <div className={`p-3 rounded-full ${tone.badge}`}>{tone.icon}</div>
                <div>
                  <h5 className="font-black text-slate-800 text-sm uppercase">{tone.title}</h5>
                  <p className="text-xs text-slate-500 font-bold">{message.text}</p>
                </div>
                <button
                  onClick={() => {
                    if (messageTimeoutId) clearTimeout(messageTimeoutId);
                    setMessage({ type: "", text: "" });
                  }}
                  className="ml-4 text-slate-300"
                >
                  <X size={18} />
                </button>
                <span className={`absolute left-0 top-0 h-full w-[10px] rounded-l-2xl ${tone.border}`} />
              </>
            );
          })()}
        </div>
      )}

    </AppShell>
  );
};

export default Envoi;

