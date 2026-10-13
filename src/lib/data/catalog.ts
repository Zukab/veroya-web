import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS } from "./tags";

// Lecturas públicas de ciudades y apartamentos, cacheadas.
// El panel invalidará CACHE_TAGS al guardar cambios; cacheLife("hours") es la red
// de seguridad por si se edita algo directamente en Supabase.

// Columnas que necesitan las tarjetas de apartamento.
const APARTMENT_CARD_COLUMNS =
  "id, name, price, rooms, max_guests, rating, reviews, min_nights, neighborhood, images, city:cities(slug, name)";

export const FEATURED_APARTMENTS_LIMIT = 6;

function fail(what: string, error: { message: string }): never {
  throw new Error(`No se pudo leer ${what}: ${error.message}`);
}

export async function getCities() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.cities, CACHE_TAGS.apartments);

  const { data, error } = await createPublicClient()
    .from("cities")
    .select("slug, name, image_url, description, apartments(count)")
    .order("name");

  if (error) fail("las ciudades", error);

  return data.map(({ apartments, ...city }) => ({
    ...city,
    apartmentCount: apartments[0]?.count ?? 0,
  }));
}

export async function getCity(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.cities);

  const { data, error } = await createPublicClient()
    .from("cities")
    .select("slug, name, image_url, description")
    .eq("slug", slug)
    .maybeSingle();

  if (error) fail(`la ciudad "${slug}"`, error);
  return data;
}

// Los mejor valorados; los que aún no tienen valoraciones van al final.
export async function getFeaturedApartments() {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.apartments, CACHE_TAGS.cities);

  const { data, error } = await createPublicClient()
    .from("apartments")
    .select(APARTMENT_CARD_COLUMNS)
    .order("rating", { ascending: false, nullsFirst: false })
    .order("reviews", { ascending: false })
    .order("id")
    .limit(FEATURED_APARTMENTS_LIMIT);

  if (error) fail("los apartamentos destacados", error);
  return data;
}

export async function getApartmentsByCity(citySlug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.apartments, CACHE_TAGS.cities);

  const { data, error } = await createPublicClient()
    .from("apartments")
    .select(APARTMENT_CARD_COLUMNS)
    .eq("city_slug", citySlug)
    .order("rating", { ascending: false, nullsFirst: false })
    .order("reviews", { ascending: false })
    .order("id");

  if (error) fail(`los apartamentos de "${citySlug}"`, error);
  return data;
}

export async function getApartment(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(CACHE_TAGS.apartments, CACHE_TAGS.cities);

  const { data, error } = await createPublicClient()
    .from("apartments")
    .select("*, city:cities(slug, name)")
    .eq("id", id)
    .maybeSingle();

  if (error) fail(`el apartamento "${id}"`, error);
  return data;
}

// Para generateStaticParams: se prerenderizan todas las ciudades y apartamentos
// que existan al compilar; los nuevos se generan en la primera visita.
export async function getCitySlugs() {
  const { data, error } = await createPublicClient().from("cities").select("slug");
  if (error) fail("los slugs de ciudades", error);
  return data.map((city) => city.slug);
}

export async function getApartmentIds() {
  const { data, error } = await createPublicClient().from("apartments").select("id");
  if (error) fail("los ids de apartamentos", error);
  return data.map((apartment) => apartment.id);
}

export type CityWithCount = Awaited<ReturnType<typeof getCities>>[number];
export type ApartmentCardData = Awaited<
  ReturnType<typeof getFeaturedApartments>
>[number];
export type ApartmentDetail = NonNullable<Awaited<ReturnType<typeof getApartment>>>;
