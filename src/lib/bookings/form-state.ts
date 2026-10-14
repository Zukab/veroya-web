import type { BookingErrorKey, BookingFieldError } from "./schema";

// Estado que devuelve la Server Action del formulario público de reserva.
export type PublicBookingState =
  | { status: "idle" }
  | {
      status: "error";
      formError?: BookingErrorKey;
      fieldErrors?: Record<string, BookingFieldError>;
      values: Record<string, string>;
    }
  | {
      status: "success";
      code: string;
      pin: string;
      checkIn: string;
      checkOut: string;
      guests: number;
    };

// Campos de texto del formulario que se devuelven para no perderlos si hay errores.
export const PUBLIC_BOOKING_TEXT_FIELDS = [
  "city",
  "user_name",
  "user_email",
  "user_phone",
  "user_country",
  "guests",
  "check_in",
  "check_out",
  "message",
] as const;
