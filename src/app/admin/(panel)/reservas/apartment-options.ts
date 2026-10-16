import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, todayInAgency } from "@/lib/bookings/dates";
import type { Database } from "@/types/database";
import type { ApartmentOption, ConfirmedStay } from "./booking-form";

// Apartamentos para el selector del formulario de reserva (ordenados por ciudad).
export async function readApartmentOptions(supabase: SupabaseClient<Database>): Promise<ApartmentOption[]> {
  const { data, error } = await supabase
    .from("apartments")
    .select("id, name, price, min_nights, max_guests, city:cities(name)")
    .order("city_slug")
    .order("name");
  if (error) throw new Error(`No se pudieron leer los apartamentos: ${error.message}`);

  return data.map(({ city, ...apartment }) => ({ ...apartment, city: city.name }));
}

// Reservas confirmadas para avisar de cruces de fechas en el formulario (no
// bloquean). Solo las que salieron hace menos de un año.
export async function readConfirmedStays(supabase: SupabaseClient<Database>): Promise<ConfirmedStay[]> {
  const { data, error } = await supabase
    .from("bookings")
    .select("id, booking_code, apartment_id, check_in, check_out")
    .eq("status", "Confirmada")
    .not("apartment_id", "is", null)
    .gt("check_out", addDays(todayInAgency(), -365))
    .order("check_in");
  if (error) throw new Error(`No se pudieron leer las reservas confirmadas: ${error.message}`);

  return data.flatMap(({ apartment_id, ...stay }) => (apartment_id ? [{ ...stay, apartment_id }] : []));
}
