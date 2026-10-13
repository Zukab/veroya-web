"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";
import { type AdminFormState, idleState } from "@/lib/admin/form";
import { ActionForm } from "./action-form";
import { FormStatus } from "./form-status";

// Botón "Borrar" con confirmación y mensaje de error (p. ej. si la base de datos
// impide el borrado).
export function DeleteButton({
  action,
  fields,
  confirmMessage,
  label = "Borrar",
}: {
  action: (previous: AdminFormState, formData: FormData) => Promise<AdminFormState>;
  fields: Record<string, string>;
  confirmMessage: string;
  label?: string;
}) {
  const [state, formAction, pending] = useActionState(action, idleState);

  return (
    <ActionForm action={formAction} confirmMessage={confirmMessage} className="space-y-3">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <FormStatus state={state} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
      >
        <Trash2 aria-hidden="true" className="size-4" />
        {pending ? "Borrando…" : label}
      </button>
    </ActionForm>
  );
}
