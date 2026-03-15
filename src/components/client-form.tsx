"use client";

import { useState } from "react";
import { addDays, format } from "date-fns";
import { Plus } from "lucide-react";
import { createClientAction } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  productName: string;
  productSlug: string;
  customerType: string;
  licensePriceCents: number;
  supportPriceCents: number;
};

const customerTypes = [
  { value: "travel_agency", label: "Agencia de viajes" },
  { value: "restaurant", label: "Restaurante" },
  { value: "company", label: "Empresa / otro rubro" },
];

export function ClientForm({ plans }: { plans: Plan[] }) {
  const initialType = plans[0]?.customerType ?? "travel_agency";
  const initialProduct = plans[0]?.productSlug ?? "";
  const [customerType, setCustomerType] = useState(initialType);
  const [productSlug, setProductSlug] = useState(initialProduct);
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");

  const productOptions = plans.filter(
    (plan, index, array) =>
      plan.customerType === customerType &&
      array.findIndex((candidate) => candidate.productSlug === plan.productSlug) === index,
  );

  const filteredPlans = plans.filter(
    (plan) => plan.customerType === customerType && plan.productSlug === productSlug,
  );

  function handleCustomerTypeChange(nextCustomerType: string) {
    const nextProducts = plans.filter((plan) => plan.customerType === nextCustomerType);
    const nextProductSlug = nextProducts[0]?.productSlug ?? "";
    const nextPlans = nextProducts.filter((plan) => plan.productSlug === nextProductSlug);

    setCustomerType(nextCustomerType);
    setProductSlug(nextProductSlug);
    setPlanId(nextPlans[0]?.id ?? "");
  }

  function handleProductChange(nextProductSlug: string) {
    const nextPlans = plans.filter(
      (plan) => plan.customerType === customerType && plan.productSlug === nextProductSlug,
    );

    setProductSlug(nextProductSlug);
    setPlanId(nextPlans[0]?.id ?? "");
  }

  return (
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
            <input name="email" type="email" placeholder="ventas@empresa.com" required />
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
            Tipo de cliente
            <select
              name="customerType"
              value={customerType}
              onChange={(event) => handleCustomerTypeChange(event.target.value)}
            >
              {customerTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Producto
            <select
              name="productSlug"
              value={productSlug}
              onChange={(event) => handleProductChange(event.target.value)}
            >
              {productOptions.map((product) => (
                <option key={product.productSlug} value={product.productSlug}>
                  {product.productName}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Plan contratado
            <select
              name="planId"
              required
              value={planId}
              onChange={(event) => setPlanId(event.target.value)}
            >
              {filteredPlans.map((plan) => (
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
  );
}
