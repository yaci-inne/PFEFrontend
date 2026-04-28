export const getTokenPayload = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const base64 = token.split(".")[1]?.replace(/-/g, "+").replace(/_/g, "/");
    if (!base64) return null;
    const json = atob(base64);
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
};

export const getUserRole = () => {
  const payload = getTokenPayload();
  return payload?.type || null;
};

export const getUserId = () => {
  const payload = getTokenPayload();
  return payload?.user_id || payload?.userId || payload?.id || null;
};

// Vérifier si le token est valide (non expiré)
export const isTokenValid = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return false;
  
  try {
    const payload = getTokenPayload();
    if (!payload) return false;
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  } catch (error) {
    return false;
  }
};

// Vérifier si l'utilisateur est authentifié
export const isAuthenticated = () => {
  return isTokenValid();
};

// Obtenir le temps restant avant expiration (en millisecondes)
export const getTokenRemainingTime = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return 0;
  
  try {
    const payload = getTokenPayload();
    if (!payload) return 0;
    const exp = payload.exp * 1000;
    const remaining = exp - Date.now();
    return remaining > 0 ? remaining : 0;
  } catch (error) {
    return 0;
  }
};

// Obtenir la date d'expiration du token
export const getTokenExpiryDate = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  
  try {
    const payload = getTokenPayload();
    if (!payload) return null;
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
};

// Déconnexion avec message personnalisé
export const logout = (message = "Déconnexion réussie.") => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  
  if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
    toast.success(message);
    window.location.href = "/login";
  }
};