import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { serverEnv } from "@/lib/env.server";
import { createAdminClient } from "@/lib/supabase/admin";

// IP del visitante. Vercel y Cloudflare rellenan estas cabeceras; si no hay
// ninguna, todas las peticiones comparten la clave "desconocida".
async function clientIp() {
  const h = await headers();
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "desconocida"
  );
}

// En la base de datos nunca se guarda la IP en claro: se guarda un HMAC con una
// clave secreta del servidor, que no se puede revertir probando todas las IP.
function hashKey(value: string) {
  return createHmac("sha256", serverEnv.SUPABASE_SERVICE_ROLE_KEY).update(value).digest("hex");
}

export async function clientIpKey() {
  return hashKey(`ip:${await clientIp()}`);
}

export function hashedKey(value: string) {
  return hashKey(value);
}

// Registra un intento y devuelve true si está dentro del límite. Usa la función
// public.check_rate_limit (solo ejecutable con la clave secreta).
export async function checkRateLimit({
  bucket,
  key,
  max,
  windowSeconds,
}: {
  bucket: string;
  key: string;
  max: number;
  windowSeconds: number;
}) {
  const { data, error } = await createAdminClient().rpc("check_rate_limit", {
    p_bucket: bucket,
    p_key_hash: key,
    p_max: max,
    p_window_seconds: windowSeconds,
  });

  if (error) throw new Error(`No se pudo comprobar el límite de intentos: ${error.message}`);
  return data;
}
