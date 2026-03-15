import {
  AlertTriangle,
  BadgeDollarSign,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Metrics = {
  totalRevenue: number;
  collectedRevenue: number;
  supportDueSoon: number;
};

export function MetricsGrid({
  metrics,
  potentialMrr,
}: {
  metrics: Metrics;
  potentialMrr: number;
}) {
  return (
    <section className="metrics-grid">
      <article className="metric-card">
        <div className="metric-card__icon">
          <BadgeDollarSign size={18} />
        </div>
        <div>
          <p>Revenue total contratado</p>
          <strong>{formatCurrency(metrics.totalRevenue)}</strong>
          <span>Licencias comprometidas por todos los paquetes</span>
        </div>
      </article>
      <article className="metric-card">
        <div className="metric-card__icon">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <p>Revenue efectivamente cobrado</p>
          <strong>{formatCurrency(metrics.collectedRevenue)}</strong>
          <span>Incluye pago inicial y entrega final de cada cliente</span>
        </div>
      </article>
      <article className="metric-card">
        <div className="metric-card__icon">
          <AlertTriangle size={18} />
        </div>
        <div>
          <p>Soportes por vencer</p>
          <strong>{metrics.supportDueSoon}</strong>
          <span>Clientes con vencimiento en los próximos 5 días</span>
        </div>
      </article>
      <article className="metric-card">
        <div className="metric-card__icon">
          <BarChart3 size={18} />
        </div>
        <div>
          <p>MRR de soporte</p>
          <strong>{formatCurrency(potentialMrr)}</strong>
          <span>Ingreso recurrente mensual potencial</span>
        </div>
      </article>
    </section>
  );
}
