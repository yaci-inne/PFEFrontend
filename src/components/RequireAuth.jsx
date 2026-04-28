import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { getTokenPayload, isTokenValid } from "../lib/auth";

const RequireAuth = ({ children }) => {
  const payload = getTokenPayload();
  const isValid = isTokenValid();
  
  // Vérifier si le token existe ET s'il n'est pas expiré
  if (!payload || !isValid) {
    // Nettoyer les tokens expirés
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    toast.error("Session expirée. Veuillez vous reconnecter.");
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default RequireAuth;