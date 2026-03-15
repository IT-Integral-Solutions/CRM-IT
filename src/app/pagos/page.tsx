import { PaymentSummary } from "@/components/payment-summary";
import { PaymentTable } from "@/components/payment-table";
import { SupportList } from "@/components/support-list";
import { getCrmSnapshot } from "@/lib/crm";

export default async function PagosPage() {
  const snapshot = await Promise.resolve(getCrmSnapshot());

  return (
    <main className="crm-shell">
      <section className="page-intro panel">
        <span className="section-kicker">Pagos</span>
        <h2>Cobranza de licencias y renovaciones mensuales</h2>
        <p>
          Acá queda concentrado el flujo financiero mínimo de la primera etapa: anticipo,
          saldo contra entrega y el soporte mensual que habilita actualizaciones y cambios.
        </p>
      </section>
      <PaymentSummary payments={snapshot.payments} />
      <div className="stack">
        <PaymentTable paymentRows={snapshot.paymentRows} />
        <SupportList invoices={snapshot.invoices} />
      </div>
    </main>
  );
}
