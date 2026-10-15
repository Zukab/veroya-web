import { ArrowRight, Moon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ApartmentGrid } from "@/components/apartments/apartment-grid";
import { CityGrid } from "@/components/cities/city-grid";
import { SearchForm } from "@/components/search/search-form";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { Link } from "@/i18n/navigation";
import { getAllApartments, getCities, getFeaturedApartments } from "@/lib/data/catalog";
import { getAgencySettings } from "@/lib/data/settings";
import { MAX_SEARCH_GUESTS } from "@/lib/search";
import { localeAlternates } from "@/lib/seo";

const HOME_CITIES_LIMIT = 4;

export async function generateMetadata(): Promise<Metadata> {
  return { alternates: await localeAlternates("/") };
}

export default async function HomePage() {
  const [t, tSearch] = await Promise.all([getTranslations("Home"), getTranslations("Search")]);
  const [cities, featured, apartments, settings] = await Promise.all([
    getCities(),
    getFeaturedApartments(),
    getAllApartments(),
    getAgencySettings(),
  ]);
  const heroImage = settings.hero_image_url;
  const minStay = apartments.length > 0 ? Math.min(...apartments.map((apartment) => apartment.min_nights)) : null;
  const maxGuests = Math.min(
    MAX_SEARCH_GUESTS,
    Math.max(2, ...apartments.map((apartment) => apartment.max_guests)),
  );

  const steps = [
    { title: t("howStep1Title"), text: t("howStep1Text") },
    { title: t("howStep2Title"), text: t("howStep2Text") },
    { title: t("howStep3Title"), text: t("howStep3Text") },
  ];

  return (
    <main>
      {/* Portada con buscador. Foto de /admin/ajustes; sin foto, un degradado. */}
      <section className="relative isolate overflow-hidden bg-olive-700">
        {heroImage ? (
          <Image src={heroImage} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--color-terracotta-600),transparent_60%),linear-gradient(135deg,var(--color-olive-700),var(--color-ink))]"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-r from-stone-950/75 via-stone-950/45 to-stone-950/15"
        />
        <Container className="py-16 sm:py-24 lg:py-28">
          <div className="max-w-3xl text-white">
            {minStay && (
              <p className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
                <Moon aria-hidden="true" className="size-3.5" />
                {tSearch("minStay", { count: minStay })}
              </p>
            )}
            <h1 className="mt-5 font-serif text-4xl font-semibold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/85">{t("heroSubtitle")}</p>
          </div>
          <div className="mt-10 max-w-5xl">
            <SearchForm
              cities={cities.map(({ slug, name, country }) => ({ slug, name, country }))}
              maxGuests={maxGuests}
            />
          </div>
          <Link
            href="/ciudades"
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-white/85 hover:text-white"
          >
            {tSearch("seeAllCities")}
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Container>
      </section>

      {/* Ciudades */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            title={t("citiesTitle")}
            subtitle={t("citiesSubtitle")}
            action={
              cities.length > HOME_CITIES_LIMIT && (
                <Link
                  href="/ciudades"
                  className="inline-flex items-center gap-1 text-sm font-medium text-terracotta-700 hover:underline"
                >
                  {t("seeAllCities")}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              )
            }
          />
          {cities.length > 0 ? (
            <CityGrid cities={cities.slice(0, HOME_CITIES_LIMIT)} />
          ) : (
            <EmptyState>{t("emptyCities")}</EmptyState>
          )}
        </Container>
      </section>

      {/* Apartamentos destacados */}
      <section className="py-12 sm:py-16">
        <Container>
          <SectionHeading title={t("featuredTitle")} subtitle={t("featuredSubtitle")} />
          {featured.length > 0 ? (
            <ApartmentGrid apartments={featured} />
          ) : (
            <EmptyState>{t("emptyApartments")}</EmptyState>
          )}
        </Container>
      </section>

      {/* Cómo funciona */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="rounded-3xl bg-sand-100 px-6 py-12 sm:px-12">
            <SectionHeading title={t("howTitle")} />
            <ol className="grid gap-8 md:grid-cols-3">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span className="flex size-10 items-center justify-center rounded-full bg-terracotta-600 font-serif text-lg font-semibold text-white">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1 text-stone-600">{step.text}</p>
                </li>
              ))}
            </ol>
            <Link
              href="/como-funciona"
              className={buttonClasses({ variant: "secondary", className: "mt-10" })}
            >
              {t("howCta")}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Propietarios */}
      <section className="pb-16 pt-4 sm:pb-24">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-3xl bg-olive-700 px-6 py-10 text-white sm:px-12 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-serif text-3xl font-semibold">{t("ownersTitle")}</h2>
              <p className="mt-2 text-white/80">{t("ownersText")}</p>
            </div>
            <Link
              href="/propietarios"
              className={buttonClasses({
                variant: "secondary",
                className: "shrink-0 border-transparent",
              })}
            >
              {t("ownersCta")}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
