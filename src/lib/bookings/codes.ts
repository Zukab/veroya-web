import "server-only";
import { randomInt } from "node:crypto";

// Localizador y PIN de reserva, generados con crypto (nunca con Math.random).
// La base de datos exige ^ENA-[A-Z0-9]{5}$ y ^[0-9]{4}$.

const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateBookingCode() {
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    suffix += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return `ENA-${suffix}`;
}

export function generateBookingPin() {
  return String(randomInt(10_000)).padStart(4, "0");
}

// Localizador escrito por una persona: acepta "ENA-7K2QM", "ena-7k2qm",
// "ENA 7K2QM" o solo "7K2QM". Devuelve "ENA-XXXXX" o null si no es válido.
export function normalizeBookingCode(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const suffix = compact.startsWith("ENA") && compact.length === 8 ? compact.slice(3) : compact;
  return /^[A-Z0-9]{5}$/.test(suffix) ? `ENA-${suffix}` : null;
}

// Intentos máximos si el localizador generado ya existe (error 23505).
export const MAX_CODE_ATTEMPTS = 5;

export function isDuplicateBookingCode(error: { code?: string; message?: string }) {
  return error.code === "23505" && (error.message ?? "").includes("bookings_booking_code_key");
}
