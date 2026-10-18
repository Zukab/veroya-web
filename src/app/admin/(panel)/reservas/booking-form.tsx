"use client";

import { useActionState, useState } from "react";
import { ActionForm } from "@/components/admin/action-form";
import { FormStatus } from "@/components/admin/form-status";
import { FormSection } from "@/components/admin/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Field, inputClasses } from "@/components/ui/form";
import { BOOKING_STATUSES, PAYMENT_TERMS, paymentTermsLabels } from "@/lib/admin/booking-schema";
import { idleState } from "@/lib/admin/form";
import { formatDate, formatEuros } from "@/lib/admin/format";
import { addDays, nightsBetween } from "@/lib/bookings/dates";
import type { Database } from "@/types/database";
import { createBooking, updateBooking } from "./actions";

type Booking = Pick<
  Database["public"]["Tables"]["bookings"]["Row"],
  | "id"
  | "apartment_id"
  | "apartment_name"
  | "status"
  | "check_in"
  | "check_out"
  | "guests"
  | "user_name"
  | "user_email"
  | "user_phone"
  | "user_country"
  | "message"
  | "locale"
  | "payment_terms"
  | "total_amount"
  | "companions"
>;

export type ApartmentOption = {
  id: string;
  name: string;
  city: string;
  price: number;
  min_nights: number;
  max_guests: number;
};

export type ConfirmedStay = {
  id: string;
  booking_code: string;
  apartment_id: string;
  check_in: string;
  check_out: string;
};

// Crear (sin booking) o editar una reserva desde el panel. Las reglas de noches
// mínimas y huéspedes máximos y el cruce con otras confirmadas solo se avisan:
// el equipo puede hacer excepciones (y un apartamento puede tener varias unidades).
export function BookingForm({
  booking,
  apartments,
  confirmedStays,
}: {
  booking?: Booking;
  apartments: ApartmentOption[];
  confirmedStays: ConfirmedStay[];
}) {
  const [state, formAction, pending] = useActionState(booking ? updateBooking : createBooking, idleState);
  const errors = state.fieldErrors ?? {};

  const [apartmentId, setApartmentId] = useState(booking?.apartment_id ?? "");
  const [checkIn, setCheckIn] = useState(booking?.check_in ?? "");
  const [checkOut, setCheckOut] = useState(booking?.check_out ?? "");
  const [guests, setGuests] = useState(String(booking?.guests ?? 2));
  const [companions, setCompanions] = useState(booking?.companions.join("\n") ?? "");
  const [total, setTotal] = useState(booking?.total_amount == null ? "" : String(booking.total_amount));

  const companionCount = companions.split("\n").filter((line) => line.trim()).length;
  const apartment = apartments.find((item) => item.id === apartmentId);
  const nights = checkIn && checkOut && checkOut > checkIn ? nightsBetween(checkIn, checkOut) : 0;
  const suggested = apartment && nights > 0 ? apartment.price * nights : null;
  // Fechas [entrada, salida): salir y entrar el mismo día no es un cruce.
  const overlaps =
    apartment && nights > 0
      ? confirmedStays.filter(
          (stay) =>
            stay.apartment_id === apartment.id &&
            stay.id !== booking?.id &&
            stay.check_in < checkOut &&
            stay.check_out > checkIn,
        )
      : [];
  const warnings = [
    overlaps.length > 0
      ? `Este apartamento ya tiene ${overlaps.length === 1 ? "una reserva confirmada" : `${overlaps.length} reservas confirmadas`} en esas fechas: ${overlaps
          .map((stay) => `${stay.booking_code} (${formatDate(stay.check_in)} – ${formatDate(stay.check_out)})`)
          .join(", ")}. Se puede guardar igual si tienes otra unidad libre.`
      : null,
    apartment && nights > 0 && nights < apartment.min_nights
      ? `Este apartamento pide un mínimo de ${apartment.min_nights} noches (esta reserva tiene ${nights}).`
      : null,
    apartment && Number(guests) > apartment.max_guests
      ? `Este apartamento admite hasta ${apartment.max_guests} huéspedes.`
      : null,
  ].filter(Boolean);

  return (
    <ActionForm action={formAction} className="space-y-6">
      <FormStatus state={state} />
      {booking && <input type="hidden" name="booking_id" value={booking.id} />}

      <FormSection title="Estancia">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="booking-apartment_id" label="Apartamento" error={errors.apartment_id} className="sm:col-span-2">
            <select
              id="booking-apartment_id"
              name="apartment_id"
              value={apartmentId}
              onChange={(event) => setApartmentId(event.target.value)}
              className={inputClasses}
            >
              <option value="">
                {booking && !booking.apartment_id && booking.apartment_name
                  ? `${booking.apartment_name} (ya no existe)`
                  : "Sin apartamento"}
              </option>
              {apartments.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.city} · {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="booking-check_in" label="Entrada" error={errors.check_in}>
            <input
              id="booking-check_in"
              name="check_in"
              type="date"
              required
              value={checkIn}
              onChange={(event) => setCheckIn(event.target.value)}
              className={inputClasses}
            />
          </Field>
          <Field id="booking-check_out" label="Salida" error={errors.check_out}>
            <input
              id="booking-check_out"
              name="check_out"
              type="date"
              required
              min={checkIn ? addDays(checkIn, 1) : undefined}
              value={checkOut}
              onChange={(event) => setCheckOut(event.target.value)}
              className={inputClasses}
            />
          </Field>
          <Field id="booking-guests" label="Huéspedes" error={errors.guests}>
            <input
              id="booking-guests"
              name="guests"
              type="number"
              min={1}
              max={50}
              required
              value={guests}
              onChange={(event) => setGuests(event.target.value)}
              className={inputClasses}
            />
          </Field>
          <Field id="booking-status" label="Estado" error={errors.status}>
            <select
              id="booking-status"
              name="status"
              defaultValue={booking?.status ?? "Confirmada"}
              className={inputClasses}
            >
              {BOOKING_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {nights > 0 && <p className="mt-3 text-sm text-stone-600">{nights} noches.</p>}
        {warnings.map((warning) => (
          <p key={warning} className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            {warning}
          </p>
        ))}
      </FormSection>

      <FormSection title="Huésped">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="booking-user_name" label="Nombre y apellidos" error={errors.user_name}>
            <input
              id="booking-user_name"
              name="user_name"
              required
              maxLength={120}
              defaultValue={booking?.user_name}
              className={inputClasses}
            />
          </Field>
          <Field
            id="booking-companions"
            label="Acompañantes (opcional)"
            error={errors.companions}
            hint="Nombre y apellidos del resto de huéspedes, uno por línea. Salen en el voucher debajo del titular."
            className="order-last sm:col-span-2"
          >
            <textarea
              id="booking-companions"
              name="companions"
              rows={2}
              value={companions}
              onChange={(event) => setCompanions(event.target.value)}
              className={inputClasses}
            />
            {companionCount > 0 && companionCount > Number(guests) - 1 && (
              <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Hay {companionCount} acompañantes y la reserva es para {guests}{" "}
                {Number(guests) === 1 ? "huésped" : "huéspedes"} en total (titular incluido).
              </p>
            )}
          </Field>
          <Field id="booking-user_email" label="Correo electrónico" error={errors.user_email}>
            <input
              id="booking-user_email"
              name="user_email"
              type="email"
              required
              maxLength={254}
              defaultValue={booking?.user_email}
              className={inputClasses}
            />
          </Field>
          <Field id="booking-user_phone" label="Teléfono" error={errors.user_phone}>
            <input
              id="booking-user_phone"
              name="user_phone"
              type="tel"
              required
              maxLength={40}
              defaultValue={booking?.user_phone}
              className={inputClasses}
            />
          </Field>
          <Field id="booking-user_country" label="País" error={errors.user_country}>
            <input
              id="booking-user_country"
              name="user_country"
              required
              maxLength={80}
              defaultValue={booking?.user_country}
              className={inputClasses}
            />
          </Field>
          <Field
            id="booking-locale"
            label="Idioma del huésped"
            error={errors.locale}
            hint="Para el correo y el voucher."
          >
            <select id="booking-locale" name="locale" defaultValue={booking?.locale ?? "es"} className={inputClasses}>
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
          </Field>
          <Field id="booking-message" label="Mensaje o notas" error={errors.message} className="sm:col-span-2">
            <textarea
              id="booking-message"
              name="message"
              rows={3}
              maxLength={2000}
              defaultValue={booking?.message ?? ""}
              className={inputClasses}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Importe">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="booking-total_amount"
            label="Total de la estancia (€)"
            error={errors.total_amount}
            hint="Vacío = sin definir. Al crear, si se deja vacío se usa precio × noches."
          >
            <input
              id="booking-total_amount"
              name="total_amount"
              inputMode="decimal"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
              placeholder="0,00"
              className={inputClasses}
            />
          </Field>
          <Field
            id="booking-payment_terms"
            label="Mientras no haya pagos, el voucher dice"
            error={errors.payment_terms}
          >
            <select
              id="booking-payment_terms"
              name="payment_terms"
              defaultValue={booking?.payment_terms ?? "pendiente"}
              className={inputClasses}
            >
              {PAYMENT_TERMS.map((terms) => (
                <option key={terms} value={terms}>
                  {paymentTermsLabels[terms]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        {suggested !== null && (
          <p className="mt-3 text-sm text-stone-600">
            Precio × noches: {formatEuros(apartment!.price)} × {nights} = {formatEuros(suggested)}{" "}
            <button
              type="button"
              onClick={() => setTotal(String(suggested))}
              className="font-medium text-terracotta-700 underline"
            >
              Usar este total
            </button>
          </p>
        )}
      </FormSection>

      <button type="submit" disabled={pending} className={buttonClasses()}>
        {pending ? "Guardando…" : booking ? "Guardar cambios" : "Crear reserva"}
      </button>
    </ActionForm>
  );
}
