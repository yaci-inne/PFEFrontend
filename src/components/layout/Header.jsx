import { Sparkles } from "lucide-react";
import { getTokenPayload, getUserRole } from "../../lib/auth";

const Header = () => {
  const payload = getTokenPayload();
  const username = payload?.username || "Utilisateur";
  const role = getUserRole() || "utilisateur";

  return (
    <header className="border-b border-slate-200/70 bg-[hsl(var(--card))]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--primary))] text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            
            <p className="text-sm font-semibold text-slate-900">
              Espace {role} • {username}
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-[hsl(var(--background))] px-4 py-2 text-xs text-slate-600 md:flex">
          Automatisation intelligente • Suivi en temps reel
        </div>
      </div>
    </header>
  );
};

export default Header;
