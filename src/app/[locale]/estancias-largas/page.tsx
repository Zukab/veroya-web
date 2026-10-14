import { CalendarRange, Headset, House, Wallet } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContentPage } from "@/components/content/content-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("LongStaysPage");
  return { title: t("title"), description: t("intro") };
}

export default async function LongStaysPage() {
  const t = await getTranslations("LongStaysPage");

  return (
    <ContentPage
      title={t("title")}
      intro={t("intro")}
      sections={[
        { icon: House, title: t("s1Title"), text: t("s1Text") },
        { icon: Wallet, title: t("s2Title"), text: t("s2Text") },
        { icon: Headset, title: t("s3Title"), text: t("s3Text") },
        { icon: CalendarRange, title: t("s4Title"), text: t("s4Text") },
      ]}
      cta={{
        title: t("ctaTitle"),
        text: t("ctaText"),
        buttons: [{ label: t("ctaButton"), href: "/solicitud" }],
      }}
    />
  );
}
