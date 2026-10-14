"use client";

import { useActionState, useState } from "react";
import { ActionForm } from "@/components/admin/action-form";
import { FormStatus } from "@/components/admin/form-status";
import { ImageUpload } from "@/components/admin/image-upload";
import { FormSection } from "@/components/admin/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/form";
import { slugify } from "@/lib/admin/content-schema";
import { idleState } from "@/lib/admin/form";
import type { Database } from "@/types/database";
import { saveCity } from "./actions";

type City = Pick<Database["public"]["Tables"]["cities"]["Row"], "slug" | "name" | "country" | "description" | "image_url">;

export function CityForm({ city }: { city?: City }) {
  const [state, formAction, pending] = useActionState(saveCity, idleState);
  const editing = Boolean(city);
  // Al crear, el identificador se propone a partir del nombre hasta que se edita a mano.
  const [slug, setSlug] = useState(city?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const errors = state.fieldErrors ?? {};

  return (
    <ActionForm action={formAction} className="space-y-6">
      <FormStatus state={state} />
      {city && <input type="hidden" name="original_slug" value={city.slug} />}

      <FormSection title="Datos">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="city-name" label="Nombre" error={errors.name}>
            <input
              id="city-name"
              name="name"
              required
              maxLength={100}
              defaultValue={city?.name}
              onChange={(event) => {
                if (!slugTouched) setSlug(slugify(event.target.value));
              }}
              className={inputClasses}
            />
          </Field>
          <Field
            id="city-slug"
            label="Identificador en la URL"
            error={errors.slug}
            hint={editing ? "No se puede cambiar una vez creada." : `Dirección: /ciudades/${slug || "…"}`}
          >
            <input
              id="city-slug"
              name="slug"
              required
              maxLength={80}
              value={slug}
              readOnly={editing}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              className={inputClasses}
            />
          </Field>
        </div>
        <Field id="city-country" label="País" error={errors.country} className="mt-4 sm:max-w-xs" hint="En español, p. ej. España, Francia, Italia.">
          <input
            id="city-country"
            name="country"
            required
            maxLength={80}
            defaultValue={city?.country}
            className={inputClasses}
          />
        </Field>
        <Field id="city-description" label="Descripción" error={errors.description} className="mt-4">
          <textarea
            id="city-description"
            name="description"
            rows={4}
            maxLength={5000}
            defaultValue={city?.description}
            className={inputClasses}
          />
        </Field>
      </FormSection>

      <FormSection title="Foto">
        <ImageUpload name="image_url" folder="ciudades" initial={city?.image_url ? [city.image_url] : []} />
        {errors.image_url && <p className="mt-2 text-sm text-red-700">{errors.image_url}</p>}
      </FormSection>

      <button type="submit" disabled={pending} className={buttonClasses()}>
        {pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear ciudad"}
      </button>
    </ActionForm>
  );
}
