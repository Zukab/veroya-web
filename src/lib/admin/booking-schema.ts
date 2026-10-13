import { z } from "zod";
import messages from "../../../messages/es.json";
import { type BookingFieldError, guestFields } from "@/lib/bookings/schema";
import type { Database } from "@/types/database";

// Validación de reservas y pagos del panel. Reutiliza los campos del huésped del
// formulario público, pero sin sus reglas de "fecha futura", noches mínimas ni
// huéspedes máximos: el equipo registra también reservas pasadas o excepciones.

type Enums = Database["public"]["Enums"];

export const BOOKING_STATUSES = ["Pendiente", "Confirmada", "Cancelada"] as const satisfies readonly Enums["booking_status"][];
export const PAYMENT_TERMS = ["pendiente", "al_llegar"] as const satisfies readonly Enums["payment_terms"][];
export const PAYMENT_METHODS = [
  "efectivo",
  "transferencia",
  "tarjeta",
  "bizum",
  "otro",
] as const satisfies readonly Enums["payment_method"][];

export const paymentTermsLabels: Record<Enums["payment_terms"], string> = {
  pendiente: "Pendiente de pago",
  al_llegar: "Pago al llegar",
};

export const paymentMethodLabels: Record<Enums["payment_method"], string> = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  tarjeta: "Tarjeta",
  bizum: "Bizum",
  otro: "Otra",
};

// Importe en euros como texto: hasta 8 cifras y 2 decimales (acepta coma decimal).
const euros = (options: { positive: boolean }) =>
  z
    .string()
    .trim()
    .regex(/^\d{1,8}([.,]\d{1,2})?$/, { error: "Importe en euros, con 2 decimales como máximo." })
    .transform((value) => Number(value.replace(",", ".")))
    .refine((value) => !options.positive || value > 0, { error: "Debe ser mayor que 0." });

export const adminBookingSchema = z.object({
  ...guestFields,
  apartment_id: z
    .string()
    .trim()
    .transform((value) => value || null),
  status: z.enum(BOOKING_STATUSES, { error: "Elige un estado." }),
  payment_terms: z.enum(PAYMENT_TERMS, { error: "Elige una opción." }),
  locale: z.enum(["es", "en"], { error: "Elige un idioma." }),
  // Vacío = sin definir.
  total_amount: z.union([z.literal("").transform(() => null), euros({ positive: false })]),
});

export const paymentSchema = z.object({
  booking_id: z.uuid(),
  amount: euros({ positive: true }),
  paid_on: z.iso.date({ error: "Introduce una fecha válida." }),
  method: z.enum(PAYMENT_METHODS, { error: "Elige la forma de pago." }),
  note: z
    .string()
    .trim()
    .max(500, { error: "Máximo 500 caracteres." })
    .transform((value) => value || null),
});

// Los campos del huésped devuelven claves de error (BookingErrors); en el panel se
// muestran en español.
export function spanishBookingError(key: string) {
  return (messages.BookingErrors as Record<string, string>)[key] ?? key;
}

export function spanishFieldErrors(errors: Record<string, BookingFieldError>) {
  return Object.fromEntries(
    Object.entries(errors).map(([field, error]) => [field, spanishBookingError(error.key)]),
  );
}
