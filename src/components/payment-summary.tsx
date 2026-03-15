import { CheckCircle2, CircleDollarSign, Clock3, Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type Payments = {
  collectedSetup: number;
  collectedDelivery: number;
  pendingSetup: number;
  pendingDelivery: number;
};

export function PaymentSummary({ payments }: { payments: Payments }) {
  return (
    <section className="metrics-grid">
      <article className="metric-card">
        <div className="metric-card__icon">
          <CheckCircle2 size={18} />
        </div>
        <div>
          <p>Cobrado inicial</p>
          <strong>{formatCurrency(payments.collectedSetup)}</strong>
          <span>50% ya ingresado al momento de la contratación</span>
        </div>
      </article>
      <article className="metric-card">
        <div className="metric-card__icon">
          <CircleDollarSign size={18} />
        </div>
        <div>
          <p>Cobrado entrega</p>
          <strong>{formatCurrency(payments.collectedDelivery)}</strong>
          <span>50% final al entregar la solución contratada</span>
        </div>
      </article>
      <article className="metric-card">
        <div className="metric-card__icon">
          <Clock3 size={18} />
        </div>
        <div>
          <p>Saldo inicial pendiente</p>
          <strong>{formatCurrency(payments.pendingSetup)}</strong>
          <span>Clientes que todavía no abonaron el anticipo</span>
        </div>
      </article>
      <article className="metric-card">
        <div className="metric-card__icon">
          <Wallet size={18} />
        </div>
        <div>
          <p>Saldo entrega pendiente</p>
          <strong>{formatCurrency(payments.pendingDelivery)}</strong>
          <span>Monto a cobrar cuando se entregue cada implementación</span>
        </div>
      </article>
    </section>
  );
}
