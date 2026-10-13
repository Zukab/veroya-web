// Lista fija de comodidades. En la base de datos (apartments.amenities) se guardan
// estas claves; los textos están en messages/*.json bajo "Amenities".
// Para añadir una: agrégala aquí, en los dos archivos de mensajes y en
// src/components/apartments/amenity-icon.tsx.
export const AMENITY_KEYS = [
  "wifi",
  "air_conditioning",
  "heating",
  "kitchen",
  "washer",
  "dishwasher",
  "tv",
  "elevator",
  "crib",
  "balcony",
  "terrace",
  "sea_view",
  "pool",
  "parking",
  "workspace",
  "pets_allowed",
] as const;

export type AmenityKey = (typeof AMENITY_KEYS)[number];

export function isAmenityKey(value: string): value is AmenityKey {
  return (AMENITY_KEYS as readonly string[]).includes(value);
}

// Claves conocidas de un apartamento, en el orden de la lista fija. Las que no se
// reconocen se ignoran al mostrar.
export function knownAmenities(values: readonly string[]): AmenityKey[] {
  return AMENITY_KEYS.filter((key) => values.includes(key));
}
