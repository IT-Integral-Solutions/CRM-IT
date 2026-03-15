import { CircleDollarSign, LifeBuoy, ShieldAlert, Sparkles, Users2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Metrics = {
  totalRevenue: number;
  collectedRevenue: number;
  totalClients: number;
  activeSupport: number;
  expiredSupport: number;
};

export function DashboardHero({ metrics }: { metrics: Metrics }) {
  return (
    <section className="hero-panel">
      <div className="hero-copy">
        <div className="hero-copy__block">
          <span className="eyebrow">
            <Sparkles size={14} />
            Panel interno
          </span>
          <h2 className="hero-title">Sistema de Administracion y Gestion</h2>
        </div>
      </div>

      <div className="hero-highlight">
        <div className="hero-highlight__card">
          <p>Ingresos contratados</p>
          <strong>{formatCurrency(metrics.totalRevenue)}</strong>
          <span>{formatCurrency(metrics.collectedRevenue)} ya cobrados</span>
        </div>
        <div className="hero-highlight__grid">
          <article>
            <Users2 size={18} />
            <strong>{metrics.totalClients}</strong>
            <span>Clientes activos</span>
          </article>
          <article>
            <LifeBuoy size={18} />
            <strong>{metrics.activeSupport}</strong>
            <span>Soportes al día</span>
          </article>
          <article>
            <ShieldAlert size={18} />
            <strong>{metrics.expiredSupport}</strong>
            <span>Sin soporte</span>
          </article>
          <article>
            <CircleDollarSign size={18} />
            <strong>{formatCurrency(metrics.collectedRevenue)}</strong>
            <span>Cobranza acumulada</span>
          </article>
        </div>
      </div>
    </section>
  );
}
