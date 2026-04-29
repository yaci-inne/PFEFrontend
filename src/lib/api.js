import axios from "axios";
import { toast } from "sonner";
import { getApiError } from "./apiError";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
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
      const successMessage = response?.config?.successMessage || "Operation effectuee avec succes.";
      toast.success(successMessage);
    }

    return response;
  },
  (error) => {
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const shouldNotify = error?.config?.showErrorToast !== false;
    if (shouldNotify) {
      const apiError = getApiError(error);
      toast.error(apiError.message, {
        description: apiError.details[0] || apiError.code,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
