import { differenceInCalendarDays } from "date-fns";

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
