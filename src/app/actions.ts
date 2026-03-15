"use server";

import { startOfDay } from "date-fns";
import { revalidatePath } from "next/cache";
import {
  createClient,
  markClientInstallmentPaid,
  markSupportInvoicePaid,
} from "@/lib/database";

export async function createClientAction(formData: FormData) {
  const planId = String(formData.get("planId") ?? "");
  const businessName = String(formData.get("businessName") ?? "").trim();
  const primaryContact = String(formData.get("primaryContact") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!planId || !businessName || !primaryContact || !email) {
    throw new Error("Faltan campos obligatorios para crear el cliente.");
  }

  const goLiveDateValue = String(formData.get("goLiveDate") ?? "").trim();
  const goLiveDate = goLiveDateValue ? startOfDay(new Date(goLiveDateValue)) : null;

  createClient({
    planId,
    businessName,
    primaryContact,
    email,
    phone: String(formData.get("phone") ?? "").trim() || null,
    city: String(formData.get("city") ?? "").trim() || null,
    country: String(formData.get("country") ?? "").trim() || null,
    notes: String(formData.get("notes") ?? "").trim() || null,
    goLiveDate,
    setupPaid: Boolean(formData.get("setupPaid")),
    deliveryPaid: Boolean(formData.get("deliveryPaid")),
  });

  revalidatePath("/");
}

export async function markSupportInvoicePaidAction(formData: FormData) {
  const invoiceId = String(formData.get("invoiceId") ?? "");

  if (!invoiceId) {
    throw new Error("No se recibió la factura a actualizar.");
  }

  markSupportInvoicePaid(invoiceId);

  revalidatePath("/");
  revalidatePath("/soporte");
  revalidatePath("/pagos");
  revalidatePath("/clientes");
}

export async function markClientInstallmentPaidAction(formData: FormData) {
  const clientId = String(formData.get("clientId") ?? "");
  const installment = String(formData.get("installment") ?? "");

  if (!clientId || (installment !== "setup" && installment !== "delivery")) {
    throw new Error("No se recibió un pago válido para registrar.");
  }

  markClientInstallmentPaid(clientId, installment);

  revalidatePath("/");
  revalidatePath("/clientes");
  revalidatePath("/pagos");
}
