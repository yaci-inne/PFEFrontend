import { Menu, X } from "lucide-react";

const MenuButton = ({ isOpen, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-[hsl(var(--card))] text-slate-600 shadow-sm hover:bg-slate-50 transition-all duration-200 hover:shadow-md hover:border-slate-300 active:scale-95"
      aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
    >
      {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
};

export default MenuButton;