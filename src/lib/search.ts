import { MAX_BOOKING_DAYS_AHEAD, addDays, nightsBetween } from "@/lib/bookings/dates";

// Parámetros del buscador (/buscar, /apartamento/[id] y /solicitud):
//   ?ciudad=<slug>&entrada=YYYY-MM-DD&salida=YYYY-MM-DD&huespedes=N
// Los que no son válidos se ignoran.

export type SearchParams = {
  city: string | null;
  checkIn: string | null;
  checkOut: string | null;
  guests: number | null;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const MAX_SEARCH_GUESTS = 16;

function first(value: string | string[] | null | undefined) {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function validDate(value: string) {
  if (!DATE.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) ? value : null;
}

// Lee los parámetros (de searchParams del servidor o de URLSearchParams del
// navegador). Fechas: solo si las dos son válidas, la salida es posterior, la
// entrada no es anterior a hoy y como mucho dentro de dos años.
export function parseSearchParams(
  get: (name: string) => string | string[] | null | undefined,
  today: string,
): SearchParams {
  const city = first(get("ciudad"));
  const guests = Number(first(get("huespedes")));
  let checkIn = validDate(first(get("entrada")));
  let checkOut = validDate(first(get("salida")));

  if (
    !checkIn ||
    !checkOut ||
    checkOut <= checkIn ||
    checkIn < today ||
    checkIn > addDays(today, MAX_BOOKING_DAYS_AHEAD)
  ) {
    checkIn = null;
    checkOut = null;
  }

  return {
    city: SLUG.test(city) ? city : null,
    checkIn,
    checkOut,
    guests: Number.isInteger(guests) && guests >= 1 && guests <= MAX_SEARCH_GUESTS ? guests : null,
  };
}

export function searchNights(search: SearchParams) {
  return search.checkIn && search.checkOut ? nightsBetween(search.checkIn, search.checkOut) : null;
}

// Cadena "?entrada=…&salida=…&huespedes=…" para enlazar conservando la búsqueda.
export function searchQueryString(search: Partial<SearchParams>, { withCity = false } = {}) {
  const params = new URLSearchParams();
  if (withCity && search.city) params.set("ciudad", search.city);
  if (search.checkIn && search.checkOut) {
    params.set("entrada", search.checkIn);
    params.set("salida", search.checkOut);
  }
  if (search.guests) params.set("huespedes", String(search.guests));
  const query = params.toString();
  return query ? `?${query}` : "";
}
