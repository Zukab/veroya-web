import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

// Disponibilidad: un apartamento está ocupado si tiene una reserva Confirmada que
// se cruza con [entrada, salida). Las Pendiente no bloquean (igual que la regla
// de la base de datos). Se lee con la clave secreta y solo se devuelven ids.

export async function getBlockedApartmentIds(checkIn: string, checkOut: string) {
  const { data, error } = await createAdminClient()
    .from("bookings")
    .select("apartment_id")
    .eq("status", "Confirmada")
    .not("apartment_id", "is", null)
    .lt("check_in", checkOut)
    .gt("check_out", checkIn);

  if (error) throw new Error(`No se pudo comprobar la disponibilidad: ${error.message}`);
  return new Set(data.map((row) => row.apartment_id).filter((id): id is string => id !== null));
}

export async function isApartmentAvailable(apartmentId: string, checkIn: string, checkOut: string) {
  const { count, error } = await createAdminClient()
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("status", "Confirmada")
    .eq("apartment_id", apartmentId)
    .lt("check_in", checkOut)
    .gt("check_out", checkIn);

  if (error) throw new Error(`No se pudo comprobar la disponibilidad: ${error.message}`);
  return (count ?? 0) === 0;
}
