import { Layers3 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

type PlanStat = {
  id: string;
  name: string;
  productName: string;
  description: string;
  clients: number;
  revenue: number;
  support: number;
  monthlyRecurring: number;
  price: number;
};

export function PlanGrid({ planStats }: { planStats: PlanStat[] }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">Productos</span>
          <h2>Estadísticas por paquete</h2>
        </div>
        <Layers3 size={18} />
      </div>
      <div className="plan-grid">
        {planStats.map((plan) => (
          <article key={plan.id} className={cn("plan-card", `plan-card--${plan.name.toLowerCase()}`)}>
            <div className="plan-card__top">
              <span>
                {plan.productName} · {plan.name}
              </span>
              <strong>{formatCurrency(plan.price)}</strong>
            </div>
            <p>{plan.description}</p>
            <dl>
              <div>
                <dt>Clientes</dt>
                <dd>{plan.clients}</dd>
              </div>
              <div>
                <dt>Facturación</dt>
                <dd>{formatCurrency(plan.revenue)}</dd>
              </div>
              <div>
                <dt>Soporte mensual</dt>
                <dd>{formatCurrency(plan.support)}</dd>
              </div>
              <div>
                <dt>MRR potencial</dt>
                <dd>{formatCurrency(plan.monthlyRecurring)}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
