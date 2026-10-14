"use server";

import { hasLocale } from "next-intl";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { findVerificationToken, normalizeBookingCode } from "@/lib/bookings/verification";
import { checkRateLimit, clientIpKey } from "@/lib/rate-limit";

// Límite de consultas con localizador y PIN: 10 cada 15 minutos por IP. Con PIN de
// 4 dígitos hace inviable probar combinaciones.
const RATE_LIMIT = { bucket: "verificar", max: 10, windowSeconds: 15 * 60 };

export type LookupState =
  | { status: "idle" }
  | { status: "error"; error: "invalid" | "notFound" | "rateLimited" | "unexpected"; code: string };

// Busca la reserva por localizador y PIN y lleva a su página de verificación.
export async function lookupBooking(_previous: LookupState, formData: FormData): Promise<LookupState> {
  const rawCode = String(formData.get("code") ?? "").slice(0, 20);
  const pin = String(formData.get("pin") ?? "").trim();
  const rawLocale = formData.get("locale");
  // next/root-params no funciona en Server Actions: el idioma llega en el formulario.
  const locale = typeof rawLocale === "string" && hasLocale(routing.locales, rawLocale) ? rawLocale : "es";

  const code = normalizeBookingCode(rawCode);
  if (!code || !/^\d{4}$/.test(pin)) return { status: "error", error: "invalid", code: rawCode };

  let token: string | null;
  try {
    const allowed = await checkRateLimit({ ...RATE_LIMIT, key: await clientIpKey() });
    if (!allowed) return { status: "error", error: "rateLimited", code: rawCode };
    token = await findVerificationToken(code, pin);
  } catch (error) {
    console.error("Verificación: error al buscar la reserva", error);
    return { status: "error", error: "unexpected", code: rawCode };
  }

  if (!token) return { status: "error", error: "notFound", code: rawCode };
  redirect({ href: `/verificar/${token}`, locale });
  return { status: "idle" };
}
