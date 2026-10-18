import { describe, expect, it } from "vitest";
import {
  TILE_SIZE,
  googleMapsUrl,
  mapTiles,
  parseCoordinates,
  sameCoordinates,
  worldPixel,
} from "@/lib/maps";

const SOL = { latitude: 40.416775, longitude: -3.70379 };

describe("parseCoordinates (campo del panel)", () => {
  it("lee las coordenadas como las copia Google Maps", () => {
    expect(parseCoordinates("40.416775, -3.703790")).toEqual(SOL);
    expect(parseCoordinates(" 40.416775 -3.70379 ")).toEqual(SOL);
  });

  it("redondea a 6 decimales", () => {
    expect(parseCoordinates("40.41677512345, -3.70379049")).toEqual(SOL);
  });

  it("rechaza textos sin ese formato o fuera de rango", () => {
    expect(parseCoordinates("Calle Mayor 1")).toBeNull();
    expect(parseCoordinates("40.4")).toBeNull();
    expect(parseCoordinates("95, 10")).toBeNull();
    expect(parseCoordinates("40, 190")).toBeNull();
  });
});

describe("sameCoordinates", () => {
  it("compara puntos y vacíos", () => {
    expect(sameCoordinates(SOL, { ...SOL })).toBe(true);
    expect(sameCoordinates(SOL, null)).toBe(false);
    expect(sameCoordinates(null, null)).toBe(true);
  });
});

describe("googleMapsUrl", () => {
  it("usa el punto exacto si hay coordenadas", () => {
    expect(googleMapsUrl("Calle Mayor 1", "Madrid", SOL)).toBe(
      "https://www.google.com/maps/search/?api=1&query=40.416775%2C-3.70379",
    );
  });

  it("si no, busca la dirección con la ciudad", () => {
    expect(googleMapsUrl("Calle Mayor 1", "Madrid")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Calle%20Mayor%201%2C%20Madrid",
    );
  });
});

describe("mapTiles (mapa fijo)", () => {
  it("coloca el punto en la tesela correcta (Puerta del Sol, zoom 16)", () => {
    const { x, y } = worldPixel(SOL, 16);
    expect(Math.floor(x / TILE_SIZE)).toBe(32093);
    expect(Math.floor(y / TILE_SIZE)).toBe(24711);
    expect(mapTiles(SOL, 400, 210, 16).map((tile) => tile.url)).toContain(
      "https://tile.openstreetmap.org/16/32093/24711.png",
    );
  });

  it("cubre todo el recuadro sin huecos", () => {
    const width = 400;
    const height = 210;
    const tiles = mapTiles(SOL, width, height);
    for (const [px, py] of [
      [0, 0],
      [width - 1, 0],
      [0, height - 1],
      [width - 1, height - 1],
      [width / 2, height / 2],
    ]) {
      const covered = tiles.some(
        (tile) => px >= tile.left && px < tile.left + TILE_SIZE && py >= tile.top && py < tile.top + TILE_SIZE,
      );
      expect(covered, `píxel ${px},${py}`).toBe(true);
    }
    // Como mucho una tesela más de las necesarias por lado.
    expect(tiles.length).toBeLessThanOrEqual(Math.ceil(width / TILE_SIZE + 1) * Math.ceil(height / TILE_SIZE + 1));
  });
});
