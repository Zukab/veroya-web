import { createTranslator } from "next-intl";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";
import { fullAddress } from "@/lib/voucher/address";
import type { VoucherData } from "@/lib/voucher/data";
import { firstName } from "@/lib/voucher/guest-name";
import { renderEmail } from "./layout";

// Correo de confirmación (con el voucher adjunto), en el idioma de la reserva.
export function confirmationEmail(data: VoucherData) {
  const { locale, apartment, settings } = data;
  const messages = (locale === "en" ? en : es) as typeof es;
  const t = createTranslator({ locale, messages, namespace: "ConfirmationEmail" });

  const dateFormat = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const day = (value: string) => dateFormat.format(new Date(`${value}T00:00:00Z`));
  const apartmentLabel = [apartment.name, apartment.city].filter(Boolean).join(", ");

  return renderEmail({
    locale,
    subject: t("subject", { code: data.code }),
    preheader: t("preheader"),
    title: t("title"),
    paragraphs: [t("greeting", { name: firstName(data.guest.fullName) }), t("intro", { apartment: apartmentLabel })],
    detailsTitle: t("details"),
    rows: [
      [t("code"), data.code],
      [t("pin"), data.pin],
      [t("apartment"), apartmentLabel],
      ...(apartment.address ? ([[t("address"), fullAddress(apartment)]] as [string, string][]) : []),
      [t("checkIn"), t("checkInValue", { date: day(data.checkIn), time: settings.check_in_time })],
      [t("checkOut"), t("checkOutValue", { date: day(data.checkOut), time: settings.check_out_time })],
      [t("guests"), t("guestsValue", { count: data.guest.count })],
    ],
    button: { label: t("verifyButton"), href: data.verificationUrl },
    note: t("verifyNote"),
    closing: [t("help", { phone: settings.phone }), t("signature")],
    contact: { phone: settings.phone, email: settings.email },
  });
}
