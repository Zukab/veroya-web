import { ArrowRight, Send } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { ApartmentGrid, ApartmentGridSkeleton } from "@/components/apartments/apartment-grid";
import { SearchForm } from "@/components/search/search-form";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Link } from "@/i18n/navigation";
import { getBlockedApartmentIds } from "@/lib/bookings/availability";
import { todayInAgency } from "@/lib/bookings/dates";
import { getAllApartments, getCities } from "@/lib/data/catalog";
import { MAX_SEARCH_GUESTS, parseSearchParams, searchNights, searchQueryString } from "@/lib/search";

// Resultados del buscador: apartamentos de la ciudad elegida con capacidad para
// los huéspedes y, si hay fechas, libres en esas fechas y con estancia mínima
// cumplida. La disponibilidad se lee en cada búsqueda (sin caché).

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Search");
  return { title: t("metaTitle"), robots: { index: false } };
}

export default function SearchPage({ searchParams }: PageProps<"/[locale]/buscar">) {
  return (
    <main className="pb-16">
      <Suspense fallback={<SearchSkeleton />}>
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function SearchResults({ searchParams }: Pick<PageProps<"/[locale]/buscar">, "searchParams">) {
  const params = await searchParams;
  await connection();
  const search = parseSearchParams((name) => params[name], todayInAgency());
  const nights = searchNights(search);

  const [t, format, cities, apartments] = await Promise.all([
    getTranslations("Search"),
    getFormatter(),
    getCities(),
    getAllApartments(),
  ]);
  const blocked = search.checkIn && search.checkOut ? await getBlockedApartmentIds(search.checkIn, search.checkOut) : null;

  const city = search.city ? cities.find((item) => item.slug === search.city) : undefined;
  const candidates = apartments.filter(
    (apartment) =>
      (!city || apartment.city.slug === city.slug) &&
      (!search.guests || apartment.max_guests >= search.guests) &&
      !blocked?.has(apartment.id),
  );
  const results = nights ? candidates.filter((apartment) => apartment.min_nights <= nights) : candidates;
  const tooShort = candidates.length - results.length;

  const maxGuests = Math.min(MAX_SEARCH_GUESTS, Math.max(2, ...apartments.map((apartment) => apartment.max_guests)));
  const query = searchQueryString(search);
  const requestHref = `/solicitud${searchQueryString(search, { withCity: true })}`;
  const date = (value: string) =>
    format.dateTime(new Date(`${value}T00:00:00Z`), { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <>
      <section className="border-b border-sand-200 bg-sand-100">
        <Container className="py-6 sm:py-8">
          <SearchForm
            cities={cities.map(({ slug, name, country }) => ({ slug, name, country }))}
            maxGuests={maxGuests}
            defaults={search}
            variant="compact"
          />
        </Container>
      </section>

      <Container className="pt-8 sm:pt-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              {nights ? t("title") : t("titleAll")}
              {city && <span className="text-stone-500"> · {city.name}</span>}
            </h1>
            <p className="mt-1 text-stone-600">
              {t("resultsCount", { count: results.length })}
              {search.checkIn && search.checkOut && nights && (
                <> · {t("stay", { checkIn: date(search.checkIn), checkOut: date(search.checkOut), nights })}</>
              )}
            </p>
          </div>
        </div>

        {!nights && (
          <p className="mb-6 rounded-xl border border-sand-200 bg-white px-4 py-3 text-sm text-stone-600">
            {t("noDates")}
          </p>
        )}

        {results.length > 0 ? (
          <ApartmentGrid apartments={results} query={query} nights={nights} />
        ) : (
          <EmptyState>{t("empty")}</EmptyState>
        )}

        {tooShort > 0 && <p className="mt-6 text-sm text-stone-500">{t("tooShort", { count: tooShort })}</p>}

        <div className="mt-12 flex flex-col items-start gap-4 rounded-3xl bg-sand-100 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div>
            <h2 className="font-serif text-2xl font-semibold">{t("requestTitle")}</h2>
            <p className="mt-1 text-stone-600">{t("requestText")}</p>
          </div>
          <Link href={requestHref} className={buttonClasses({ className: "shrink-0" })}>
            <Send aria-hidden="true" className="size-4" />
            {t("requestCta")}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </Container>
    </>
  );
}

function SearchSkeleton() {
  return (
    <>
      <div className="h-28 border-b border-sand-200 bg-sand-100" />
      <Container className="pt-10">
        <div className="mb-8 h-9 w-64 animate-pulse rounded-lg bg-sand-200" />
        <ApartmentGridSkeleton count={6} />
      </Container>
    </>
  );
}
