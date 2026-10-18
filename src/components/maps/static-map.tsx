import { type Coordinates, OSM_ATTRIBUTION, OSM_COPYRIGHT_URL, TILE_SIZE, mapTiles } from "@/lib/maps";

// Mapa fijo con un pin en el punto: teselas de OpenStreetMap colocadas alrededor
// del centro, sin librería de mapas ni cookies. Se recorta al tamaño del recuadro
// (lo fija className), así que se adapta a cualquier ancho hasta MOSAIC_WIDTH.
// Al pulsarlo se abre href (Google Maps). Sirve en componentes de servidor y cliente.

const MOSAIC_WIDTH = 1024;
const MOSAIC_HEIGHT = 448;

export function StaticMap({
  coordinates,
  href,
  label,
  className = "h-64 sm:h-72",
}: {
  coordinates: Coordinates;
  href: string;
  label: string;
  className?: string;
}) {
  const tiles = mapTiles(coordinates, MOSAIC_WIDTH, MOSAIC_HEIGHT);

  return (
    <div className={`relative overflow-hidden bg-sand-100 ${className}`}>
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="absolute inset-0 block">
        {tiles.map((tile) => (
          // eslint-disable-next-line @next/next/no-img-element -- teselas externas de tamaño fijo, sin optimizar
          <img
            key={tile.url}
            src={tile.url}
            alt=""
            width={TILE_SIZE}
            height={TILE_SIZE}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="pointer-events-none absolute max-w-none select-none"
            style={{
              left: `calc(50% + ${tile.left - MOSAIC_WIDTH / 2}px)`,
              top: `calc(50% + ${tile.top - MOSAIC_HEIGHT / 2}px)`,
            }}
          />
        ))}
        <MapPin />
      </a>
      <a
        href={OSM_COPYRIGHT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-0 bottom-0 rounded-tl-md bg-white/85 px-1.5 py-0.5 text-[0.65rem] text-stone-600 hover:text-ink"
      >
        {OSM_ATTRIBUTION}
      </a>
    </div>
  );
}

// Pin en terracota con la punta en el centro del recuadro.
function MapPin() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 42"
      className="absolute top-1/2 left-1/2 h-10.5 w-8 -translate-x-1/2 -translate-y-full drop-shadow-md"
    >
      <path
        d="M16 41c-1.2-1.4-14-15.6-14-25a14 14 0 0 1 28 0c0 9.4-12.8 23.6-14 25Z"
        className="fill-terracotta-600 stroke-white"
        strokeWidth={2}
      />
      <circle cx="16" cy="16" r="5.5" className="fill-white" />
    </svg>
  );
}
