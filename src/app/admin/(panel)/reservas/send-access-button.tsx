"use client";

import { useActionState } from "react";
import { ActionForm } from "@/components/admin/action-form";
import { FormStatus } from "@/components/admin/form-status";
import { buttonClasses } from "@/components/ui/button";
import { idleState } from "@/lib/admin/form";
import { sendAccessDetails } from "./actions";

// Botón para enviar al huésped el localizador y el PIN, en cualquier estado.
export function SendAccessButton({ bookingId, email }: { bookingId: string; email: string }) {
  const [state, formAction, pending] = useActionState(sendAccessDetails, idleState);

  return (
    <ActionForm
      action={formAction}
      confirmMessage={`¿Enviar el localizador y el PIN por correo a ${email}?`}
      className="space-y-3"
    >
      <input type="hidden" name="booking_id" value={bookingId} />
      <button type="submit" disabled={pending} className={buttonClasses({ variant: "secondary" })}>
        {pending ? "Enviando…" : "Enviar PIN por correo"}
      </button>
      <FormStatus state={state} />
    </ActionForm>
  );
}
