import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS } from "./tags";

// Ajustes de la agencia (una sola fila): contacto, horas de entrada y salida,
// normas y cancelación. Los usan el voucher y el correo de confirmación; el panel
// invalida CACHE_TAGS.settings al guardarlos.
export async function getAgencySettings() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.settings);

  const { data, error } = await createPublicClient()
    .from("agency_settings")
    .select("phone, email, check_in_time, check_out_time, house_rules, cancellation_policy")
    .maybeSingle();

  if (error) throw new Error(`No se pudieron leer los ajustes de la agencia: ${error.message}`);
  if (!data) throw new Error("Faltan los ajustes de la agencia (tabla agency_settings vacía).");

  return {
    ...data,
    // Postgres devuelve "15:00:00"; se muestran "15:00".
    check_in_time: data.check_in_time.slice(0, 5),
    check_out_time: data.check_out_time.slice(0, 5),
  };
}

export type AgencySettings = Awaited<ReturnType<typeof getAgencySettings>>;

// Normas: una por línea, sin líneas vacías.
export function houseRulesList(rules: string) {
  return rules
    .split("\n")
    .map((rule) => rule.trim())
    .filter(Boolean);
}
