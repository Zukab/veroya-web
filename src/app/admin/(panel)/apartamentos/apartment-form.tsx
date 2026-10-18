"use client";

import { useActionState, useState } from "react";
import { ActionForm } from "@/components/admin/action-form";
import { FormStatus } from "@/components/admin/form-status";
import { ImageUpload } from "@/components/admin/image-upload";
import { FormSection } from "@/components/admin/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/form";
import { amenityLabels } from "@/lib/admin/amenity-labels";
import { slugify } from "@/lib/admin/content-schema";
import { idleState } from "@/lib/admin/form";
import { AMENITY_KEYS } from "@/lib/amenities";
import { coordinatesOf, formatCoordinates, googleMapsUrl } from "@/lib/maps";
import { StaticMap } from "@/components/maps/static-map";
import type { Database } from "@/types/database";
import { saveApartment } from "./actions";

type Apartment = Omit<Database["public"]["Tables"]["apartments"]["Row"], "created_at">;
type CityOption = { slug: string; name: string };

export function ApartmentForm({ apartment, cities }: { apartment?: Apartment; cities: CityOption[] }) {
  const [state, formAction, pending] = useActionState(saveApartment, idleState);
  const editing = Boolean(apartment);
  const [id, setId] = useState(apartment?.id ?? "");
  const [idTouched, setIdTouched] = useState(editing);
  const errors = state.fieldErrors ?? {};
  const stored = apartment ? coordinatesOf(apartment) : null;

  // Campo numérico con su etiqueta y error.
  const numberField = (
    name: keyof Apartment,
    label: string,
    options: {
      min?: number;
      max?: number;
      step?: string;
      required?: boolean;
      hint?: string;
      initial?: string;
    } = {},
  ) => (
    <Field id={`apartment-${name}`} label={label} error={errors[name]} hint={options.hint}>
      <input
        id={`apartment-${name}`}
        name={name}
        type="number"
        inputMode={options.step ? "decimal" : "numeric"}
        min={options.min}
        max={options.max}
        step={options.step ?? "1"}
        required={options.required ?? true}
        defaultValue={apartment?.[name] == null ? (options.initial ?? "") : String(apartment[name])}
        className={inputClasses}
      />
    </Field>
  );

  return (
    <ActionForm action={formAction} className="space-y-6">
      <FormStatus state={state} />
      {apartment && <input type="hidden" name="original_id" value={apartment.id} />}

      <FormSection title="Datos básicos">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="apartment-name" label="Nombre" error={errors.name} className="sm:col-span-2">
            <input
              id="apartment-name"
              name="name"
              required
              maxLength={150}
              defaultValue={apartment?.name}
              onChange={(event) => {
                if (!idTouched) setId(slugify(event.target.value));
              }}
              className={inputClasses}
            />
          </Field>
          <Field
            id="apartment-id"
            label="Identificador en la URL"
            error={errors.id}
            hint={editing ? "No se puede cambiar una vez creado." : `Dirección: /apartamento/${id || "…"}`}
          >
            <input
              id="apartment-id"
              name="id"
              required
              maxLength={80}
              value={id}
              readOnly={editing}
              onChange={(event) => {
                setIdTouched(true);
                setId(event.target.value);
              }}
              className={inputClasses}
            />
          </Field>
          <Field id="apartment-city_slug" label="Ciudad" error={errors.city_slug}>
            <select
              id="apartment-city_slug"
              name="city_slug"
              required
              defaultValue={apartment?.city_slug ?? ""}
              className={inputClasses}
            >
              <option value="" disabled>
                Elige una ciudad
              </option>
              {cities.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="apartment-address"
            label="Dirección"
            error={errors.address}
            hint="Calle, número, piso y código postal. Se muestra en la web, con un mapa, y en el voucher."
            className="sm:col-span-2"
          >
            <input
              id="apartment-address"
              name="address"
              required
              maxLength={300}
              autoComplete="off"
              defaultValue={apartment?.address}
              className={inputClasses}
            />
          </Field>
          <Field
            id="apartment-coordinates"
            label="Coordenadas del mapa (opcional)"
            error={errors.coordinates}
            hint="Vacío = se calculan solas a partir de la dirección al guardar. Si el punto del mapa no es el edificio, en Google Maps haz clic derecho sobre él, pulsa los números para copiarlos y pégalos aquí."
            className="sm:col-span-2"
          >
            {/* La key rellena el campo con las coordenadas recién guardadas. */}
            <input
              key={formatCoordinates(stored)}
              id="apartment-coordinates"
              name="coordinates"
              inputMode="decimal"
              autoComplete="off"
              placeholder="40.416775, -3.703790"
              defaultValue={formatCoordinates(stored)}
              className={inputClasses}
            />
          </Field>
          {editing && (
            <div className="sm:col-span-2">
              <p className="mb-1.5 text-sm font-medium text-stone-700">Ubicación en el mapa</p>
              {stored ? (
                <StaticMap
                  coordinates={stored}
                  href={googleMapsUrl(apartment?.address ?? "", undefined, stored)}
                  label="Abrir el punto en Google Maps"
                  className="h-56 rounded-xl border border-sand-200"
                />
              ) : (
                <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Sin mapa: no se encontró la dirección. Pega las coordenadas desde Google Maps y
                  guarda. Mientras tanto, la web y el voucher muestran solo la dirección.
                </p>
              )}
            </div>
          )}
          <Field id="apartment-neighborhood" label="Barrio" error={errors.neighborhood} className="sm:col-span-2">
            <input
              id="apartment-neighborhood"
              name="neighborhood"
              maxLength={150}
              defaultValue={apartment?.neighborhood}
              className={inputClasses}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Precio y capacidad">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {numberField("price", "Precio por noche (€)", { min: 0 })}
          {numberField("min_nights", "Noches mínimas", { min: 1, max: 365 })}
          {numberField("max_guests", "Huéspedes máximos", { min: 1, max: 50 })}
          {numberField("rooms", "Habitaciones", { min: 0, max: 50, hint: "0 = estudio" })}
          {numberField("baths", "Baños", { min: 0, max: 50 })}
          {numberField("size", "Superficie (m²)", { min: 1, required: false, hint: "Opcional" })}
        </div>
      </FormSection>

      <FormSection title="Camas">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {numberField("beds_double", "Camas dobles", { min: 0, max: 50, initial: "0" })}
          {numberField("beds_single", "Camas individuales", { min: 0, max: 50, initial: "0" })}
          {numberField("sofa_beds", "Sofás cama", { min: 0, max: 50, initial: "0" })}
        </div>
      </FormSection>

      <FormSection title="Valoraciones">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {numberField("rating", "Nota media (0–5)", {
            min: 0,
            max: 5,
            step: "0.01",
            required: false,
            hint: "Vacía = «Nuevo»",
          })}
          {numberField("reviews", "Número de reseñas", { min: 0 })}
        </div>
      </FormSection>

      <FormSection title="Descripción">
        <Field id="apartment-description" label="Texto (en español)" error={errors.description}>
          <textarea
            id="apartment-description"
            name="description"
            rows={6}
            maxLength={10000}
            defaultValue={apartment?.description}
            className={inputClasses}
          />
        </Field>
      </FormSection>

      <FormSection title="Comodidades">
        <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {AMENITY_KEYS.map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="amenities"
                value={key}
                defaultChecked={apartment?.amenities.includes(key)}
                className="size-4 accent-terracotta-600"
              />
              {amenityLabels[key]}
            </label>
          ))}
        </div>
      </FormSection>

      <FormSection title="Fotos">
        <ImageUpload name="images" folder="apartamentos" initial={apartment?.images ?? []} multiple />
        {errors.images && <p className="mt-2 text-sm text-red-700">{errors.images}</p>}
      </FormSection>

      <button type="submit" disabled={pending} className={buttonClasses()}>
        {pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear apartamento"}
      </button>
    </ActionForm>
  );
}
