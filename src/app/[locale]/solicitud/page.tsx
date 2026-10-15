import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { RequestForm } from "@/components/bookings/request-form";
import { Container } from "@/components/ui/container";
import { getCities } from "@/lib/data/catalog";
import { getAgencySettings, whatsappUrl } from "@/lib/data/settings";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("RequestForm");
  return { title: t("metaTitle"), alternates: await localeAlternates("/solicitud") };
}

// Solicitud general de reserva, sin elegir apartamento.
export default async function RequestPage() {
  const [t, tWhatsApp, cities, settings] = await Promise.all([
    getTranslations("RequestForm"),
    getTranslations("WhatsApp"),
    getCities(),
    getAgencySettings(),
  ]);

  return (
    <main className="py-10 sm:py-14">
      <Container>
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 mb-8 max-w-2xl text-stone-600">{t("intro")}</p>
        <Suspense fallback={<div className="h-[36rem] animate-pulse rounded-3xl bg-sand-100" />}>
          <RequestForm
            cities={cities.map(({ slug, name, country, image_url }) => ({ slug, name, country, image_url }))}
            whatsappHref={whatsappUrl(settings.whatsapp, tWhatsApp("general"))}
          />
        </Suspense>
      </Container>
    </main>
  );
}
