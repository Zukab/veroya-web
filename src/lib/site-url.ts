import "server-only";
import { serverEnv } from "@/lib/env.server";

// Dirección pública de la web para enlaces absolutos (QR del voucher y correo).
// Orden: SITE_URL; si falta, la dirección de producción que Vercel pone en
// VERCEL_PROJECT_PRODUCTION_URL; en desarrollo, localhost.
export function siteUrl() {
  if (serverEnv.SITE_URL) return serverEnv.SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

// Página pública de verificación de una reserva (español sin prefijo).
export function verificationUrl(token: string, locale: string) {
  return `${siteUrl()}${locale === "en" ? "/en" : ""}/verificar/${token}`;
}
