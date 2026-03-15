import { addDays, format } from "date-fns";
import { Plus } from "lucide-react";
import { createClientAction } from "@/app/actions";
import { formatCurrency } from "@/lib/utils";

type Plan = {
  id: string;
  name: string;
  licensePriceCents: number;
  supportPriceCents: number;
};

export function ClientForm({ plans }: { plans: Plan[] }) {
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
  );
}
