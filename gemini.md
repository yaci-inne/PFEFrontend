# YourDreamJob — Frontend Context for Gemini Agent

## Project Overview

**YourDreamJob** (also called **AutoCandidature**) is a bilingual French-language intelligent recruitment platform built with **React + Vite**. It has two distinct user roles:

- **Candidat** — job seekers who upload CVs, browse offers, send applications, and manage interviews
- **Entreprise** — recruiters who post job offers, review applications, and schedule interviews

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS + inline CSS-in-JS (`<style>` tags) |
| HTTP client | Axios (via custom `api` wrapper at `src/lib/api.js`) |
| Notifications | `sonner` (toast library) |
| Icons | `lucide-react` |
| PDF generation | `@react-pdf/renderer` |
| Maps | `react-leaflet` + Leaflet.js |
| Fonts | Google Fonts — Syne (headings, bold) + DM Sans (body) |
| Auth tokens | JWT stored in `localStorage` (`accessToken`, `refreshToken`) |

---

## Project Structure

```
src/
├── App.jsx                          # Root router
├── lib/
│   ├── api.js                       # Axios instance + API_BASE_URL
│   ├── auth.js                      # JWT helpers
│   └── apiError.js                  # Error formatter
├── components/
│   ├── RequireAuth.jsx              # Auth guard wrapper
│   ├── RequireRole.jsx              # Role guard wrapper
│   └── layout/
│       ├── AppShell.jsx             # Main layout wrapper (navbar + footer)
│       ├── Sidebar.jsx              # Navbar component (named Navbar inside)
│       ├── Footer.jsx               # Footer component
│       ├── Topbar.jsx               # (legacy, replaced by Sidebar/Navbar)
│       ├── Header.jsx               # (legacy)
│       └── MenuButton.jsx           # (legacy)
├── pages/
│   ├── Welcomepage.jsx              # Public landing page (/)
│   ├── Login.jsx                    # Login page (/login)
│   ├── Signup.jsx                   # Register page (/signup)
│   ├── VerifyEmail.jsx              # Email verification
│   ├── ForgotPassword.jsx           # Password reset request
│   ├── ResetPassword.jsx            # Password reset form
│   ├── RootRedirect.jsx             # Redirects / → dashboard by role (legacy)
│   ├── NotFound.jsx                 # 404 page
│   ├── DashboardCandidat.jsx        # Candidat dashboard (/dashboard-candidat)
│   ├── DashboardEntreprise.jsx      # Entreprise dashboard (/dashboard-entreprise)
│   ├── Cvs.jsx                      # CV manager (/cvs)
│   ├── Generateurcv.jsx             # PDF CV generator (/generer-cv)
│   ├── Offers.jsx                   # Job offers list (/offres)
│   ├── OfferDetail.jsx              # Single offer detail (/offres/:id)
│   ├── Candidatures.jsx             # Candidat application tracker (/candidatures)
│   ├── Envoi.jsx                    # CV send workflow (/envoi)
│   ├── RendezVous.jsx               # Interview appointments (/rendez-vous)
│   ├── MeetingRoom.jsx              # Video meeting room (/rendez-vous/:creneauId/meeting)
│   ├── EntrepriseOffres.jsx         # Entreprise offer management (/entreprise/offres)
│   ├── EntrepriseCandidatures.jsx   # Entreprise application pipeline (/entreprise/candidatures)
│   └── Profile.jsx                  # User profile editor (/profil)
└── assets/
    ├── logo.svg
    └── avatar-default.svg
```

---

## Routing & Auth Logic

### Route Map (App.jsx)

| Path | Component | Auth Required | Role |
|---|---|---|---|
| `/` | `WelcomePage` | ❌ Public | Any |
| `/login` | `Login` | ❌ Public | Any |
| `/signup` | `Signup` | ❌ Public | Any |
| `/verify-email/:uidb64/:token/` | `VerifyEmail` | ❌ Public | Any |
| `/forgot-password` | `ForgotPassword` | ❌ Public | Any |
| `/reset-password/:uidb64/:token/` | `ResetPassword` | ❌ Public | Any |
| `/dashboard-candidat` | `DashboardCandidat` | ✅ | candidat |
| `/dashboard-entreprise` | `DashboardEntreprise` | ✅ | entreprise |
| `/cvs` | `Cvs` | ✅ | candidat |
| `/generer-cv` | `Generateurcv` | ✅ | candidat |
| `/offres` | `Offers` | ✅ | candidat |
| `/offres/:id` | `OfferDetail` | ✅ | candidat |
| `/candidatures` | `Candidatures` | ✅ | candidat |
| `/envoi` | `Envoi` | ✅ | candidat |
| `/rendez-vous` | `RendezVous` | ✅ | candidat + entreprise |
| `/rendez-vous/:creneauId/meeting` | `MeetingRoom` | ✅ | candidat + entreprise |
| `/entreprise/offres` | `EntrepriseOffres` | ✅ | entreprise |
| `/entreprise/candidatures` | `EntrepriseCandidatures` | ✅ | entreprise |
| `/profil` | `Profile` | ✅ | Any authenticated |
| `*` | `NotFound` | ❌ | Any |

### Auth Guards

```jsx
// RequireAuth — redirects to /login if not authenticated
// RequireRole — redirects if user doesn't have the required role
<RequireAuth>
  <RequireRole roles={["candidat"]}>
    <SomePage />
  </RequireRole>
</RequireAuth>
```

### Auth Helpers (`src/lib/auth.js`)

```js
isAuthenticated()      // returns boolean
getUserRole()          // returns "candidat" | "entreprise" | null
getUserId()            // returns user ID from JWT payload
getTokenPayload()      // returns decoded JWT payload
getTokenRemainingTime()// returns ms until token expiry
logout()               // clears localStorage tokens
```

### Token Check in App.jsx

Every 30 seconds, App checks if the token is still valid. If expired and on a protected route, it calls `logout()` and redirects to `/login`. Public paths (`/`, `/login`, `/signup`, etc.) are excluded from this redirect.

### Post-Login Redirect (Login.jsx)

After successful login:
```js
localStorage.setItem("accessToken", res.data.access);
localStorage.setItem("refreshToken", res.data.refresh);
const role = getUserRole();
navigate(role === "entreprise" ? "/dashboard-entreprise" : "/dashboard-candidat");
```

---

## Layout System

### AppShell

Every protected page wraps its content in `<AppShell>`:

```jsx
<AppShell
  title="Page Title"
  subtitle="Optional subtitle"
  actions={<button>CTA</button>}  // rendered in topbar right
>
  {/* page content */}
</AppShell>
```

`AppShell` renders:
1. `<Navbar>` (sticky top navigation)
2. `<main>` with `max-w-6xl` centered content + page entrance animation
3. `<Footer>` at the bottom (only visible when scrolled to end)

**Key CSS behavior:**
- `AppShell` uses `min-h-screen` + `flex flex-col` so footer is pushed to bottom
- `main` uses `flex-1` to fill remaining space
- No `overflow-hidden` or `h-screen` — natural page scroll

### Navbar (`Sidebar.jsx` — exported as `Navbar`)

Horizontal sticky topbar with:
- **Left**: Logo (black square icon + "YourDreamJob" text, rotates to circle on hover)
- **Center**: Pill-shaped nav (gray background, active item = black pill)
- **Right**: Avatar pill (photo + status dot + username) + Logout button
- **Mobile** (≤768px): Burger icon → right slide-in drawer with full nav + user info

Nav items are role-based:
- **Candidat**: Dashboard, Mes CV, Générer CV, Candidatures, Rendez-vous, Envoi, Profil
- **Entreprise**: Dashboard, Offres, Candidatures, Rendez-vous, Profil

Avatar photo is fetched from `GET /utilisateurs/:id/` and updates via a custom DOM event `profile:photo-updated`.

### Footer

Minimal design:
- **Top section**: Large tagline + 2 CTA pill buttons ("Commencer gratuitement", "En savoir plus")
- **Bottom bar**: Logo left · Nav links center · Social icons (LinkedIn, Twitter, GitHub) right
- **Copyright strip**: Full-width, light gray background

---

## API Integration

### Base URL

```js
// src/lib/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  || "https://pfebackend-production-5d5d.up.railway.app";
```

### Axios Instance

The `api` object is a configured Axios instance that:
- Automatically attaches `Authorization: Bearer <accessToken>` header
- Handles `successMessage` option for auto-toast on success
- Formats errors via `getApiError()` and shows sonner toast on failure

### Key API Endpoints Used

| Method | Endpoint | Used In |
|---|---|---|
| `GET` | `/dashboard/stats/` | DashboardCandidat, DashboardEntreprise |
| `GET` | `/envois/` | DashboardCandidat, DashboardEntreprise, Candidatures, RendezVous |
| `GET` | `/cvs/` | Cvs |
| `POST` | `/cvs/` | Cvs (upload) |
| `DELETE` | `/cvs/:id/` | Cvs |
| `GET` | `/cvs/:id/` | Cvs (preview URL) |
| `GET` | `/offres/` | Offers |
| `GET` | `/offres/:id/` | OfferDetail |
| `POST` | `/entreprise/offres/` | EntrepriseOffres |
| `PATCH` | `/offres/:id/toggle-recevoir/` | EntrepriseOffres |
| `DELETE` | `/offres/:id/` | EntrepriseOffres |
| `POST` | `/creneaux/:id/reserver/` | Candidatures |
| `POST` | `/creneaux/:id/annuler/` | RendezVous |
| `POST` | `/envois/:id/creneaux/` | EntrepriseCandidatures |
| `PATCH` | `/envois/:id/` | EntrepriseCandidatures (status update) |
| `GET` | `/utilisateurs/:id/` | Navbar, Profile, Topbar |
| `PATCH` | `/utilisateurs/:id/` | Profile |

---

## Data Models (Frontend-side)

### Envoi (Application)
```js
{
  envoiId: number,
  statut: "envoye" | "en_attente" | "accepte" | "refuse",
  offre_titre: string,
  entreprise_nom: string,
  candidat_nom: string,        // only for entreprise view
  cv_nom: string,
  cv_fichier_url: string,
  offre_domaine: string,
  offre_specialite: string,
  offre_type_contrat: string,
  offre_mode_travail: string,
  offre_ville: string,
  offre_pays: string,
  creneaux: Creneau[],
}
```

### Creneau (Interview Slot)
```js
{
  creneauId: number,
  startAt: string,             // ISO datetime
  endAt: string,               // ISO datetime
  mode: "visio" | "site",
  lieuOuLien: string,
  note: string,
  estReserve: boolean,
  reserve_par_nom: string,
  duree_minutes: number,
}
```

### CV
```js
{
  cvId: number,
  nom: string,
  type: string,
  fichier_url: string,
  ai_status: "validated" | "rejected" | "pending",
  ai_score: number,            // 0-100
  ai_has_photo: boolean,
  ai_notes: string,
}
```

### Offre (Job Offer)
```js
{
  offreId: number,
  titre: string,
  domaine: string,
  specialite: string,
  type_contrat: "cdi" | "cdd" | "stage" | "freelance" | "alternance",
  mode_travail: "site" | "hybride" | "remote",
  niveau: "junior" | "intermediaire" | "senior" | "lead" | "manager",
  etude_min: "aucun" | "bac" | "licence" | "master" | "doctorat",
  experience_min: number,
  salaire_min: number,
  ville: string,
  pays: string,
  tags: string,
  recevoirCandidatures: boolean,
  estArchivee: boolean,
  relance_days: number,
  entreprise_nom: string,
}
```

---

## Page-by-Page Summary

### WelcomePage (`/`)
- **Public** — no auth required
- Animated landing page with scroll-reveal effects, magnetic buttons, parallax
- Custom hooks: `useReveal`, `useScrollProgress`, `useMagnetic`
- Word-by-word text reveal animation component (`WordReveal`)
- Sections: Hero → Features → How it works (timeline) → CTA
- All buttons: "Commencer" → `/login`, "Créer un compte" → `/signup`

### Login (`/login`)
- Standard email/password form
- On success: stores JWT in `localStorage`, redirects to role-based dashboard

### DashboardCandidat (`/dashboard-candidat`)
- Stats grid: Total CVs, Total envois, Acceptés, Refusés
- Recent applications list with status badges
- Response rate widget
- Link to `/envoi` as primary CTA

### DashboardEntreprise (`/dashboard-entreprise`)
- Stats grid: Offres, Candidatures, Non traitées, Acceptées
- Recent candidates pipeline list
- Status distribution widget
- Link to `/entreprise/offres` as primary CTA

### Cvs (`/cvs`)
- Upload CV files (PDF, DOC, DOCX, JPG, PNG, max 10MB)
- List with AI validation status badge (validated/rejected/pending) + AI score
- AI report modal with recommendations
- Preview and delete actions

### Generateurcv (`/generer-cv`)
- Multi-section form: Personal info (with photo upload), Experiences, Formations, Compétences, Langues, Certifications
- Generates professional A4 PDF using `@react-pdf/renderer`
- PDF layout: dark header with name/title/contacts + optional circular photo, two-column body (skills left, experience right), dark footer
- No inner scroll — uses page natural scroll

### Offers (`/offres`)
- Filter bar: search query, domaine, ville, type_contrat
- Card grid of all available offers
- Links to `/offres/:id` for detail

### OfferDetail (`/offres/:id`)
- Full offer display: description, missions, profil recherché, meta sidebar
- CTA: "Envoyer un CV" → `/envoi`

### Candidatures (`/candidatures`)
- List of all candidat's envois with status badges
- **Alert banner** for envois with available interview slots awaiting selection
- `CreneauxModal`: lets candidat pick an interview slot from available options
- Confirms slot via `POST /creneaux/:id/reserver/`

### Envoi (`/envoi`)
- Complex CV sending workflow
- Features: offer search/filter, CV selection (upload or existing), map picker (Leaflet)
- AI CV validation check before sending
- Sends application via backend

### RendezVous (`/rendez-vous`)
- Lists all reserved interview slots (creneaux where `estReserve: true`)
- Works for both roles (shows candidat_nom for entreprise, entreprise_nom for candidat)
- Cancel interview with confirmation modal
- "Rejoindre" button → `/rendez-vous/:creneauId/meeting`

### EntrepriseOffres (`/entreprise/offres`)
- Create new job offer form (left column)
- List of existing offers (right column)
- Toggle `recevoirCandidatures` per offer
- Archive offers

### EntrepriseCandidatures (`/entreprise/candidatures`)
- Pipeline of received applications
- Status selector per application (envoye/en_attente/accepte/refuse)
- Planning modal: schedule interview slots for accepted candidates
- Draft slots → batch send to candidat
- Reserved slots summary at top

### Profile (`/profil`)
- Edit username, email, nom, prénom, téléphone
- Photo upload with drag & drop, preview, delete
- On photo change, dispatches DOM event `profile:photo-updated` → Navbar updates avatar in real time

---

## Design System

### Color Palette
- **Primary black**: `#0a0a0a`
- **White**: `#ffffff`
- **Cream**: `#f5f0e8`
- **Gray background**: `#f4f4f2`
- **Status green**: `#4ade80` (connected dot, system status)
- **Success**: `emerald` (Tailwind)
- **Error/Refused**: `rose` (Tailwind)
- **Warning/Pending**: `amber` (Tailwind)

### Typography
- **Headings / UI labels**: `Syne` (Google Font) — weights 600, 700, 800
- **Body / descriptions**: `DM Sans` (Google Font) — weights 300, 400, 500

### Component Patterns
- Cards: `rounded-3xl border border-slate-200 bg-white shadow-sm`
- Buttons primary: black pill `bg-black text-white rounded-full`
- Status badges: colored `rounded-full px-3 py-1 text-xs font-semibold`
- Modals: `fixed inset-0 z-50 bg-black/50` backdrop + centered white card

### Animations
- Page entrance: `fadeSlideUp` keyframe animation on `.page-enter`
- Scroll reveal: `.rv` class + `IntersectionObserver` adds `.rv-visible`
- Stagger delays: `.d1` through `.d5` (transition-delay 0.06s increments)
- Card hover: `translateY(-4px)` lift + shadow on `.card-lift`
- Button shimmer: pseudo-element sweep on `.btn-shimmer`
- Navbar logo: rotates to circle on hover

---

## Custom Events (DOM)

| Event Name | Dispatched By | Listened By | Purpose |
|---|---|---|---|
| `profile:photo-updated` | `Profile.jsx` | `Navbar` (Sidebar.jsx) | Sync avatar photo after profile update |

---

## Environment Variables

```env
VITE_API_BASE_URL=https://pfebackend-production-5d5d.up.railway.app
```

---

## Key Conventions & Rules for Gemini

1. **Never add `RequireAuth` to the `/` route** — WelcomePage is always public
2. **After login**, always redirect based on role: `role === "entreprise"` → `/dashboard-entreprise`, else → `/dashboard-candidat`
3. **AppShell** must use `min-h-screen flex flex-col` — never `h-screen overflow-hidden` (breaks natural scroll + footer positioning)
4. **`main` inside AppShell must be `flex-1`** — pushes footer to bottom
5. **No inner scroll containers** on pages — use the page's natural scroll only
6. **All API calls** go through the `api` instance from `src/lib/api.js`, not raw `axios`
7. **Photo updates** must dispatch `profile:photo-updated` custom event for real-time sync
8. **Navbar** component is exported as `Navbar` but the file is `Sidebar.jsx` — import as `import Navbar from "./Sidebar"`
9. **Fonts** must be loaded via Google Fonts import inside `<style>` tags or in `index.css`
10. **CSS is mixed** — Tailwind utility classes + inline `style={{}}` + `<style>` blocks. Do not try to consolidate.
