import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ApartmentGrid, ApartmentGridSkeleton } from "@/components/apartments/apartment-grid";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Link } from "@/i18n/navigation";
import { getApartmentsByCity, getCity, getCitySlugs } from "@/lib/data/catalog";

// Se prerenderizan las ciudades que existen al compilar; las nuevas se generan
// en la primera visita. Con Cache Components hace falta al menos un valor.
export async function generateStaticParams() {
  const slugs = await getCitySlugs();
  return slugs.length > 0
    ? slugs.map((ciudad) => ({ ciudad }))
    : [{ ciudad: "__sin-ciudades__" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/ciudades/[ciudad]">): Promise<Metadata> {
  const { ciudad } = await params;
  const city = await getCity(ciudad);
  if (!city) return {};

  const t = await getTranslations("City");
  return {
    title: city.name,
    description: t("metaDescription", { city: city.name }),
  };
}

export default function CityPage({ params }: PageProps<"/[locale]/ciudades/[ciudad]">) {
  return (
    <Suspense fallback={<CityPageSkeleton />}>
      <CityContent params={params} />
    </Suspense>
  );
}

// Lee los params dentro de Suspense para que la navegación muestre al instante
// el esqueleto de la página (Partial Prefetching).
async function CityContent({ params }: Pick<PageProps<"/[locale]/ciudades/[ciudad]">, "params">) {
  const { ciudad } = await params;
  const [city, apartments] = await Promise.all([getCity(ciudad), getApartmentsByCity(ciudad)]);
  if (!city) notFound();

  const t = await getTranslations("City");

  return (
    <main>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-sand-100">
          {city.image_url ? (
            <Image
              src={city.image_url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          ) : (
            <PhotoPlaceholder />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/35 to-black/10" />
        </div>

        <Container className="flex min-h-72 flex-col justify-end py-10 text-white sm:min-h-96">
          <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/80">
            <Link href="/ciudades" className="inline-flex items-center gap-1 hover:text-white">
              {t("breadcrumb")}
              <ChevronRight aria-hidden="true" className="size-4" />
            </Link>
          </nav>
          <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-6xl">
            {city.name}
          </h1>
          {city.description && (
            <p className="mt-3 max-w-2xl text-white/90 sm:text-lg">{city.description}</p>
          )}
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container>
          <h2 className="mb-8 font-serif text-3xl font-semibold tracking-tight">
            {t("apartmentsTitle", { city: city.name })}
          </h2>
          {apartments.length > 0 ? (
            <ApartmentGrid apartments={apartments} showCity={false} />
          ) : (
            <EmptyState>{t("empty")}</EmptyState>
          )}
        </Container>
      </section>
    </main>
  );
}

function CityPageSkeleton() {
  return (
    <main aria-busy="true">
      <div className="min-h-72 animate-pulse bg-sand-100 sm:min-h-96" />
      <section className="py-12 sm:py-16">
        <Container>
          <div className="mb-8 h-9 w-72 max-w-full animate-pulse rounded-lg bg-sand-200" />
          <ApartmentGridSkeleton />
        </Container>
      </section>
    </main>
  );
}
