import {
  Bath,
  BedDouble,
  BedSingle,
  ChevronRight,
  DoorOpen,
  ExternalLink,
  MapPin,
  Moon,
  Ruler,
  Sofa,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AmenityIcon } from "@/components/apartments/amenity-icon";
import { ApartmentGallery } from "@/components/apartments/apartment-gallery";
import { Rating } from "@/components/apartments/rating";
import { BookingWidget } from "@/components/bookings/booking-form";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { knownAmenities } from "@/lib/amenities";
import { getApartment, getApartmentIds } from "@/lib/data/catalog";
import { priceFormat } from "@/lib/format";
import { googleMapsUrl } from "@/lib/maps";

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

  const t = await getTranslations("ApartmentPage");
  const tApartment = await getTranslations("Apartment");
  const tAmenities = await getTranslations("Amenities");
  const tBooking = await getTranslations("BookingForm");
  const format = await getFormatter();

  const amenities = knownAmenities(apartment.amenities);
  const location = [apartment.neighborhood, apartment.city.name].filter(Boolean).join(", ");
  const facts = [
    { icon: Users, label: t("maxGuests", { count: apartment.max_guests }) },
    { icon: DoorOpen, label: tApartment("rooms", { count: apartment.rooms }) },
    { icon: Bath, label: tApartment("baths", { count: apartment.baths }) },
    ...(apartment.size ? [{ icon: Ruler, label: tApartment("size", { size: apartment.size }) }] : []),
    ...(apartment.beds_double > 0
      ? [{ icon: BedDouble, label: tApartment("bedsDouble", { count: apartment.beds_double }) }]
      : []),
    ...(apartment.beds_single > 0
      ? [{ icon: BedSingle, label: tApartment("bedsSingle", { count: apartment.beds_single }) }]
      : []),
    ...(apartment.sofa_beds > 0
      ? [{ icon: Sofa, label: tApartment("sofaBeds", { count: apartment.sofa_beds }) }]
      : []),
    { icon: Moon, label: tApartment("minNights", { count: apartment.min_nights }) },
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
        </div>

        <div className="mt-6">
          <ApartmentGallery images={apartment.images} name={apartment.name} />
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-10">
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
              <section>
                <h2 className="font-serif text-2xl font-semibold">{t("about")}</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-stone-700">
                  {apartment.description}
                </p>
              </section>
            )}

            {amenities.length > 0 && (
              <section>
                <h2 className="font-serif text-2xl font-semibold">{t("amenities")}</h2>
                <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {amenities.map((amenity) => (
                    <li key={amenity} className="flex items-center gap-3 text-stone-700">
                      <AmenityIcon amenity={amenity} className="size-5 text-terracotta-600" />
                      {tAmenities(amenity)}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {apartment.address && (
              <section>
                <h2 className="font-serif text-2xl font-semibold">{t("location")}</h2>
                <p className="mt-3 flex items-start gap-3 text-stone-700">
                  <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-terracotta-600" />
                  <span>
                    {apartment.address}
                    <span className="block text-sm text-stone-500">{location}</span>
                  </span>
                </p>
                <a
                  href={googleMapsUrl(apartment.address, apartment.city.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 ml-8 inline-flex items-center gap-1.5 text-sm font-medium text-terracotta-700 hover:text-terracotta-600"
                >
                  {t("openMap")}
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              </section>
            )}
          </div>

          <aside id="reservar" className="scroll-mt-20 lg:sticky lg:top-24 lg:self-start">
            <div className="relative rounded-3xl border border-sand-200 bg-white p-6 shadow-sm">
              <p className="flex items-baseline gap-1.5">
                <span className="text-3xl font-semibold">
                  {format.number(apartment.price, priceFormat)}
                </span>
                <span className="text-stone-600">{tApartment("perNight")}</span>
              </p>
              <ul className="mt-2 space-y-0.5 text-sm text-stone-600">
                <li>{tApartment("minNights", { count: apartment.min_nights })}</li>
                <li>{t("maxGuests", { count: apartment.max_guests })}</li>
              </ul>
              <hr className="my-5 border-sand-200" />
              <BookingWidget
                apartmentId={apartment.id}
                price={apartment.price}
                maxGuests={apartment.max_guests}
              />
            </div>
          </aside>
        </div>
      </Container>

      {/* Móvil: barra fija con el precio que lleva al formulario. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sand-200 bg-white/95 backdrop-blur lg:hidden">
        <Container className="flex items-center justify-between gap-4 py-3">
          <p className="flex items-baseline gap-1">
            <span className="text-lg font-semibold">
              {format.number(apartment.price, priceFormat)}
            </span>
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

function ApartmentPageSkeleton() {
  return (
    <main aria-busy="true" className="pb-16">
      <Container className="animate-pulse pt-6 sm:pt-8">
        <div className="h-4 w-40 rounded bg-sand-200" />
        <div className="mt-4 h-9 w-2/3 rounded-lg bg-sand-200" />
        <div className="mt-3 h-4 w-1/3 rounded bg-sand-200" />
        <div className="mt-6 aspect-4/3 rounded-2xl bg-sand-200 sm:aspect-21/9 sm:rounded-3xl" />
        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
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
