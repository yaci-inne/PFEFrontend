import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";
import MenuButton from "./MenuButton";

const AppShell = ({ title, subtitle, actions, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f8f6] text-slate-900">
      {/* MenuButton pour mobile */}
      <MenuButton 
        isOpen={isMobileMenuOpen} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
      />
      
      <div className="flex min-h-screen">
        {/* Sidebar - fixe, ne scroll pas */}
        <div className="fixed top-0 left-0 h-full z-30">
          <Sidebar 
            isMobileMenuOpen={isMobileMenuOpen} 
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
          />
        </div>
        
        {/* Contenu principal - scrollable, avec marge gauche */}
        <div className="flex-1 min-w-0 overflow-x-hidden lg:ml-64 transition-all duration-300">
          <Topbar
            title={title}
            subtitle={subtitle}
            actions={actions}
            onMenuOpen={() => setIsMobileMenuOpen(true)}
          />
          <main className="px-4 pb-10 pt-6 lg:px-10">
            <div className="mx-auto max-w-6xl w-full animate-fade-up">
              {children}
            </div>
          </main>
          <Footer />
        </div>
      </div>

      <style>{`
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-up {
          animation: fade-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AppShell;