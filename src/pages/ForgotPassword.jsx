import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import api from "../lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/api/auth/forgot-password/", { email });
      setSubmitted(true);
      toast.success("Instructions envoyées à votre email.");
    } catch (err) {
      toast.success("Si un compte existe, vous recevrez les instructions.");
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Vérifiez votre email</h2>
          <p className="text-gray-600 mb-6">
            Nous avons envoyé les instructions de réinitialisation à <strong>{email}</strong> si un compte existe avec cet email.
          </p>
          <Link
            to="/login"
            className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
          >
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Mot de passe oublié ?</h2>
          <p className="text-gray-600 mt-2">
            Entrez votre email et nous vous enverrons les instructions pour réinitialiser votre mot de passe.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
              placeholder="vous@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-3 rounded-lg transition disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? "Envoi en cours..." : "Envoyer les instructions"}
          </button>

          <div className="text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-black underline">
              Retour à la connexion
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;