import "server-only";
import { MAX_CODE_ATTEMPTS, generateBookingCode, generateBookingPin, isDuplicateBookingCode } from "@/lib/bookings/codes";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

// Límite de los formularios públicos (apartamento y solicitud general): 30 envíos
// por hora y por IP (el equipo del cliente puede registrar muchas reservas
// seguidas desde el mismo equipo).
export const PUBLIC_BOOKING_RATE_LIMIT = { bucket: "reserva-web", max: 30, windowSeconds: 60 * 60 };

type PublicBookingRow = Omit<Database["public"]["Tables"]["bookings"]["Insert"], "booking_code" | "booking_pin">;

// Guarda una solicitud de la web (estado Pendiente) con un localizador y un PIN
// nuevos; si el localizador ya existe (23505), lo reintenta con otro. Inserta con
// la clave secreta (bookings no tiene acceso público); el trigger marca
// source = 'web'. Devuelve null si no se pudo guardar.
export async function insertPublicBooking(row: PublicBookingRow) {
  const supabase = createAdminClient();

  for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
    const code = generateBookingCode();
    const pin = generateBookingPin();
    const { data, error } = await supabase
      .from("bookings")
      .insert({ ...row, booking_code: code, booking_pin: pin })
      .select("id")
      .single();

    if (!error) return { id: data.id, code, pin };
    if (!isDuplicateBookingCode(error)) {
      console.error("Reserva: error al guardar", error);
      return null;
    }
  }

  console.error(`Reserva: ${MAX_CODE_ATTEMPTS} localizadores repetidos seguidos`);
  return null;
}
