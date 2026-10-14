"use client";

import { useActionState, useRef } from "react";
import { ActionForm } from "@/components/admin/action-form";
import { FormStatus } from "@/components/admin/form-status";
import { buttonClasses } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/form";
import { PAYMENT_METHODS, paymentMethodLabels } from "@/lib/admin/booking-schema";
import { idleState } from "@/lib/admin/form";
import { addPayment } from "./actions";

// Registrar un pago (importe, fecha y forma de pago). La fecha por defecto la
// calcula el servidor (hoy en España) para no depender del reloj del navegador.
// pendingAmount: lo que falta por pagar; el botón «Pago completo» lo escribe en el importe.
export function PaymentForm({
  bookingId,
  today,
  pendingAmount,
}: {
  bookingId: string;
  today: string;
  pendingAmount?: number | null;
}) {
  const [state, formAction, pending] = useActionState(addPayment, idleState);
  const errors = state.fieldErrors ?? {};
  const amountRef = useRef<HTMLInputElement>(null);
  const pendingText = pendingAmount ? pendingAmount.toFixed(2).replace(".", ",") : null;

  return (
    <ActionForm action={formAction} className="space-y-4">
      <FormStatus state={state} />
      <input type="hidden" name="booking_id" value={bookingId} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field id="payment-amount" label="Importe (€)" error={errors.amount}>
          <input
            ref={amountRef}
            id="payment-amount"
            name="amount"
            inputMode="decimal"
            required
            placeholder="0,00"
            className={inputClasses}
          />
        </Field>
        <Field id="payment-paid_on" label="Fecha del pago" error={errors.paid_on}>
          <input
            id="payment-paid_on"
            name="paid_on"
            type="date"
            required
            defaultValue={today}
            className={inputClasses}
          />
        </Field>
        <Field id="payment-method" label="Forma de pago" error={errors.method}>
          <select id="payment-method" name="method" defaultValue="" required className={inputClasses}>
            <option value="" disabled>
              Elige…
            </option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {paymentMethodLabels[method]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      {pendingText && (
        <button
          type="button"
          onClick={() => {
            if (amountRef.current) amountRef.current.value = pendingText;
            amountRef.current?.focus();
          }}
          className="text-sm font-medium text-terracotta-700 underline underline-offset-2 hover:text-terracotta-600"
        >
          Pago completo: poner {pendingText} € (lo pendiente)
        </button>
      )}
      <Field id="payment-note" label="Nota (opcional)" error={errors.note}>
        <input id="payment-note" name="note" maxLength={500} className={inputClasses} />
      </Field>
      <button type="submit" disabled={pending} className={buttonClasses({ variant: "secondary" })}>
        {pending ? "Registrando…" : "Registrar pago"}
      </button>
    </ActionForm>
  );
}
