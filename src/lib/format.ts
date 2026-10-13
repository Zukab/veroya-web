// Opciones de formato compartidas.

// Precio en euros sin decimales: "120 €" / "€120".
export const priceFormat = {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
} as const;

// A partir de este mínimo de noches se considera estancia larga (etiqueta en las tarjetas).
export const LONG_STAY_MIN_NIGHTS = 28;
