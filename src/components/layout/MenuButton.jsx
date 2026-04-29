// components/layout/MenuButton.jsx
import { Menu, X } from "lucide-react";

const MenuButton = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-[hsl(var(--card))] shadow-lg border border-slate-200"
      aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
    >
      {isOpen ? <X className="h-5 w-5 text-slate-600" /> : <Menu className="h-5 w-5 text-slate-600" />}
    </button>
  );
};

export default MenuButton;