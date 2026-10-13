"use server";

import { MAX_CODE_ATTEMPTS, generateBookingCode, generateBookingPin, isDuplicateBookingCode } from "@/lib/bookings/codes";
import { nightsBetween, todayInSpain } from "@/lib/bookings/dates";
import {
  PUBLIC_BOOKING_TEXT_FIELDS,
  type PublicBookingState,
} from "@/lib/bookings/form-state";
import { fieldErrorsFrom, publicBookingSchema, publicStayErrors } from "@/lib/bookings/schema";
import { checkRateLimit, clientIpKey } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

// Límite del formulario público: 30 envíos por hora y por IP (el equipo del
// cliente puede registrar muchas reservas seguidas desde el mismo equipo).
const RATE_LIMIT = { bucket: "reserva-web", max: 30, windowSeconds: 60 * 60 };

// Crea una solicitud de reserva (estado Pendiente) desde el formulario público.
// Inserta con la clave secreta: bookings no tiene acceso público. El trigger de la
// base de datos marca la reserva como source = 'web'.
export async function createBookingRequest(
  _previous: PublicBookingState,
  formData: FormData,
): Promise<PublicBookingState> {
  const values: Record<string, string> = {};
  for (const field of PUBLIC_BOOKING_TEXT_FIELDS) {
    const value = formData.get(field);
    values[field] = typeof value === "string" ? value : "";
  }
  const fail = (rest: Omit<Extract<PublicBookingState, { status: "error" }>, "status" | "values">) =>
    ({ status: "error", values, ...rest }) satisfies PublicBookingState;

  // Campo trampa: una persona no lo ve ni lo rellena. No se guarda nada y se
  // responde con un error genérico (no un éxito falso, por si lo rellenó el
  // autocompletado de alguien real).
  if (formData.get("website")) return fail({ formError: "unexpected" });

  const parsed = publicBookingSchema.safeParse({
    ...values,
    apartment_id: formData.get("apartment_id"),
    locale: formData.get("locale"),
  });
  if (!parsed.success) return fail({ fieldErrors: fieldErrorsFrom(parsed.error) });
  const input = parsed.data;

  const supabase = createAdminClient();

  // Datos actuales del apartamento (sin caché): reglas, precio y nombres.
  const { data: apartment, error: apartmentError } = await supabase
    .from("apartments")
    .select("id, name, price, min_nights, max_guests, city:cities(name)")
    .eq("id", input.apartment_id)
    .maybeSingle();
  if (apartmentError) {
    console.error("Reserva: error al leer el apartamento", apartmentError);
    return fail({ formError: "unexpected" });
  }
  if (!apartment) return fail({ formError: "apartmentNotFound" });

  const stayErrors = publicStayErrors(input, apartment, todayInSpain());
  if (Object.keys(stayErrors).length > 0) return fail({ fieldErrors: stayErrors });

  const allowed = await checkRateLimit({ ...RATE_LIMIT, key: await clientIpKey() });
  if (!allowed) return fail({ formError: "rateLimited" });

  for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
    const code = generateBookingCode();
    const pin = generateBookingPin();

    const { error } = await supabase.from("bookings").insert({
      booking_code: code,
      booking_pin: pin,
      user_name: input.user_name,
      user_email: input.user_email,
      user_phone: input.user_phone,
      user_country: input.user_country,
      guests: input.guests,
      check_in: input.check_in,
      check_out: input.check_out,
      message: input.message,
      locale: input.locale,
      apartment_id: apartment.id,
      apartment_name: apartment.name,
      city_name: apartment.city.name,
      // Total propuesto; el equipo puede ajustarlo desde el panel.
      total_amount: apartment.price * nightsBetween(input.check_in, input.check_out),
    });

    if (!error) {
      return {
        status: "success",
        code,
        pin,
        checkIn: input.check_in,
        checkOut: input.check_out,
        guests: input.guests,
      };
    }
    if (!isDuplicateBookingCode(error)) {
      console.error("Reserva: error al guardar", error);
      return fail({ formError: "unexpected" });
    }
  }

  console.error(`Reserva: ${MAX_CODE_ATTEMPTS} localizadores repetidos seguidos`);
  return fail({ formError: "unexpected" });
}
