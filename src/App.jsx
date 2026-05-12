import { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { isAuthenticated, logout, getTokenRemainingTime } from "./lib/auth";
import RequireAuth from "./components/RequireAuth";
import RequireRole from "./components/RequireRole";
import RootRedirect from "./pages/RootRedirect";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DashboardCandidat from "./pages/DashboardCandidat";
import DashboardEntreprise from "./pages/DashboardEntreprise";
import Cvs from "./pages/Cvs";
import Offers from "./pages/Offers";
import OfferDetail from "./pages/OfferDetail";
import Candidatures from "./pages/Candidatures";
import EntrepriseOffres from "./pages/EntrepriseOffres";
import EntrepriseCandidatures from "./pages/EntrepriseCandidatures";
import Profile from "./pages/Profile";
import Envoi from "./pages/Envoi.jsx";
import RendezVous from "./pages/RendezVous.jsx";
import MeetingRoom from "./pages/MeetingRoom.jsx";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Generateurcv from "./pages/Generateurcv";

// ── Pages publiques ajoutées ──────────────────────────────────────────────────
import Welcomepage from "./pages/Welcomepage";
import OffresPublic from "./pages/OffresPublic";
import EntreprisesPublic from "./pages/Entreprisespublic";
import CommentCaMarche from "./pages/Commentcamarche";
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const navigate = useNavigate();
  
  // Vérification périodique du token
  useEffect(() => {
    const checkToken = () => {
      if (!isAuthenticated() && localStorage.getItem("accessToken")) {
        logout();
        if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
          navigate("/login");
        }
      }
    };
    
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkToken, 30000);
    
    return () => clearInterval(interval);
  }, [navigate]);
  
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          duration: 5000,
        }}
      />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email/:uidb64/:token/" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uidb64/:token/" element={<ResetPassword />} />

        {/* ── Routes publiques ajoutées ─────────────────────────────────── */}
        <Route path="/welcome"            element={<Welcomepage />} />
        <Route path="/offres-public"      element={<OffresPublic />} />
        <Route path="/entreprises-public" element={<EntreprisesPublic />} />
        <Route path="/comment-ca-marche"  element={<CommentCaMarche />} />
        {/* ──────────────────────────────────────────────────────────────── */}

        <Route
          path="/dashboard-candidat"
          element={
            <RequireAuth>
              <RequireRole roles={["candidat"]}>
                <DashboardCandidat />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/generer-cv"
          element={
            <RequireAuth>
              <RequireRole roles={["candidat"]}>
                <Generateurcv />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard-entreprise"
          element={
            <RequireAuth>
              <RequireRole roles={["entreprise"]}>
                <DashboardEntreprise />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/cvs"
          element={
            <RequireAuth>
              <RequireRole roles={["candidat"]}>
                <Cvs />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/offres"
          element={
            <RequireAuth>
              <RequireRole roles={["candidat"]}>
                <Offers />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/offres/:id"
          element={
            <RequireAuth>
              <RequireRole roles={["candidat"]}>
                <OfferDetail />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/candidatures"
          element={
            <RequireAuth>
              <RequireRole roles={["candidat"]}>
                <Candidatures />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/entreprise/offres"
          element={
            <RequireAuth>
              <RequireRole roles={["entreprise"]}>
                <EntrepriseOffres />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/entreprise/candidatures"
          element={
            <RequireAuth>
              <RequireRole roles={["entreprise"]}>
                <EntrepriseCandidatures />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/profil"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route
          path="/envoi"
          element={
            <RequireAuth>
              <RequireRole roles={["candidat"]}>
                <Envoi />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/rendez-vous"
          element={
            <RequireAuth>
              <RequireRole roles={["candidat", "entreprise"]}>
                <RendezVous />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route
          path="/rendez-vous/:creneauId/meeting"
          element={
            <RequireAuth>
              <RequireRole roles={["candidat", "entreprise"]}>
                <MeetingRoom />
              </RequireRole>
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;