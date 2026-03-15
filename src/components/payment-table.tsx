import Link from "next/link";
import { format } from "date-fns";
import { CreditCard } from "lucide-react";
import { markClientInstallmentPaidAction } from "@/app/actions";
import { statusStyles } from "@/lib/crm";
import { formatCurrency } from "@/lib/utils";

type PaymentRow = {
  id: string;
  businessName: string;
  primaryContact: string;
  productName: string;
  planName: string;
  setupAmountCents: number;
  setupPaidAt: Date | null;
  deliveryAmountCents: number;
  deliveryPaidAt: Date | null;
  supportAmountCents: number;
  supportDueAt: Date | null;
  supportStatus: {
    label: string;
    tone: keyof typeof statusStyles;
  };
};

export function PaymentTable({ paymentRows }: { paymentRows: PaymentRow[] }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">Cobranzas</span>
          <h2>Pagos de licencia y soporte</h2>
        </div>
        <CreditCard size={18} />
      </div>
      <div className="payments-table">
        <div className="payments-table__header">
          <span>Cliente</span>
          <span>Plan</span>
          <span>Inicial 50%</span>
          <span>Entrega 50%</span>
          <span>Soporte mensual</span>
        </div>
        {paymentRows.map((row) => (
          <article key={row.id} className="payments-row">
            <div>
              <strong>{row.businessName}</strong>
              <span>{row.primaryContact}</span>
            </div>
            <div>
              <strong>{row.productName}</strong>
              <span>{row.planName}</span>
            </div>
            <div className="payment-cell">
              <strong>{formatCurrency(row.setupAmountCents)}</strong>
              <span className={row.setupPaidAt ? statusStyles.paid : statusStyles.pending}>
                {row.setupPaidAt ? `Cobrado ${format(row.setupPaidAt, "dd/MM")}` : "Pendiente"}
              </span>
              {!row.setupPaidAt ? (
                <form action={markClientInstallmentPaidAction}>
                  <input type="hidden" name="clientId" value={row.id} />
                  <input type="hidden" name="installment" value="setup" />
                  <button type="submit" className="secondary-button">
                    Registrar cobro
                  </button>
                </form>
              ) : null}
            </div>
            <div className="payment-cell">
              <strong>{formatCurrency(row.deliveryAmountCents)}</strong>
              <span className={row.deliveryPaidAt ? statusStyles.paid : statusStyles.pending}>
                {row.deliveryPaidAt ? `Cobrado ${format(row.deliveryPaidAt, "dd/MM")}` : "Pendiente"}
              </span>
              {!row.deliveryPaidAt ? (
                <form action={markClientInstallmentPaidAction}>
                  <input type="hidden" name="clientId" value={row.id} />
                  <input type="hidden" name="installment" value="delivery" />
                  <button type="submit" className="secondary-button">
                    Registrar cobro
                  </button>
                </form>
              ) : null}
            </div>
            <div className="payment-cell">
              <strong>{formatCurrency(row.supportAmountCents)}</strong>
              <span className={statusStyles[row.supportStatus.tone]}>{row.supportStatus.label}</span>
              <span>
                {row.supportDueAt ? `Vence ${format(row.supportDueAt, "dd/MM/yyyy")}` : "Sin fecha"}
              </span>
              <Link href="/soporte" className="secondary-button secondary-button--link">
                Gestionar soporte
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
