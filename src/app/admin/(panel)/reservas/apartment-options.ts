import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ApartmentOption } from "./booking-form";

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
