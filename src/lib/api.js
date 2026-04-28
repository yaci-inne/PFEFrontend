import axios from "axios";
import { toast } from "sonner";
import { getApiError } from "./apiError";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes timeout
});

// Vérifier si le token est expiré
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch (error) {
    return true;
  }
};

// Fonction de déconnexion avec message
const logout = (message = "Session expirée. Veuillez vous reconnecter.") => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  
  if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
    toast.error(message);
    window.location.href = "/login";
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  
  // Vérifier si le token est expiré avant d'envoyer la requête
  if (token && isTokenExpired(token)) {
    logout();
    return Promise.reject({ response: { status: 401, data: { message: "Token expiré" } } });
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const method = response?.config?.method?.toLowerCase();
    const shouldNotifySuccess = response?.config?.showSuccessToast !== false;

    if (shouldNotifySuccess && ["post", "put", "patch", "delete"].includes(method)) {
      const successMessage = response?.config?.successMessage || "Opération effectuée avec succès.";
      toast.success(successMessage);
    }

    return response;
  },
  async (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const status = error.response?.status;
    
    // Gestion 401 - token expiré
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem("refreshToken");
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem("accessToken", access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          logout("Session expirée. Veuillez vous reconnecter.");
          return Promise.reject(refreshError);
        }
      } else {
        logout("Session expirée. Veuillez vous reconnecter.");
        return Promise.reject(error);
      }
    }

    const shouldNotify = error?.config?.showErrorToast !== false;
    if (shouldNotify && status !== 401) {
      const apiError = getApiError(error);
      toast.error(apiError.message, {
        description: apiError.details[0] || apiError.code,
      });
    }

    return Promise.reject(error);
  }
);

export default api;