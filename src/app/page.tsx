import { addDays, differenceInCalendarDays, format } from "date-fns";
import {
  AlertTriangle,
  BadgeDollarSign,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Layers3,
  LifeBuoy,
  Plus,
  ShieldAlert,
  Sparkles,
  Users2,
} from "lucide-react";
import { createClientAction, markSupportInvoicePaidAction } from "@/app/actions";
import { getClients, getOpenSupportInvoices, getPlans } from "@/lib/database";
import { cn, formatCurrency } from "@/lib/utils";

const statusStyles = {
  active: "status status--active",
  dueSoon: "status status--warn",
  expired: "status status--danger",
  paid: "status status--active",
  pending: "status status--warn",
  overdue: "status status--danger",
} as const;

function getSupportHealth(dueAt: Date, paidAt: Date | null) {
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

export default async function Home() {
  const [plans, clients, invoices] = await Promise.all([
    Promise.resolve(getPlans()),
    Promise.resolve(getClients()),
    Promise.resolve(getOpenSupportInvoices(8)),
  ]);

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

      if (currentInvoice?.paidAt) {
        acc.supportMonthlyCollected += currentInvoice.amountCents;
      }

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
      supportMonthlyCollected: 0,
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
      description: plan.description,
      clients: planClients.length,
      revenue:
        planClients.reduce(
          (sum, client) => sum + client.setupAmountCents + client.deliveryAmountCents,
          0,
        ) || 0,
      monthlyRecurring,
      support: plan.supportPriceCents,
      price: plan.licensePriceCents,
    };
  });

  return (
    <main className="crm-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={14} />
            CRM interno de IT-Integral
          </span>
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true">
              <span className="brand-node brand-node--one" />
              <span className="brand-node brand-node--two" />
              <span className="brand-node brand-node--three" />
              <span className="brand-link brand-link--one" />
              <span className="brand-link brand-link--two" />
              <span className="brand-link brand-link--three" />
            </div>
            <div>
              <p className="brand-overline">IT-Integral Solutions</p>
              <h1>TASS Client Operations Hub</h1>
            </div>
          </div>
          <p className="hero-text">
            Base inicial para gestionar clientes, ventas, entregas 50/50, soporte
            mensual y métricas comerciales de TASS Starter, Pro y Elite.
          </p>
          <div className="hero-badges">
            <span>Robusto</span>
            <span>Escalable</span>
            <span>Listo para crecer a PostgreSQL</span>
          </div>
        </div>

        <div className="hero-highlight">
          <div className="hero-highlight__card">
            <p>Ingresos contratados</p>
            <strong>{formatCurrency(metrics.totalRevenue)}</strong>
            <span>{formatCurrency(metrics.collectedRevenue)} ya cobrados</span>
          </div>
          <div className="hero-highlight__grid">
            <article>
              <Users2 size={18} />
              <strong>{metrics.totalClients}</strong>
              <span>Clientes activos</span>
            </article>
            <article>
              <LifeBuoy size={18} />
              <strong>{metrics.activeSupport}</strong>
              <span>Soportes al día</span>
            </article>
            <article>
              <ShieldAlert size={18} />
              <strong>{metrics.expiredSupport}</strong>
              <span>Sin soporte</span>
            </article>
            <article>
              <CircleDollarSign size={18} />
              <strong>{formatCurrency(metrics.supportMonthlyCollected)}</strong>
              <span>Cobranza mensual</span>
            </article>
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <article className="metric-card">
          <div className="metric-card__icon">
            <BadgeDollarSign size={18} />
          </div>
          <div>
            <p>Revenue total contratado</p>
            <strong>{formatCurrency(metrics.totalRevenue)}</strong>
            <span>Licencias comprometidas por todos los paquetes</span>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-card__icon">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <p>Revenue efectivamente cobrado</p>
            <strong>{formatCurrency(metrics.collectedRevenue)}</strong>
            <span>Incluye pago inicial y entrega final de cada cliente</span>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-card__icon">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p>Soportes por vencer</p>
            <strong>{metrics.supportDueSoon}</strong>
            <span>Clientes con vencimiento en los próximos 5 días</span>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-card__icon">
            <BarChart3 size={18} />
          </div>
          <div>
            <p>MRR de soporte</p>
            <strong>
              {formatCurrency(
                planStats.reduce((sum, plan) => sum + plan.monthlyRecurring, 0),
              )}
            </strong>
            <span>Ingreso recurrente mensual potencial</span>
          </div>
        </article>
      </section>

      <section className="workspace-grid">
        <div className="panel panel--form">
          <div className="panel-heading">
            <div>
              <span className="section-kicker">Alta comercial</span>
              <h2>Registrar nuevo cliente</h2>
            </div>
            <Plus size={18} />
          </div>
          <form action={createClientAction} className="client-form">
            <label>
              Agencia o cliente
              <input name="businessName" placeholder="Ej. Patagonia Dreams" required />
            </label>
            <label>
              Contacto principal
              <input name="primaryContact" placeholder="Nombre del responsable" required />
            </label>
            <div className="form-row">
              <label>
                Email
                <input name="email" type="email" placeholder="ventas@agencia.com" required />
              </label>
              <label>
                Teléfono
                <input name="phone" placeholder="+54 9 ..." />
              </label>
            </div>
            <div className="form-row">
              <label>
                Ciudad
                <input name="city" placeholder="Ciudad" />
              </label>
              <label>
                País
                <input name="country" placeholder="País" defaultValue="Argentina" />
              </label>
            </div>
            <div className="form-row">
              <label>
                Plan contratado
                <select name="planId" required defaultValue={plans[0]?.id}>
                  {plans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} · {formatCurrency(plan.licensePriceCents)} · soporte{" "}
                      {formatCurrency(plan.supportPriceCents)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Fecha estimada de entrega
                <input
                  name="goLiveDate"
                  type="date"
                  defaultValue={format(addDays(new Date(), 21), "yyyy-MM-dd")}
                />
              </label>
            </div>
            <div className="form-row form-row--checks">
              <label className="checkbox">
                <input name="setupPaid" type="checkbox" />
                <span>50% inicial ya cobrado</span>
              </label>
              <label className="checkbox">
                <input name="deliveryPaid" type="checkbox" />
                <span>50% de entrega ya cobrado</span>
              </label>
            </div>
            <label>
              Notas operativas
              <textarea
                name="notes"
                rows={4}
                placeholder="Observaciones comerciales, expectativas o requisitos especiales..."
              />
            </label>
            <button type="submit" className="primary-button">
              Crear cliente y primer ciclo de soporte
            </button>
          </form>
        </div>

        <div className="stack">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <span className="section-kicker">Productos</span>
                <h2>Estadísticas por paquete</h2>
              </div>
              <Layers3 size={18} />
            </div>
            <div className="plan-grid">
              {planStats.map((plan) => (
                <article key={plan.id} className={cn("plan-card", `plan-card--${plan.name.toLowerCase()}`)}>
                  <div className="plan-card__top">
                    <span>{plan.name}</span>
                    <strong>{formatCurrency(plan.price)}</strong>
                  </div>
                  <p>{plan.description}</p>
                  <dl>
                    <div>
                      <dt>Clientes</dt>
                      <dd>{plan.clients}</dd>
                    </div>
                    <div>
                      <dt>Facturación</dt>
                      <dd>{formatCurrency(plan.revenue)}</dd>
                    </div>
                    <div>
                      <dt>Soporte mensual</dt>
                      <dd>{formatCurrency(plan.support)}</dd>
                    </div>
                    <div>
                      <dt>MRR potencial</dt>
                      <dd>{formatCurrency(plan.monthlyRecurring)}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
          </div>

          <div className="panel">
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
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">Clientes</span>
            <h2>Base operativa de TASS</h2>
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
                  <strong>{client.plan.name}</strong>
                  <span>{client.email}</span>
                </div>
                <div>
                  <strong>{formatCurrency(client.setupAmountCents)}</strong>
                  <span className={client.setupPaidAt ? statusStyles.paid : statusStyles.pending}>
                    {client.setupPaidAt ? "Cobrado" : "Pendiente"}
                  </span>
                </div>
                <div>
                  <strong>{formatCurrency(client.deliveryAmountCents)}</strong>
                  <span
                    className={client.deliveryPaidAt ? statusStyles.paid : statusStyles.pending}
                  >
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
    </main>
  );
}
