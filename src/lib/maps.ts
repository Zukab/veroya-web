// Enlace de búsqueda de Google Maps para una dirección (no necesita clave de API).
// Se añade la ciudad por si la dirección no la incluye.
export function googleMapsUrl(address: string, city?: string) {
  const query = [address, city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
