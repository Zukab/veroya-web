import { FileText, Handshake, House, KeyRound } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContentPage } from "@/components/content/content-page";
import { getAgencySettings, whatsappUrl } from "@/lib/data/settings";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("OwnersPage");
  return {
    title: t("title"),
    description: t("intro"),
    alternates: await localeAlternates("/propietarios"),
  };
}

export default async function OwnersPage() {
  const [t, settings] = await Promise.all([getTranslations("OwnersPage"), getAgencySettings()]);
  // Contacto de /admin/ajustes: WhatsApp con mensaje ya escrito y correo.
  const whatsapp = whatsappUrl(settings.whatsapp, t("whatsAppMessage"));

  return (
    <ContentPage
      title={t("title")}
      intro={t("intro")}
      sections={[
        { icon: Handshake, title: t("s1Title"), text: t("s1Text") },
        { icon: KeyRound, title: t("s2Title"), text: t("s2Text") },
        { icon: House, title: t("s3Title"), text: t("s3Text") },
        { icon: FileText, title: t("s4Title"), text: t("s4Text") },
      ]}
      cta={{
        title: t("ctaTitle"),
        text: t("ctaText"),
        buttons: [
          ...(whatsapp ? [{ label: t("ctaWhatsApp"), href: whatsapp, external: true }] : []),
          ...(settings.email ? [{ label: t("ctaEmail"), href: `mailto:${settings.email}`, external: true }] : []),
        ],
      }}
    />
  );
}
