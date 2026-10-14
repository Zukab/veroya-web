import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Lecturas de la página pública de verificación. bookings no tiene acceso
// público, así que se lee con la clave secreta y solo se devuelven los campos que
// la página muestra: nada de datos personales ni importes.

const TOKEN = /^[0-9a-f]{32}$/;

export function isVerificationToken(value: string) {
  return TOKEN.test(value);
}

export async function getVerifiedBooking(token: string) {
  if (!isVerificationToken(token)) return null;

  const { data, error } = await createAdminClient()
    .from("bookings")
    .select("booking_code, status, apartment_name, city_name, check_in, check_out")
    .eq("verification_token", token)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer la reserva: ${error.message}`);
  return data;
}

export type VerifiedBooking = NonNullable<Awaited<ReturnType<typeof getVerifiedBooking>>>;

// Token de verificación a partir del localizador y el PIN (o null si no coinciden).
export async function findVerificationToken(code: string, pin: string) {
  const { data, error } = await createAdminClient()
    .from("bookings")
    .select("verification_token")
    .eq("booking_code", code)
    .eq("booking_pin", pin)
    .maybeSingle();

  if (error) throw new Error(`No se pudo buscar la reserva: ${error.message}`);
  return data?.verification_token ?? null;
}
