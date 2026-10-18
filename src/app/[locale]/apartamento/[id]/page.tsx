import {
  Bath,
  BedDouble,
  BedSingle,
  CalendarCheck,
  ChevronRight,
  Clock,
  DoorOpen,
  ExternalLink,
  FileCheck,
  MapPin,
  MessageCircle,
  Moon,
  Ruler,
  Send,
  Sofa,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { type ReactNode, Suspense } from "react";
import { AmenityIcon } from "@/components/apartments/amenity-icon";
import { ApartmentGallery } from "@/components/apartments/apartment-gallery";
import { ApartmentGrid } from "@/components/apartments/apartment-grid";
import { Rating } from "@/components/apartments/rating";
import { BookingWidget } from "@/components/bookings/booking-form";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { knownAmenities } from "@/lib/amenities";
import { getApartment, getApartmentIds, getApartmentsByCity } from "@/lib/data/catalog";
import { getAgencySettings, houseRulesList, whatsappUrl } from "@/lib/data/settings";
import { LONG_STAY_MIN_NIGHTS, priceFormat } from "@/lib/format";
import { StaticMap } from "@/components/maps/static-map";
import { coordinatesOf, googleMapsUrl } from "@/lib/maps";
import { localeAlternates } from "@/lib/seo";
import { siteUrl } from "@/lib/site-url";

const SIMILAR_LIMIT = 3;

// Se prerenderizan los apartamentos que existen al compilar; los nuevos se
// generan en la primera visita. Con Cache Components hace falta al menos un valor.
export async function generateStaticParams() {
  const ids = await getApartmentIds();
  return ids.length > 0 ? ids.map((id) => ({ id })) : [{ id: "__sin-apartamentos__" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/apartamento/[id]">): Promise<Metadata> {
  const { id } = await params;
  const apartment = await getApartment(id);
  if (!apartment) return {};

  const t = await getTranslations("ApartmentPage");
  const format = await getFormatter();
  const cover = apartment.images[0];

  return {
    title: apartment.name,
    description: t("metaDescription", {
      name: apartment.name,
      location: [apartment.neighborhood, apartment.city.name].filter(Boolean).join(", "),
      price: format.number(apartment.price, priceFormat),
    }),
    openGraph: cover ? { images: [cover] } : undefined,
    alternates: await localeAlternates(`/apartamento/${apartment.id}`),
  };
}

export default function ApartmentPage({ params }: PageProps<"/[locale]/apartamento/[id]">) {
  return (
    <Suspense fallback={<ApartmentPageSkeleton />}>
      <ApartmentContent params={params} />
    </Suspense>
  );
}

// Lee los params dentro de Suspense para que la navegación muestre al instante
// el esqueleto de la página (Partial Prefetching).
async function ApartmentContent({
  params,
}: Pick<PageProps<"/[locale]/apartamento/[id]">, "params">) {
  const { id } = await params;
  const apartment = await getApartment(id);
  if (!apartment) notFound();

  const [t, tApartment, tAmenities, tBooking, tWhatsApp, format, locale, settings, cityApartments] =
    await Promise.all([
      getTranslations("ApartmentPage"),
      getTranslations("Apartment"),
      getTranslations("Amenities"),
      getTranslations("BookingForm"),
      getTranslations("WhatsApp"),
      getFormatter(),
      getLocale(),
      getAgencySettings(),
      getApartmentsByCity(apartment.city.slug),
    ]);

  const amenities = knownAmenities(apartment.amenities);
  const location = [apartment.neighborhood, apartment.city.name, apartment.city.country]
    .filter(Boolean)
    .join(", ");
  const facts = [
    { icon: Users, label: t("maxGuests", { count: apartment.max_guests }) },
    { icon: DoorOpen, label: tApartment("rooms", { count: apartment.rooms }) },
    { icon: Bath, label: tApartment("baths", { count: apartment.baths }) },
    ...(apartment.size ? [{ icon: Ruler, label: tApartment("size", { size: apartment.size }) }] : []),
    { icon: Moon, label: tApartment("minNights", { count: apartment.min_nights }) },
  ];
  const beds = [
    ...(apartment.beds_double > 0
      ? [{ icon: BedDouble, label: tApartment("bedsDouble", { count: apartment.beds_double }) }]
      : []),
    ...(apartment.beds_single > 0
      ? [{ icon: BedSingle, label: tApartment("bedsSingle", { count: apartment.beds_single }) }]
      : []),
    ...(apartment.sofa_beds > 0
      ? [{ icon: Sofa, label: tApartment("sofaBeds", { count: apartment.sofa_beds }) }]
      : []),
  ];
  const coordinates = coordinatesOf(apartment);
  const mapsUrl = googleMapsUrl(apartment.address, apartment.city.name, coordinates);
  const rules = houseRulesList(settings.house_rules);
  const pageUrl = `${siteUrl()}${locale === "en" ? "/en" : ""}/apartamento/${apartment.id}`;
  const whatsapp = whatsappUrl(settings.whatsapp, tWhatsApp("apartment", { name: apartment.name, url: pageUrl }));
  const similar = cityApartments.filter((item) => item.id !== apartment.id).slice(0, SIMILAR_LIMIT);
  const steps = [
    { icon: Send, title: t("how1Title"), text: t("how1Text") },
    { icon: CalendarCheck, title: t("how2Title"), text: t("how2Text") },
    { icon: FileCheck, title: t("how3Title"), text: t("how3Text") },
  ];

  return (
    <main className="pb-28 sm:pb-32 lg:pb-24">
      <Container className="pt-6 sm:pt-8">
        <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-sm text-stone-500">
          <Link href="/ciudades" className="hover:text-ink">
            {t("breadcrumb")}
          </Link>
          <ChevronRight aria-hidden="true" className="size-4" />
          <Link href={`/ciudades/${apartment.city.slug}`} className="hover:text-ink">
            {apartment.city.name}
          </Link>
        </nav>

        <h1 className="font-serif text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {apartment.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-stone-600">
          <span className="flex items-center gap-1">
            <MapPin aria-hidden="true" className="size-4" />
            {location}
          </span>
          <Rating rating={apartment.rating} reviews={apartment.reviews} />
          {apartment.min_nights >= LONG_STAY_MIN_NIGHTS && (
            <span className="rounded-full bg-olive-600 px-2.5 py-0.5 text-xs font-medium text-white">
              {tApartment("longStay")}
            </span>
          )}
        </div>

        <div className="mt-6">
          <ApartmentGallery images={apartment.images} name={apartment.name} />
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="space-y-12">
            <section aria-label={t("details")}>
              <ul className="flex flex-wrap gap-2">
                {facts.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 text-sm"
                  >
                    <Icon aria-hidden="true" className="size-4 text-terracotta-600" />
                    {label}
                  </li>
                ))}
              </ul>
            </section>

            {apartment.description && (
              <Section title={t("about")}>
                <p className="whitespace-pre-line leading-relaxed text-stone-700">{apartment.description}</p>
              </Section>
            )}

            {beds.length > 0 && (
              <Section title={t("sleepTitle")}>
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { icon: DoorOpen, label: tApartment("rooms", { count: apartment.rooms }) },
                    ...beds,
                    { icon: Bath, label: tApartment("baths", { count: apartment.baths }) },
                  ].map(({ icon: Icon, label }) => (
                    <li key={label} className="rounded-2xl border border-sand-200 bg-white p-4">
                      <Icon aria-hidden="true" className="size-6 text-terracotta-600" strokeWidth={1.5} />
                      <p className="mt-2 text-sm font-medium">{label}</p>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {amenities.length > 0 && (
              <Section title={t("amenities")}>
                <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {amenities.map((amenity) => (
                    <li key={amenity} className="flex items-center gap-3 text-stone-700">
                      <AmenityIcon amenity={amenity} className="size-5 text-terracotta-600" />
                      {tAmenities(amenity)}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {apartment.address && (
              <Section title={t("location")}>
                <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
                  {coordinates && (
                    <StaticMap coordinates={coordinates} href={mapsUrl} label={t("openMap")} />
                  )}
                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-start gap-3 text-stone-700">
                      <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-terracotta-600" />
                      <span>
                        {apartment.address}
                        <span className="block text-sm text-stone-500">{location}</span>
                      </span>
                    </p>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClasses({ variant: "secondary", className: "shrink-0" })}
                    >
                      {t("openMap")}
                      <ExternalLink aria-hidden="true" className="size-3.5" />
                    </a>
                  </div>
                </div>
              </Section>
            )}

            <Section title={t("importantTitle")}>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard icon={Clock} title={t("scheduleTitle")}>
                  <p>{t("checkInFrom", { time: settings.check_in_time })}</p>
                  <p>{t("checkOutBefore", { time: settings.check_out_time })}</p>
                  <p>{t("minStay", { count: apartment.min_nights })}</p>
                </InfoCard>
                {settings.cancellation_policy && (
                  <InfoCard icon={CalendarCheck} title={t("cancellationTitle")}>
                    <p>{settings.cancellation_policy}</p>
                  </InfoCard>
                )}
                {rules.length > 0 && (
                  <InfoCard icon={FileCheck} title={t("rulesTitle")} className="sm:col-span-2">
                    <ul className="list-disc space-y-1 pl-5 marker:text-terracotta-500">
                      {rules.map((rule) => (
                        <li key={rule}>{rule}</li>
                      ))}
                    </ul>
                  </InfoCard>
                )}
              </div>
              {locale === "en" && <p className="mt-3 text-xs text-stone-500">{t("rulesLanguage")}</p>}
            </Section>

            <Section title={t("howTitle")}>
              <ol className="grid gap-4 sm:grid-cols-3">
                {steps.map(({ icon: Icon, title, text }, index) => (
                  <li key={title} className="rounded-2xl bg-sand-100 p-5">
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-full bg-terracotta-600 text-sm font-semibold text-white">
                        {index + 1}
                      </span>
                      <Icon aria-hidden="true" className="size-5 text-terracotta-700" />
                    </div>
                    <h3 className="mt-3 font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-stone-600">{text}</p>
                  </li>
                ))}
              </ol>
            </Section>
          </div>

          <aside id="reservar" className="scroll-mt-20 lg:sticky lg:top-24 lg:self-start">
            <div className="relative rounded-3xl border border-sand-200 bg-white p-6 shadow-lg shadow-stone-900/5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-semibold">{format.number(apartment.price, priceFormat)}</span>
                  <span className="text-stone-600">{tApartment("perNight")}</span>
                </p>
                <Rating rating={apartment.rating} reviews={apartment.reviews} />
              </div>
              <ul className="mt-2 space-y-0.5 text-sm text-stone-600">
                <li>{tApartment("minNights", { count: apartment.min_nights })}</li>
                <li>{t("maxGuests", { count: apartment.max_guests })}</li>
              </ul>
              <hr className="my-5 border-sand-200" />
              <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-sand-100" />}>
                <BookingWidget apartmentId={apartment.id} price={apartment.price} maxGuests={apartment.max_guests} />
              </Suspense>
              <p className="mt-3 text-center text-xs text-stone-500">{t("noCharge")}</p>
            </div>

            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-white px-5 py-3 text-sm font-medium text-[#128c4a] transition-colors hover:bg-[#25D366]/10"
              >
                <MessageCircle aria-hidden="true" className="size-4" />
                {tWhatsApp("ask")}
              </a>
            )}
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="mt-16 border-t border-sand-200 pt-12">
            <h2 className="mb-8 font-serif text-2xl font-semibold sm:text-3xl">
              {t("similarTitle", { city: apartment.city.name })}
            </h2>
            <ApartmentGrid apartments={similar} showCity={false} />
          </section>
        )}
      </Container>

      {/* Móvil: barra fija con el precio que lleva al formulario. */}
      <div
        data-mobile-booking-bar
        className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white/95 backdrop-blur lg:hidden"
      >
        <Container className="flex items-center justify-between gap-4 py-3">
          <p className="flex items-baseline gap-1">
            <span className="text-lg font-semibold">{format.number(apartment.price, priceFormat)}</span>
            <span className="text-sm text-stone-600">{tApartment("perNight")}</span>
          </p>
          <a href="#reservar" className={buttonClasses()}>
            {tBooking("mobileCta")}
          </a>
        </Container>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 font-serif text-2xl font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function InfoCard({
  icon: Icon,
  title,
  className = "",
  children,
}: {
  icon: typeof Clock;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-2xl border border-sand-200 bg-white p-5 ${className}`}>
      <h3 className="flex items-center gap-2 font-semibold">
        <Icon aria-hidden="true" className="size-5 text-terracotta-600" />
        {title}
      </h3>
      <div className="mt-2 space-y-1 text-sm text-stone-700">{children}</div>
    </div>
  );
}

function ApartmentPageSkeleton() {
  return (
    <main aria-busy="true" className="pb-16">
      <Container className="animate-pulse pt-6 sm:pt-8">
        <div className="h-4 w-40 rounded bg-sand-200" />
        <div className="mt-4 h-9 w-2/3 rounded-lg bg-sand-200" />
        <div className="mt-3 h-4 w-1/3 rounded bg-sand-200" />
        <div className="mt-6 aspect-4/3 rounded-2xl bg-sand-200 sm:aspect-21/9 sm:rounded-3xl" />
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_23rem]">
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-sand-200" />
            <div className="h-4 w-5/6 rounded bg-sand-200" />
            <div className="h-4 w-4/6 rounded bg-sand-200" />
          </div>
          <div className="h-40 rounded-3xl bg-sand-200" />
        </div>
      </Container>
    </main>
  );
}
