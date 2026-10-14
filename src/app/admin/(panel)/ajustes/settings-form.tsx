"use client";

import { useActionState } from "react";
import { ActionForm } from "@/components/admin/action-form";
import { FormStatus } from "@/components/admin/form-status";
import { ImageUpload } from "@/components/admin/image-upload";
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
          <Field
            id="settings-whatsapp"
            label="WhatsApp"
            error={errors.whatsapp}
            hint="Número para el botón de WhatsApp de la web. Vacío = sin botón."
          >
            <input
              id="settings-whatsapp"
              name="whatsapp"
              type="tel"
              maxLength={40}
              defaultValue={settings.whatsapp}
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

      <FormSection title="Foto de portada">
        <p className="mb-4 text-sm text-stone-600">
          Fondo del buscador en la página de inicio. Mejor en horizontal; sin foto se muestra un
          fondo de color.
        </p>
        <ImageUpload
          name="hero_image_url"
          folder="portada"
          initial={settings.hero_image_url ? [settings.hero_image_url] : []}
        />
        {errors.hero_image_url && <p className="mt-2 text-sm text-red-700">{errors.hero_image_url}</p>}
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
            hint="Una norma por línea. Para que el voucher quepa en una página, mejor unas 7 normas cortas y una política de cancelación de pocas líneas."
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

      <FormSection title="Datos legales del titular">
        <p className="mb-4 text-sm text-stone-600">
          Aparecen en el aviso legal y en la política de privacidad de la web. Son obligatorios por
          ley en muchos países: complétalos con los datos de la persona o empresa titular.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="settings-legal_name" label="Nombre o razón social" error={errors.legal_name}>
            <input
              id="settings-legal_name"
              name="legal_name"
              maxLength={150}
              defaultValue={settings.legal_name}
              className={inputClasses}
            />
          </Field>
          <Field
            id="settings-tax_id"
            label="Identificación fiscal"
            error={errors.tax_id}
            hint="NIF en España, NIT o cédula en Colombia…"
          >
            <input
              id="settings-tax_id"
              name="tax_id"
              maxLength={40}
              defaultValue={settings.tax_id}
              className={inputClasses}
            />
          </Field>
          <Field
            id="settings-legal_address"
            label="Domicilio"
            error={errors.legal_address}
            className="sm:col-span-2"
          >
            <input
              id="settings-legal_address"
              name="legal_address"
              maxLength={300}
              defaultValue={settings.legal_address}
              className={inputClasses}
            />
          </Field>
        </div>
      </FormSection>

      <button type="submit" disabled={pending} className={buttonClasses()}>
        {pending ? "Guardando…" : "Guardar ajustes"}
      </button>
    </ActionForm>
  );
}
