import { CalendarDays, FileText, KeyRound, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContentPage } from "@/components/content/content-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnersPage");
  return { title: t("title"), description: t("intro") };
}

export default async function OwnersPage() {
  const t = await getTranslations("OwnersPage");

  return (
    <ContentPage
      title={t("title")}
      intro={t("intro")}
      sections={[
        { icon: KeyRound, title: t("s1Title"), text: t("s1Text") },
        { icon: ShieldCheck, title: t("s2Title"), text: t("s2Text") },
        { icon: FileText, title: t("s3Title"), text: t("s3Text") },
        { icon: CalendarDays, title: t("s4Title"), text: t("s4Text") },
      ]}
      // Sin botón hasta tener los datos de contacto del cliente.
      cta={{ title: t("ctaTitle"), text: t("ctaText") }}
    />
  );
}
