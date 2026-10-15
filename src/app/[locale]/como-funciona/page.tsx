import { CircleCheck, Luggage, Search, Send } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContentPage } from "@/components/content/content-page";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HowItWorksPage");
  return {
    title: t("title"),
    description: t("intro"),
    alternates: await localeAlternates("/como-funciona"),
  };
}

export default async function HowItWorksPage() {
  const t = await getTranslations("HowItWorksPage");

  return (
    <ContentPage
      title={t("title")}
      intro={t("intro")}
      numbered
      sections={[
        { icon: Search, title: t("s1Title"), text: t("s1Text") },
        { icon: Send, title: t("s2Title"), text: t("s2Text") },
        { icon: CircleCheck, title: t("s3Title"), text: t("s3Text") },
        { icon: Luggage, title: t("s4Title"), text: t("s4Text") },
      ]}
      cta={{
        title: t("ctaTitle"),
        text: t("ctaText"),
        buttons: [{ label: t("ctaButton"), href: "/solicitud" }],
      }}
    />
  );
}
