import { ClientsWorkspace } from "@/components/clients-workspace";
import { getCrmSnapshot } from "@/lib/crm";

export default async function ClientesPage() {
  const snapshot = await Promise.resolve(getCrmSnapshot());

  return (
    <main className="crm-shell">
      <ClientsWorkspace plans={snapshot.plans} clients={snapshot.clients} />
    </main>
  );
}
