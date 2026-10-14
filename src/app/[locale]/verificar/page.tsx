import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LookupForm } from "@/components/bookings/lookup-form";
import { Container } from "@/components/ui/container";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Verify");
  return { title: t("metaTitle"), robots: { index: false } };
}

export default async function LookupPage() {
  const t = await getTranslations("Verify");

  return (
    <main className="py-12 sm:py-16">
      <Container className="max-w-md">
        <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">{t("title")}</h1>
          <p className="mt-2 mb-6 text-sm text-stone-600">{t("intro")}</p>
          <LookupForm />
        </div>
      </Container>
    </main>
  );
}
