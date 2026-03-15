import { getClients, getOpenSupportInvoices, getPlans } from "@/lib/database";
import { getSupportHealth } from "@/lib/support";

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
      productName: plan.productName,
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

  const paymentRows = clients.map((client) => {
    const openSupportInvoice = client.supportInvoices[0] ?? null;

    return {
      id: client.id,
      businessName: client.businessName,
      primaryContact: client.primaryContact,
      productName: client.plan.productName,
      planName: client.plan.name,
      setupAmountCents: client.setupAmountCents,
      setupPaidAt: client.setupPaidAt,
      deliveryAmountCents: client.deliveryAmountCents,
      deliveryPaidAt: client.deliveryPaidAt,
      supportAmountCents: client.plan.supportPriceCents,
      supportDueAt: openSupportInvoice?.dueAt ?? client.supportNextDueAt,
      supportPaidAt: openSupportInvoice?.paidAt ?? null,
      supportStatus: openSupportInvoice
        ? getSupportHealth(openSupportInvoice.dueAt, openSupportInvoice.paidAt)
        : { label: "Sin ciclo", tone: "dueSoon" as const },
    };
  });

  const payments = paymentRows.reduce(
    (acc, payment) => {
      acc.totalSetup += payment.setupAmountCents;
      acc.totalDelivery += payment.deliveryAmountCents;

      if (payment.setupPaidAt) {
        acc.collectedSetup += payment.setupAmountCents;
      } else {
        acc.pendingSetup += payment.setupAmountCents;
      }

      if (payment.deliveryPaidAt) {
        acc.collectedDelivery += payment.deliveryAmountCents;
      } else {
        acc.pendingDelivery += payment.deliveryAmountCents;
      }

      return acc;
    },
    {
      totalSetup: 0,
      totalDelivery: 0,
      collectedSetup: 0,
      collectedDelivery: 0,
      pendingSetup: 0,
      pendingDelivery: 0,
    },
  );

  return {
    plans,
    clients,
    invoices,
    metrics,
    planStats,
    paymentRows,
    payments,
    potentialMrr: planStats.reduce((sum, plan) => sum + plan.monthlyRecurring, 0),
  };
}
