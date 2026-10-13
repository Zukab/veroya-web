import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CityGrid } from "@/components/cities/city-grid";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCities } from "@/lib/data/catalog";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Cities");
  return { title: t("title"), description: t("subtitle") };
}

export default async function CitiesPage() {
  const t = await getTranslations("Cities");
  const cities = await getCities();

  return (
    <main className="py-12 sm:py-16">
      <Container>
        <SectionHeading as="h1" title={t("title")} subtitle={t("subtitle")} />
        {cities.length > 0 ? <CityGrid cities={cities} /> : <EmptyState>{t("empty")}</EmptyState>}
      </Container>
    </main>
  );
}
