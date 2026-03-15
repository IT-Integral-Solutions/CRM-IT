import { SupportList } from "@/components/support-list";
import { getCrmSnapshot } from "@/lib/crm";

export default async function SoportePage() {
  const snapshot = await Promise.resolve(getCrmSnapshot());

  return (
    <main className="crm-shell">
      <section className="page-intro panel">
        <span className="section-kicker">Soporte</span>
        <h2>Vencimientos mensuales y membresías activas</h2>
        <p>
          El uso del software no se corta, pero acá queda claro quién mantiene el soporte
          vigente para actualizaciones, cambios y nuevas intervenciones.
        </p>
      </section>
      <SupportList invoices={snapshot.invoices} />
    </main>
  );
}
