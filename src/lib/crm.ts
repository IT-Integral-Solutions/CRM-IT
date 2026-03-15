import { differenceInCalendarDays } from "date-fns";
import { getClients, getOpenSupportInvoices, getPlans } from "@/lib/database";

export const statusStyles = {
  active: "status status--active",
  dueSoon: "status status--warn",
  expired: "status status--danger",
  paid: "status status--active",
  pending: "status status--warn",
} as const;

export function getSupportHealth(dueAt: Date, paidAt: Date | null) {
  if (paidAt) {
    return { label: "Al día", tone: "active" as const };
  }

  const remainingDays = differenceInCalendarDays(dueAt, new Date());

  if (remainingDays < 0) {
    return { label: "Sin soporte", tone: "expired" as const };
  }

  if (remainingDays <= 5) {
    return { label: `Vence en ${remainingDays} días`, tone: "dueSoon" as const };
  }

  return { label: "Activo", tone: "active" as const };
}

export function getCrmSnapshot() {
  const plans = getPlans();
  const clients = getClients();
  const invoices = getOpenSupportInvoices(8);

  const metrics = clients.reduce(
    (acc, client) => {
      acc.totalClients += 1;
      acc.totalRevenue += client.setupAmountCents + client.deliveryAmountCents;

      if (client.setupPaidAt) {
        acc.collectedRevenue += client.setupAmountCents;
      }

      if (client.deliveryPaidAt) {
        acc.collectedRevenue += client.deliveryAmountCents;
      }

      const currentInvoice = client.supportInvoices[0];

      if (!currentInvoice) {
        return acc;
      }

      const supportHealth = getSupportHealth(currentInvoice.dueAt, currentInvoice.paidAt);

      if (supportHealth.tone === "expired") {
        acc.expiredSupport += 1;
      } else if (supportHealth.tone === "dueSoon") {
        acc.supportDueSoon += 1;
      } else {
        acc.activeSupport += 1;
      }

      return acc;
    },
    {
      totalClients: 0,
      totalRevenue: 0,
      collectedRevenue: 0,
      activeSupport: 0,
      supportDueSoon: 0,
      expiredSupport: 0,
    },
  );

  const planStats = plans.map((plan) => {
    const planClients = clients.filter((client) => client.planId === plan.id);
    const monthlyRecurring = planClients.length * plan.supportPriceCents;

    return {
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description,
      clients: planClients.length,
      revenue: planClients.reduce(
        (sum, client) => sum + client.setupAmountCents + client.deliveryAmountCents,
        0,
      ),
      monthlyRecurring,
      support: plan.supportPriceCents,
      price: plan.licensePriceCents,
    };
  });

  return {
    plans,
    clients,
    invoices,
    metrics,
    planStats,
    potentialMrr: planStats.reduce((sum, plan) => sum + plan.monthlyRecurring, 0),
  };
}
