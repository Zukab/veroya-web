"use client";

import { useActionState } from "react";
import { ActionForm } from "@/components/admin/action-form";
import { FormStatus } from "@/components/admin/form-status";
import { FormSection } from "@/components/admin/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/form";
import { idleState } from "@/lib/admin/form";
import type { AgencySettings } from "@/lib/data/settings";
import { saveSettings } from "./actions";

export function SettingsForm({ settings }: { settings: AgencySettings }) {
  const [state, formAction, pending] = useActionState(saveSettings, idleState);
  const errors = state.fieldErrors ?? {};

  return (
    <ActionForm action={formAction} className="space-y-6">
      <FormStatus state={state} />

      <FormSection title="Contacto">
        <p className="mb-4 text-sm text-stone-600">
          Sale en el voucher y en el correo de confirmación. Las respuestas de los huéspedes a ese
          correo llegan a esta dirección.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="settings-phone" label="Teléfono" error={errors.phone} hint="Con prefijo, p. ej. +34 600 000 000">
            <input
              id="settings-phone"
              name="phone"
              type="tel"
              required
              maxLength={40}
              defaultValue={settings.phone}
              className={inputClasses}
            />
          </Field>
          <Field id="settings-email" label="Correo" error={errors.email}>
            <input
              id="settings-email"
              name="email"
              type="email"
              required
              maxLength={254}
              defaultValue={settings.email}
              className={inputClasses}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Horarios">
        <div className="grid grid-cols-2 gap-4">
          <Field id="settings-check_in_time" label="Entrada a partir de" error={errors.check_in_time}>
            <input
              id="settings-check_in_time"
              name="check_in_time"
              type="time"
              required
              defaultValue={settings.check_in_time}
              className={inputClasses}
            />
          </Field>
          <Field id="settings-check_out_time" label="Salida antes de" error={errors.check_out_time}>
            <input
              id="settings-check_out_time"
              name="check_out_time"
              type="time"
              required
              defaultValue={settings.check_out_time}
              className={inputClasses}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Información para la estancia">
        <div className="space-y-4">
          <Field
            id="settings-house_rules"
            label="Normas"
            error={errors.house_rules}
            hint="Una norma por línea. El voucher las muestra como lista."
          >
            <textarea
              id="settings-house_rules"
              name="house_rules"
              rows={5}
              required
              maxLength={2000}
              defaultValue={settings.house_rules}
              className={inputClasses}
            />
          </Field>
          <Field id="settings-cancellation_policy" label="Política de cancelación" error={errors.cancellation_policy}>
            <textarea
              id="settings-cancellation_policy"
              name="cancellation_policy"
              rows={4}
              required
              maxLength={2000}
              defaultValue={settings.cancellation_policy}
              className={inputClasses}
            />
          </Field>
          <p className="text-xs text-stone-500">
            Estos textos se muestran en español también en los vouchers en inglés.
          </p>
        </div>
      </FormSection>

      <button type="submit" disabled={pending} className={buttonClasses()}>
        {pending ? "Guardando…" : "Guardar ajustes"}
      </button>
    </ActionForm>
  );
}
