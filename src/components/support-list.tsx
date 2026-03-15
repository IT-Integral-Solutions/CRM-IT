import { format } from "date-fns";
import { LifeBuoy } from "lucide-react";
import { markSupportInvoicePaidAction } from "@/app/actions";
import { getSupportHealth, statusStyles } from "@/lib/support";
import { formatCurrency } from "@/lib/utils";

type SupportInvoice = {
  id: string;
  amountCents: number;
  dueAt: Date;
  paidAt: Date | null;
  client: {
    businessName: string;
    plan: {
      name: string;
    };
  };
};

export function SupportList({ invoices }: { invoices: SupportInvoice[] }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">Vencimientos</span>
          <h2>Seguimiento de soporte</h2>
        </div>
        <LifeBuoy size={18} />
      </div>
      <div className="invoice-list">
        {invoices.map((invoice) => {
          const health = getSupportHealth(invoice.dueAt, invoice.paidAt);

          return (
            <article key={invoice.id} className="invoice-item">
              <div>
                <p>{invoice.client.businessName}</p>
                <span>
                  {invoice.client.plan.name} · vence {format(invoice.dueAt, "dd/MM/yyyy")}
                </span>
              </div>
              <div className="invoice-item__meta">
                <strong>{formatCurrency(invoice.amountCents)}</strong>
                <span className={statusStyles[health.tone]}>{health.label}</span>
              </div>
              <form action={markSupportInvoicePaidAction}>
                <input type="hidden" name="invoiceId" value={invoice.id} />
                <button type="submit" className="secondary-button">
                  Marcar pago
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}
