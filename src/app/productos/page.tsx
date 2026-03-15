import { MetricsGrid } from "@/components/metrics-grid";
import { PlanGrid } from "@/components/plan-grid";
import { getCrmSnapshot } from "@/lib/crm";

export default async function ProductosPage() {
  const snapshot = await Promise.resolve(getCrmSnapshot());

  return (
    <main className="crm-shell">
      <section className="page-intro panel">
        <span className="section-kicker">Productos</span>
        <h2>Desempeño comercial por producto y paquete</h2>
        <p>
          Vista orientada a entender cuántos clientes tiene cada solución de IT Integral
          Solution, cuánto factura cada paquete y cuál es el ingreso recurrente potencial
          del soporte mensual.
        </p>
      </section>
      <MetricsGrid metrics={snapshot.metrics} potentialMrr={snapshot.potentialMrr} />
      <PlanGrid planStats={snapshot.planStats} />
    </main>
  );
}
