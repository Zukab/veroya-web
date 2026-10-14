"use client";

import { useActionState } from "react";
import { ActionForm } from "@/components/admin/action-form";
import { FormStatus } from "@/components/admin/form-status";
import { buttonClasses } from "@/components/ui/button";
import { idleState } from "@/lib/admin/form";
import { sendVoucherEmail } from "./actions";

// Botón para enviar o reenviar al huésped el correo con el voucher.
export function SendVoucherButton({ bookingId, email, sent }: { bookingId: string; email: string; sent: boolean }) {
  const [state, formAction, pending] = useActionState(sendVoucherEmail, idleState);

  return (
    <ActionForm
      action={formAction}
      confirmMessage={`¿${sent ? "Reenviar" : "Enviar"} el voucher por correo a ${email}?`}
      className="space-y-3"
    >
      <input type="hidden" name="booking_id" value={bookingId} />
      <button type="submit" disabled={pending} className={buttonClasses({ variant: "secondary" })}>
        {pending ? "Enviando…" : sent ? "Reenviar por correo" : "Enviar por correo"}
      </button>
      <FormStatus state={state} />
    </ActionForm>
  );
}
