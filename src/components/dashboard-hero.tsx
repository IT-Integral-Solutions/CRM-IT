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
        <span className="eyebrow">
          <Sparkles size={14} />
          CRM interno de IT-Integral
        </span>
        <div className="hero-copy__block">
          <p className="brand-overline">IT-Integral Solutions</p>
          <h2 className="hero-title">TASS Client Operations Hub</h2>
        </div>
        <p className="hero-text">
          Base inicial para gestionar clientes, ventas, entregas 50/50, soporte mensual
          y métricas comerciales de TASS Starter, Pro y Elite.
        </p>
        <div className="hero-badges">
          <span>Robusto</span>
          <span>Escalable</span>
          <span>Listo para crecer</span>
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
