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

// Intentos máximos si el localizador generado ya existe (error 23505).
export const MAX_CODE_ATTEMPTS = 5;

export function isDuplicateBookingCode(error: { code?: string; message?: string }) {
  return error.code === "23505" && (error.message ?? "").includes("bookings_booking_code_key");
}
