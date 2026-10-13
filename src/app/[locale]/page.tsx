import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ApartmentGrid } from "@/components/apartments/apartment-grid";
import { CityGrid } from "@/components/cities/city-grid";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { SectionHeading } from "@/components/ui/section-heading";
import { Link } from "@/i18n/navigation";
import { getCities, getFeaturedApartments } from "@/lib/data/catalog";

const HOME_CITIES_LIMIT = 4;

export default async function HomePage() {
  const t = await getTranslations("Home");
  const [cities, featured] = await Promise.all([getCities(), getFeaturedApartments()]);
  const heroImage = cities.find((city) => city.image_url)?.image_url;

  const steps = [
    { title: t("howStep1Title"), text: t("howStep1Text") },
    { title: t("howStep2Title"), text: t("howStep2Text") },
    { title: t("howStep3Title"), text: t("howStep3Text") },
  ];

  return (
    <main>
      {/* Portada */}
      <section className="overflow-hidden">
        <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta-600">
              {t("heroEyebrow")}
            </p>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.1] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-stone-600">{t("heroSubtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/ciudades" className={buttonClasses({ size: "lg" })}>
                {t("heroCtaCities")}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link
                href="/estancias-largas"
                className={buttonClasses({ variant: "secondary", size: "lg" })}
              >
                {t("heroCtaLongStays")}
              </Link>
            </div>
          </div>

          {/* Sin foto, el marcador solo se muestra en pantallas grandes para no ocupar el móvil. */}
          <div
            className={`relative aspect-4/3 overflow-hidden rounded-3xl bg-sand-100 shadow-xl shadow-stone-900/5 lg:aspect-4/5 ${
              heroImage ? "" : "hidden sm:block"
            }`}
          >
            {heroImage ? (
              <Image
                src={heroImage}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <PhotoPlaceholder />
            )}
          </div>
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
