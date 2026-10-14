import "server-only";
import { createTranslator } from "next-intl";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";
import { getAgencySettings } from "@/lib/data/settings";
import { verificationUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { firstName } from "@/lib/voucher/guest-name";
import { renderEmail } from "./layout";
import { EmailNotConfiguredError, sendEmail } from "./resend";

// Acuse de recibo de una solicitud hecha en la web (formulario del apartamento o
// solicitud general): localizador, PIN, datos y enlace de estado. Sin voucher: el
// voucher llega al confirmar. Se envía después de responder al huésped (after());
// si falla, solo se registra: la solicitud ya está guardada.
export async function sendRequestReceivedEmail(bookingId: string) {
  try {
    const [{ data: booking, error }, settings] = await Promise.all([
      createAdminClient()
        .from("bookings")
        .select(
          "booking_code, booking_pin, locale, user_name, user_email, guests, check_in, check_out, apartment_name, city_name, verification_token",
        )
        .eq("id", bookingId)
        .maybeSingle(),
      getAgencySettings(),
    ]);
    if (error || !booking) throw new Error(error?.message ?? "La reserva no existe");

    const locale = booking.locale === "en" ? "en" : "es";
    const messages = (locale === "en" ? en : es) as typeof es;
    const t = createTranslator({ locale, messages, namespace: "RequestEmail" });
    const dateFormat = new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    });
    const day = (value: string) => dateFormat.format(new Date(`${value}T00:00:00Z`));

    const email = renderEmail({
      locale,
      subject: t("subject", { code: booking.booking_code }),
      preheader: t("preheader"),
      title: t("title"),
      paragraphs: [t("greeting", { name: firstName(booking.user_name) }), t("intro")],
      detailsTitle: t("details"),
      rows: [
        [t("code"), booking.booking_code],
        [t("pin"), booking.booking_pin],
        booking.apartment_name
          ? [t("apartment"), [booking.apartment_name, booking.city_name].filter(Boolean).join(", ")]
          : [t("city"), booking.city_name],
        [t("checkIn"), day(booking.check_in)],
        [t("checkOut"), day(booking.check_out)],
        [t("guests"), t("guestsValue", { count: booking.guests })],
      ],
      button: { label: t("statusButton"), href: verificationUrl(booking.verification_token, locale) },
      note: t("statusNote"),
      closing: [t("help", { phone: settings.whatsapp || settings.phone }), t("signature")],
      contact: { phone: settings.phone, email: settings.email },
    });

    await sendEmail({ to: booking.user_email, replyTo: settings.email, ...email });
  } catch (error) {
    if (error instanceof EmailNotConfiguredError) return;
    console.error("Correo: no se pudo enviar el acuse de la solicitud", bookingId, error);
  }
}
