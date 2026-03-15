import { ClientForm } from "@/components/client-form";
import { ClientTable } from "@/components/client-table";
import { getCrmSnapshot } from "@/lib/crm";

export default async function ClientesPage() {
  const snapshot = await Promise.resolve(getCrmSnapshot());

  return (
    <main className="crm-shell">
      <section className="page-intro panel">
        <span className="section-kicker">Clientes</span>
        <h2>Altas, contratos y seguimiento comercial</h2>
        <p>
          Desde acá podés registrar nuevas agencias, ver el estado de cobro inicial y
          final, y seguir el próximo vencimiento de soporte de cada cuenta.
        </p>
      </section>
      <section className="workspace-grid">
        <ClientForm plans={snapshot.plans} />
        <ClientTable clients={snapshot.clients} title="Clientes y estado contractual" />
      </section>
    </main>
  );
}
