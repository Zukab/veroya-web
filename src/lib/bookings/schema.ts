import { z } from "zod";
import { MAX_BOOKING_DAYS_AHEAD, addDays, nightsBetween } from "./dates";

// Validación de reservas. Los mensajes son claves de "BookingErrors" en
// messages/*.json; el formulario los traduce.

export const BOOKING_ERROR_KEYS = [
  "required",
  "tooLong",
  "invalidEmail",
  "invalidPhone",
  "invalidDate",
  "invalidGuests",
  "checkInPast",
  "checkInTooFar",
  "checkOutBeforeCheckIn",
  "minNights",
  "maxGuests",
  "apartmentNotFound",
  "rateLimited",
  "unexpected",
] as const;

export type BookingErrorKey = (typeof BOOKING_ERROR_KEYS)[number];
export type BookingFieldError = { key: BookingErrorKey; values?: Record<string, number> };

// Fecha YYYY-MM-DD obligatoria.
const requiredDate = () =>
  z.string().trim().min(1, { error: "required" }).pipe(z.iso.date({ error: "invalidDate" }));

const requiredText = (max: number) =>
  z.string().trim().min(1, { error: "required" }).max(max, { error: "tooLong" });

// Datos del huésped, comunes al formulario público y al panel.
export const guestFields = {
  user_name: requiredText(120),
  user_email: z
    .string()
    .trim()
    .min(1, { error: "required" })
    .max(254, { error: "tooLong" })
    .pipe(z.email({ error: "invalidEmail" })),
  user_phone: z
    .string()
    .trim()
    .min(1, { error: "required" })
    .max(40, { error: "tooLong" })
    .regex(/^\+?[\d\s().-]{5,40}$/, { error: "invalidPhone" })
    .refine((value) => value.replace(/\D/g, "").length >= 6, { error: "invalidPhone" }),
  user_country: z
    .string()
    .trim()
    .min(2, { error: "required" })
    .max(80, { error: "tooLong" }),
  guests: z.coerce
    .number({ error: "invalidGuests" })
    .int({ error: "invalidGuests" })
    .min(1, { error: "invalidGuests" })
    .max(50, { error: "invalidGuests" }),
  check_in: requiredDate(),
  check_out: requiredDate(),
  message: z
    .string()
    .trim()
    .max(2000, { error: "tooLong" })
    .transform((value) => value || null),
};

export const publicBookingSchema = z.object({
  apartment_id: z.string().trim().min(1).max(150),
  locale: z.enum(["es", "en"]),
  ...guestFields,
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;

// Errores por campo a partir de un ZodError (solo el primero de cada campo).
export function fieldErrorsFrom(error: z.ZodError) {
  const errors: Record<string, BookingFieldError> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (!field || errors[field]) continue;
    const key = (BOOKING_ERROR_KEYS as readonly string[]).includes(issue.message)
      ? (issue.message as BookingErrorKey)
      : "required";
    errors[field] = { key };
  }
  return errors;
}

// Reglas de fechas comunes: la salida después de la entrada y años razonables
// (la base de datos exige 2020–2100).
export function stayDateErrors(checkIn: string, checkOut: string) {
  const errors: Record<string, BookingFieldError> = {};
  if (checkIn < "2020-01-01" || checkIn > "2100-12-30") errors.check_in = { key: "invalidDate" };
  if (checkOut < "2020-01-02" || checkOut > "2100-12-31") errors.check_out = { key: "invalidDate" };
  if (!errors.check_out && nightsBetween(checkIn, checkOut) < 1) {
    errors.check_out = { key: "checkOutBeforeCheckIn" };
  }
  return errors;
}

// Reglas del formulario público: fechas futuras dentro de 2 años, noches mínimas
// y huéspedes máximos del apartamento.
export function publicStayErrors(
  input: Pick<PublicBookingInput, "check_in" | "check_out" | "guests">,
  apartment: { min_nights: number; max_guests: number },
  today: string,
) {
  const errors = stayDateErrors(input.check_in, input.check_out);

  if (!errors.check_in) {
    if (input.check_in < today) errors.check_in = { key: "checkInPast" };
    else if (input.check_in > addDays(today, MAX_BOOKING_DAYS_AHEAD)) {
      errors.check_in = { key: "checkInTooFar" };
    }
  }

  if (!errors.check_in && !errors.check_out) {
    if (nightsBetween(input.check_in, input.check_out) < apartment.min_nights) {
      errors.check_out = { key: "minNights", values: { count: apartment.min_nights } };
    }
  }

  if (input.guests > apartment.max_guests) {
    errors.guests = { key: "maxGuests", values: { count: apartment.max_guests } };
  }

  return errors;
}
