import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

const AppShell = ({ title, subtitle, actions, children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-slate-900 overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.08),transparent_40%),radial-gradient(circle_at_80%_0%,hsl(var(--secondary)/0.08),transparent_35%),radial-gradient(circle_at_90%_80%,hsl(var(--accent)/0.08),transparent_35%)]" />
      <div className="flex">
        <Sidebar
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        <div className="flex-1 min-w-0 overflow-x-hidden">
          <Topbar
            title={title}
            subtitle={subtitle}
            actions={actions}
            onMenuOpen={() => setIsMobileMenuOpen(true)}
          />
          <main className="px-4 pb-10 pt-6 lg:px-10">
            <div className="mx-auto max-w-6xl w-full animate-fade-up">{children}</div>
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AppShell;