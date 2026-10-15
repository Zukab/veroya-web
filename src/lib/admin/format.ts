import { AGENCY_TIME_ZONE } from "@/lib/bookings/dates";

// Formatos del panel (siempre en español; horas en la zona de la agencia).

const euros = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const shortDate = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const dateTime = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: AGENCY_TIME_ZONE,
});

export function formatEuros(value: number) {
  return euros.format(value);
}

// Fecha "YYYY-MM-DD" (sin zona horaria).
export function formatDate(date: string) {
  return shortDate.format(new Date(`${date}T00:00:00Z`));
}

// Marca de tiempo en hora de España.
export function formatDateTime(timestamp: string) {
  return dateTime.format(new Date(timestamp));
}

// Importes en céntimos para sumar sin errores de coma flotante.
export function toCents(value: number | string) {
  return Math.round(Number(value) * 100);
}
