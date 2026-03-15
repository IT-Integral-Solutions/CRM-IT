import type { ReactNode } from "react";
import { DatabaseZap, Orbit } from "lucide-react";
import { SidebarNav } from "@/components/sidebar-nav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-frame">
      <aside className="app-sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark brand-mark--small" aria-hidden="true">
            <span className="brand-node brand-node--one" />
            <span className="brand-node brand-node--two" />
            <span className="brand-node brand-node--three" />
            <span className="brand-link brand-link--one" />
            <span className="brand-link brand-link--two" />
            <span className="brand-link brand-link--three" />
          </div>
          <div>
            <p className="brand-overline">IT-Integral Solutions</p>
            <strong>TASS CRM</strong>
          </div>
        </div>
        <SidebarNav />
        <div className="sidebar-note">
          <Orbit size={16} />
          <p>Primera etapa operativa lista para crecer por módulos.</p>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div>
            <p className="section-kicker">Panel interno</p>
            <h1 className="topbar-title">Gestión comercial y soporte de TASS</h1>
          </div>
          <div className="topbar-chip">
            <DatabaseZap size={16} />
            SQLite local activo
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
