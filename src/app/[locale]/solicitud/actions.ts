"use server";

import { after } from "next/server";
import { PUBLIC_BOOKING_RATE_LIMIT, insertPublicBooking } from "@/lib/bookings/create-public";
import { todayInAgency } from "@/lib/bookings/dates";
import { PUBLIC_BOOKING_TEXT_FIELDS, type PublicBookingState } from "@/lib/bookings/form-state";
import { fieldErrorsFrom, generalRequestSchema, publicStayErrors } from "@/lib/bookings/schema";
import { getCities } from "@/lib/data/catalog";
import { sendRequestReceivedEmail } from "@/lib/email/request-received";
import { checkRateLimit, clientIpKey } from "@/lib/rate-limit";

// Solicitud general desde /solicitud: el huésped indica ciudad, fechas y
// huéspedes sin elegir apartamento. Llega al panel como Pendiente sin apartamento;
// el equipo le asigna uno y la confirma.
export async function createGeneralRequest(
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

  // Campo trampa contra bots (ver el formulario de apartamento).
  if (formData.get("website")) return fail({ formError: "unexpected" });

  const parsed = generalRequestSchema.safeParse({
    ...values,
    locale: formData.get("locale"),
    privacy: formData.get("privacy"),
  });
  if (!parsed.success) return fail({ fieldErrors: fieldErrorsFrom(parsed.error) });
  const input = parsed.data;

  const city = (await getCities()).find((item) => item.slug === input.city);
  if (!city) return fail({ fieldErrors: { city: { key: "cityNotFound" } } });

  // Sin apartamento no hay estancia mínima ni capacidad que comprobar.
  const stayErrors = publicStayErrors(input, { min_nights: 1, max_guests: 50 }, todayInAgency());
  if (Object.keys(stayErrors).length > 0) return fail({ fieldErrors: stayErrors });

  const allowed = await checkRateLimit({ ...PUBLIC_BOOKING_RATE_LIMIT, key: await clientIpKey() });
  if (!allowed) return fail({ formError: "rateLimited" });

  const saved = await insertPublicBooking({
    user_name: input.user_name,
    user_email: input.user_email,
    user_phone: input.user_phone,
    user_country: input.user_country,
    guests: input.guests,
    check_in: input.check_in,
    check_out: input.check_out,
    message: input.message,
    locale: input.locale,
    apartment_id: null,
    apartment_name: "",
    city_name: city.name,
  });
  if (!saved) return fail({ formError: "unexpected" });
  // Acuse de recibo por correo, después de responder.
  after(() => sendRequestReceivedEmail(saved.id));

  return {
    status: "success",
    code: saved.code,
    pin: saved.pin,
    checkIn: input.check_in,
    checkOut: input.check_out,
    guests: input.guests,
  };
}
