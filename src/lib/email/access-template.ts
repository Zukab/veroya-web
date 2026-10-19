import { createTranslator } from "next-intl";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";
import { firstName } from "@/lib/voucher/guest-name";
import type { Database } from "@/types/database";
import { renderEmail } from "./layout";

// Correo con los datos de acceso (localizador y PIN) de una reserva en cualquier
// estado. Lo envía el equipo desde la ficha de la reserva.

export type AccessEmailData = {
  locale: "es" | "en";
  code: string;
  pin: string;
  status: Database["public"]["Enums"]["booking_status"];
  guestName: string;
  apartment: string;
  city: string;
  checkIn: string;
  checkOut: string;
  verificationUrl: string;
  settings: { phone: string; email: string; whatsapp: string };
};

export function accessEmail(data: AccessEmailData) {
  const { locale, settings } = data;
  const messages = (locale === "en" ? en : es) as typeof es;
  const t = createTranslator({ locale, messages, namespace: "AccessEmail" });

  const dateFormat = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const day = (value: string) => dateFormat.format(new Date(`${value}T00:00:00Z`));

  return renderEmail({
    locale,
    subject: t("subject", { code: data.code }),
    preheader: t("preheader"),
    title: t("title"),
    paragraphs: [t("greeting", { name: firstName(data.guestName) }), t("intro")],
    detailsTitle: t("details"),
    rows: [
      [t("code"), data.code],
      [t("pin"), data.pin],
      [t("status"), t(`statuses.${data.status}`)],
      data.apartment
        ? [t("apartment"), [data.apartment, data.city].filter(Boolean).join(", ")]
        : [t("city"), data.city],
      [t("checkIn"), day(data.checkIn)],
      [t("checkOut"), day(data.checkOut)],
    ],
    button: { label: t("statusButton"), href: data.verificationUrl },
    note: t("statusNote"),
    closing: [t("help", { phone: settings.whatsapp || settings.phone }), t("signature")],
    contact: { phone: settings.phone, email: settings.email },
  });
}
