import "server-only";
import { type Coordinates, OSM_USER_AGENT, mapTiles } from "@/lib/maps";

// Mapa del voucher: descarga las teselas de OpenStreetMap que cubren el recuadro
// para meterlas en el PDF. Si alguna falla, el voucher sale sin mapa (null).

// Recuadro en píxeles de tesela; el PDF lo dibuja a la mitad (MAP_SCALE) para que
// se vea nítido al imprimir.
// Alto ajustado al bloque del nombre y la dirección para que el voucher quepa en una A4.
export const MAP_PIXELS = { width: 420, height: 156 };
export const MAP_SCALE = 0.5;

export type PdfMapTile = { data: Buffer; left: number; top: number };

export async function loadMapTiles(coordinates: Coordinates): Promise<PdfMapTile[] | null> {
  const tiles = mapTiles(coordinates, MAP_PIXELS.width, MAP_PIXELS.height);
  try {
    return await Promise.all(
      tiles.map(async (tile) => {
        const response = await fetch(tile.url, {
          headers: { "User-Agent": OSM_USER_AGENT },
          signal: AbortSignal.timeout(5000),
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`tesela ${response.status}`);
        return { data: Buffer.from(await response.arrayBuffer()), left: tile.left, top: tile.top };
      }),
    );
  } catch (error) {
    console.error("Voucher: no se pudo cargar el mapa", error);
    return null;
  }
}
