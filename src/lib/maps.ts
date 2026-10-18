// Mapas: enlace a Google Maps (sin clave de API) y mapa fijo hecho con teselas de
// OpenStreetMap (web y voucher). Las coordenadas de cada apartamento las calcula
// el panel a partir de la dirección (src/lib/geocode.ts) o se pegan a mano.

export type Coordinates = { latitude: number; longitude: number };

// Enlace de Google Maps: al punto exacto si hay coordenadas; si no, búsqueda de la
// dirección (se añade la ciudad por si la dirección no la incluye).
export function googleMapsUrl(address: string, city?: string, coordinates?: Coordinates | null) {
  const query = coordinates
    ? `${coordinates.latitude},${coordinates.longitude}`
    : [address, city].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function coordinatesOf(row: { latitude: number | null; longitude: number | null }): Coordinates | null {
  return row.latitude == null || row.longitude == null ? null : { latitude: row.latitude, longitude: row.longitude };
}

// "40.4168, -3.7038" (como lo copia Google Maps) → coordenadas, con 6 decimales
// (unos 10 cm). null si no tiene ese formato o se sale de rango.
export function parseCoordinates(value: string): Coordinates | null {
  const match = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/.exec(value);
  if (!match) return null;
  const latitude = roundCoordinate(Number(match[1]));
  const longitude = roundCoordinate(Number(match[2]));
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  return { latitude, longitude };
}

export function formatCoordinates(coordinates: Coordinates | null) {
  return coordinates ? `${coordinates.latitude}, ${coordinates.longitude}` : "";
}

export function sameCoordinates(a: Coordinates | null, b: Coordinates | null) {
  return a?.latitude === b?.latitude && a?.longitude === b?.longitude;
}

export function roundCoordinate(value: number) {
  return Math.round(value * 1e6) / 1e6;
}

// ---------------------------------------------------------------------------
// Mapa fijo: las teselas (256 px, proyección Web Mercator) que cubren un recuadro
// centrado en el punto. Así no hace falta ninguna librería de mapas.
// ---------------------------------------------------------------------------

export const TILE_SIZE = 256;
export const MAP_ZOOM = 16;
export const OSM_ATTRIBUTION = "© OpenStreetMap";
export const OSM_COPYRIGHT_URL = "https://www.openstreetmap.org/copyright";
// Las normas de OpenStreetMap piden identificarse en las peticiones del servidor.
export const OSM_USER_AGENT = "EuronestApartamentos/1.0 (+https://euronestapartamentos.com)";
const MAX_LATITUDE = 85.05112878;

export type MapTile = { url: string; left: number; top: number };

// Posición del punto en píxeles del mapa del mundo a ese zoom.
export function worldPixel({ latitude, longitude }: Coordinates, zoom: number) {
  const scale = TILE_SIZE * 2 ** zoom;
  const lat = (Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, latitude)) * Math.PI) / 180;
  return {
    x: ((longitude + 180) / 360) * scale,
    y: ((1 - Math.log(Math.tan(lat) + 1 / Math.cos(lat)) / Math.PI) / 2) * scale,
  };
}

// Teselas de un recuadro de width × height píxeles con el punto en el centro;
// left y top son su posición dentro del recuadro.
export function mapTiles(point: Coordinates, width: number, height: number, zoom = MAP_ZOOM): MapTile[] {
  const { x, y } = worldPixel(point, zoom);
  const left = x - width / 2;
  const top = y - height / 2;
  const count = 2 ** zoom;
  const tiles: MapTile[] = [];

  for (let ty = Math.floor(top / TILE_SIZE); ty <= Math.floor((top + height - 1) / TILE_SIZE); ty++) {
    if (ty < 0 || ty >= count) continue;
    for (let tx = Math.floor(left / TILE_SIZE); tx <= Math.floor((left + width - 1) / TILE_SIZE); tx++) {
      const wrapped = ((tx % count) + count) % count;
      tiles.push({
        url: `https://tile.openstreetmap.org/${zoom}/${wrapped}/${ty}.png`,
        left: Math.round(tx * TILE_SIZE - left),
        top: Math.round(ty * TILE_SIZE - top),
      });
    }
  }
  return tiles;
}
