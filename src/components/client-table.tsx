import { format } from "date-fns";
import { Users2 } from "lucide-react";
import { getSupportHealth, statusStyles } from "@/lib/crm";
import { formatCurrency } from "@/lib/utils";

type Client = {
  id: string;
  businessName: string;
  primaryContact: string;
  email: string;
  country: string | null;
  setupAmountCents: number;
  setupPaidAt: Date | null;
  deliveryAmountCents: number;
  deliveryPaidAt: Date | null;
  plan: {
    productName: string;
    name: string;
    supportPriceCents: number;
  };
  supportInvoices: Array<{
    dueAt: Date;
    paidAt: Date | null;
  }>;
};

export function ClientTable({
  clients,
  title = "Base operativa de clientes y productos",
}: {
  clients: Client[];
  title?: string;
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="section-kicker">Clientes</span>
          <h2>{title}</h2>
        </div>
        <Users2 size={18} />
      </div>
      <div className="client-table">
        <div className="client-table__header">
          <span>Cliente</span>
          <span>Plan</span>
          <span>Pago inicial</span>
          <span>Pago entrega</span>
          <span>Soporte</span>
          <span>Próximo vencimiento</span>
        </div>
        {clients.map((client) => {
          const currentInvoice = client.supportInvoices[0];
          const supportHealth = currentInvoice
            ? getSupportHealth(currentInvoice.dueAt, currentInvoice.paidAt)
            : { label: "Sin ciclo", tone: "dueSoon" as const };

          return (
            <article key={client.id} className="client-row">
              <div>
                <strong>{client.businessName}</strong>
                <span>{client.primaryContact}</span>
              </div>
              <div>
                <strong>{client.plan.productName}</strong>
                <span>
                  {client.plan.name} · {client.email}
                </span>
              </div>
              <div>
                <strong>{formatCurrency(client.setupAmountCents)}</strong>
                <span className={client.setupPaidAt ? statusStyles.paid : statusStyles.pending}>
                  {client.setupPaidAt ? "Cobrado" : "Pendiente"}
                </span>
              </div>
              <div>
                <strong>{formatCurrency(client.deliveryAmountCents)}</strong>
                <span className={client.deliveryPaidAt ? statusStyles.paid : statusStyles.pending}>
                  {client.deliveryPaidAt ? "Cobrado" : "Pendiente"}
                </span>
              </div>
              <div>
                <strong>{formatCurrency(client.plan.supportPriceCents)}</strong>
                <span className={statusStyles[supportHealth.tone]}>{supportHealth.label}</span>
              </div>
              <div>
                <strong>
                  {currentInvoice ? format(currentInvoice.dueAt, "dd/MM/yyyy") : "Sin fecha"}
                </strong>
                <span>{client.country}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
