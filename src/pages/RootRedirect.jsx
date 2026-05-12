import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../lib/auth";
import Welcomepage from "./Welcomepage";

/**
 * RootRedirect
 * - Connecté  → dashboard selon le rôle
 * - Non connecté → affiche la Welcomepage
 */
const RootRedirect = () => {
  const navigate = useNavigate();
  const role = getUserRole();

  useEffect(() => {
    if (isAuthenticated()) {
      if (role === "entreprise") {
        navigate("/dashboard-entreprise", { replace: true });
      } else {
        navigate("/dashboard-candidat", { replace: true });
      }
    }
  }, [navigate, role]);

  // Non connecté → on affiche la Welcomepage
  if (!isAuthenticated()) {
    return <Welcomepage />;
  }

  // Connecté → null pendant la redirection
  return null;
};

export default RootRedirect;