import { describe, expect, it } from "vitest";
import { paymentSummary } from "@/lib/bookings/payment-summary";

describe("paymentSummary (estado del pago en voucher y verificación)", () => {
  it("sin pagos: pendiente o pago al llegar según las condiciones", () => {
    expect(paymentSummary({ total: "1350.00", payments: [], terms: "pendiente" })).toEqual({
      kind: "pending",
      total: 1350,
      paid: 0,
      pending: 1350,
    });
    expect(paymentSummary({ total: 1350, payments: [], terms: "al_llegar" }).kind).toBe("on_arrival");
  });

  it("pago completo: pagada y nada pendiente", () => {
    expect(paymentSummary({ total: "1350.00", payments: [{ amount: "1350.00" }], terms: "pendiente" })).toEqual({
      kind: "paid",
      total: 1350,
      paid: 1350,
      pending: 0,
    });
  });

  it("pago parcial: suma los pagos y calcula lo pendiente sin errores de redondeo", () => {
    const summary = paymentSummary({ total: 870, payments: [{ amount: "300.10" }, { amount: 0.2 }], terms: "pendiente" });
    expect(summary.kind).toBe("partial");
    expect(summary.paid).toBe(300.3);
    expect(summary.pending).toBe(569.7);
  });

  it("sin total definido, cualquier pago cuenta como pagada", () => {
    expect(paymentSummary({ total: null, payments: [{ amount: 50 }], terms: "pendiente" })).toEqual({
      kind: "paid",
      total: null,
      paid: 50,
      pending: null,
    });
  });
});
