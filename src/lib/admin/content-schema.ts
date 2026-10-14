import { z } from "zod";
import { AMENITY_KEYS } from "@/lib/amenities";
import { isMediaUrl } from "@/lib/media";

// Validación de ciudades y apartamentos del panel. Las restricciones de la base de
// datos son la última barrera; los mensajes aquí ya van en español.

// Identificador legible para la URL (ciudades: slug; apartamentos: id).
const RESERVED_IDS = ["nueva", "nuevo"];
const slug = z
  .string()
  .trim()
  .min(1, { error: "Obligatorio." })
  .max(80, { error: "Máximo 80 caracteres." })
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    error: "Solo minúsculas sin acentos, números y guiones (p. ej. madrid-centro).",
  })
  .refine((value) => !RESERVED_IDS.includes(value), { error: "Ese identificador está reservado." });

const text = (max: number, required = false) =>
  z
    .string()
    .trim()
    .max(max, { error: `Máximo ${max} caracteres.` })
    .refine((value) => !required || value.length > 0, { error: "Obligatorio." });

const mediaUrl = z.string().refine(isMediaUrl, { error: "La foto debe estar subida al almacenamiento." });

const integer = (min: number, max: number) =>
  z.coerce
    .number({ error: "Introduce un número." })
    .int({ error: "Introduce un número entero." })
    .min(min, { error: `Mínimo ${min}.` })
    .max(max, { error: `Máximo ${max}.` });

// Campo numérico opcional: vacío = null.
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" || value === null ? undefined : value), schema.optional())
    .transform((value) => value ?? null);

export const citySchema = z.object({
  slug,
  name: text(100, true),
  description: text(5000),
  image_url: optional(mediaUrl),
});

export const apartmentSchema = z.object({
  id: slug,
  city_slug: z.string().trim().min(1, { error: "Elige una ciudad." }),
  name: text(150, true),
  price: integer(0, 100_000),
  rooms: integer(0, 50),
  baths: integer(0, 50),
  size: optional(integer(1, 100_000)),
  max_guests: integer(1, 50),
  min_nights: integer(1, 365),
  rating: optional(
    z.coerce
      .number({ error: "Introduce un número." })
      .min(0, { error: "Entre 0 y 5." })
      .max(5, { error: "Entre 0 y 5." })
      .transform((value) => Math.round(value * 100) / 100),
  ),
  reviews: integer(0, 1_000_000),
  beds_double: integer(0, 50),
  beds_single: integer(0, 50),
  sofa_beds: integer(0, 50),
  address: text(300, true),
  neighborhood: text(150),
  description: text(10000),
  images: z.array(mediaUrl).max(40, { error: "Máximo 40 fotos." }),
  amenities: z.array(z.enum(AMENITY_KEYS)),
});

export type CityInput = z.infer<typeof citySchema>;
export type ApartmentInput = z.infer<typeof apartmentSchema>;

// Propuesta de identificador a partir de un nombre ("Loft en Gràcia" → "loft-en-gracia").
export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
