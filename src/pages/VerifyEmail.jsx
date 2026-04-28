import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import api from "../lib/api";

const VerifyEmail = () => {
  const { uidb64, token } = useParams();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.post("/api/auth/verify-email/", { uidb64, token });
        setStatus("success");
        setMessage(response.data?.message || "Email vérifié avec succès ! Vous pouvez maintenant vous connecter.");
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.response?.data?.error?.message || "Lien de vérification invalide ou expiré.";
        
        // Check if the error is because account is already active
        if (errorMessage.includes("déjà activé") || errorMessage.includes("already activated")) {
          setStatus("success");
          setMessage("Compte déjà activé. Vous pouvez vous connecter.");
        } else {
          setStatus("error");
          setMessage(errorMessage);
        }
      }
    };

    if (uidb64 && token) {
      verifyEmail();
    }
  }, [uidb64, token]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === "verifying" && (
          <>
            <Loader className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Vérification en cours...</h2>
            <p className="text-gray-600">Veuillez patienter pendant la vérification de votre email.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Vérifié !</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/login"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Se connecter
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Vérification Échouée</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <Link
              to="/signup"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
            >
              Créer un nouveau compte
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;