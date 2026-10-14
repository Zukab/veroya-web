import { toCents } from "@/lib/admin/format";

// Estado del pago de una reserva, común al voucher y a la página de verificación:
//   - paid: hay pagos y cubren el total (o el total no está definido)
//   - partial: hay pagos pero no cubren el total
//   - pending / on_arrival: sin pagos; según las condiciones de pago de la reserva
// Importes en euros, sumados en céntimos para evitar errores de redondeo.

export type PaymentKind = "paid" | "partial" | "pending" | "on_arrival";

export function paymentSummary({
  total,
  payments,
  terms,
}: {
  total: number | string | null;
  payments: { amount: number | string }[];
  terms: "pendiente" | "al_llegar";
}) {
  const paidCents = payments.reduce((sum, payment) => sum + toCents(payment.amount), 0);
  const totalCents = total == null ? null : toCents(total);

  let kind: PaymentKind;
  if (paidCents > 0) kind = totalCents == null || paidCents >= totalCents ? "paid" : "partial";
  else kind = terms === "al_llegar" ? "on_arrival" : "pending";

  return {
    kind,
    total: totalCents == null ? null : totalCents / 100,
    paid: paidCents / 100,
    pending: totalCents == null ? null : Math.max(0, totalCents - paidCents) / 100,
  };
}
