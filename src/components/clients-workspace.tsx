"use client";

import { useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { ClientForm } from "@/components/client-form";
import { ClientTable } from "@/components/client-table";

type Plan = {
  id: string;
  name: string;
  productName: string;
  productSlug: string;
  customerType: string;
  licensePriceCents: number;
  supportPriceCents: number;
};

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

export function ClientsWorkspace({
  plans,
  clients,
}: {
  plans: Plan[];
  clients: Client[];
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredClients = clients.filter((client) => {
    if (!normalizedQuery) {
      return true;
    }

    return [
      client.businessName,
      client.primaryContact,
      client.email,
      client.plan.productName,
      client.plan.name,
      client.country ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery);
  });

  return (
    <section className="stack">
      <section className="panel toolbar-panel">
        <div className="toolbar-panel__left">
          <span className="section-kicker">Clientes</span>
          <h2>Altas, contratos y seguimiento comercial</h2>
        </div>
        <div className="toolbar-panel__actions">
          <label className="search-box">
            <Search size={16} />
            <input
              type="search"
              placeholder="Buscar cliente, contacto, email o producto..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="primary-button primary-button--compact"
            onClick={() => setIsFormOpen((current) => !current)}
          >
            {isFormOpen ? <X size={16} /> : <Plus size={16} />}
            {isFormOpen ? "Cerrar alta" : "Nuevo cliente"}
          </button>
        </div>
      </section>

      {isFormOpen ? (
        <ClientForm plans={plans} onSubmitStart={() => setIsFormOpen(false)} />
      ) : null}

      <ClientTable
        clients={filteredClients}
        title={normalizedQuery ? `Resultados: ${filteredClients.length}` : "Clientes y estado contractual"}
      />
    </section>
  );
}
