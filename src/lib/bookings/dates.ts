// Fechas de reserva como texto "YYYY-MM-DD" (sin horas ni zonas horarias).

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtc(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

function fromUtc(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

// Noches entre la entrada y la salida (salida - entrada).
export function nightsBetween(checkIn: string, checkOut: string) {
  return Math.round((toUtc(checkOut) - toUtc(checkIn)) / DAY_MS);
}

export function addDays(date: string, days: number) {
  return fromUtc(toUtc(date) + days * DAY_MS);
}

// Fecha de hoy en España (Europe/Madrid), que es la que cuenta para las reservas.
export function todayInSpain(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// Las reservas del formulario público pueden empezar como mucho dentro de 2 años.
export const MAX_BOOKING_DAYS_AHEAD = 730;
