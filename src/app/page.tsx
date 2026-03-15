import { DashboardHero } from "@/components/dashboard-hero";
import { MetricsGrid } from "@/components/metrics-grid";
import { PlanGrid } from "@/components/plan-grid";
import { SupportList } from "@/components/support-list";
import { getCrmSnapshot } from "@/lib/crm";

export default async function Home() {
  const snapshot = await Promise.resolve(getCrmSnapshot());

  return (
    <main className="crm-shell">
      <DashboardHero metrics={snapshot.metrics} />
      <MetricsGrid metrics={snapshot.metrics} potentialMrr={snapshot.potentialMrr} />
      <div className="stack">
        <PlanGrid planStats={snapshot.planStats} />
        <SupportList invoices={snapshot.invoices} />
      </div>
    </main>
  );
}
