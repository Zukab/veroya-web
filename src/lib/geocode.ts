import "server-only";
import { type Coordinates, OSM_USER_AGENT, roundCoordinate } from "@/lib/maps";

// Coordenadas de una dirección con Nominatim (OpenStreetMap): gratis y sin clave.
// Sus normas piden identificarse y no pasar de una petición por segundo; solo se
// llama al guardar un apartamento en el panel. Nunca lanza: null si no la encuentra.

export async function geocodeAddress(query: string): Promise<Coordinates | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("q", query);

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": OSM_USER_AGENT, "Accept-Language": "es" },
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error(`Geocodificación: respuesta ${response.status}`);
      return null;
    }
    const [first] = (await response.json()) as { lat?: string; lon?: string }[];
    const latitude = Number(first?.lat);
    const longitude = Number(first?.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return { latitude: roundCoordinate(latitude), longitude: roundCoordinate(longitude) };
  } catch (error) {
    console.error("Geocodificación: error", error);
    return null;
  }
}
