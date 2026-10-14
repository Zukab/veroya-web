import { createTranslator } from "next-intl";
import en from "../../../messages/en.json";
import es from "../../../messages/es.json";
import { firstName } from "@/lib/voucher/guest-name";
import type { VoucherData } from "@/lib/voucher/data";

// Correo de confirmación (HTML con estilos en línea y versión de texto), en el
// idioma de la reserva. Todo texto que viene de la base de datos se escapa.

function escape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function confirmationEmail(data: VoucherData) {
  const { locale, apartment, settings } = data;
  const messages = (locale === "en" ? en : es) as typeof es;
  const t = createTranslator({ locale, messages, namespace: "ConfirmationEmail" });

  const intlLocale = locale === "en" ? "en-GB" : "es-ES";
  const dateFormat = new Intl.DateTimeFormat(intlLocale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const day = (value: string) => dateFormat.format(new Date(`${value}T00:00:00Z`));

  const apartmentLabel = [apartment.name, apartment.city].filter(Boolean).join(", ");
  const rows: [string, string][] = [
    [t("code"), data.code],
    [t("apartment"), apartmentLabel],
    ...(apartment.address ? ([[t("address"), apartment.address]] as [string, string][]) : []),
    [t("checkIn"), t("checkInValue", { date: day(data.checkIn), time: settings.check_in_time })],
    [t("checkOut"), t("checkOutValue", { date: day(data.checkOut), time: settings.check_out_time })],
    [t("guests"), t("guestsValue", { count: data.guest.count })],
  ];

  const subject = t("subject", { code: data.code });
  const greeting = t("greeting", { name: firstName(data.guest.fullName) });
  const intro = t("intro", { apartment: apartmentLabel });
  const help = t("help", { phone: settings.phone });

  const text = [
    greeting,
    "",
    intro,
    "",
    `${t("details")}:`,
    ...rows.map(([label, value]) => `- ${label}: ${value}`),
    "",
    `${t("verifyButton")}: ${data.verificationUrl}`,
    t("verifyNote"),
    "",
    help,
    "",
    t("signature"),
  ].join("\n");

  const html = `<!doctype html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escape(subject)}</title></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Helvetica,Arial,sans-serif;color:#1c1917;">
<span style="display:none;max-height:0;overflow:hidden;">${escape(t("preheader"))}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e8dfd2;border-radius:16px;">
<tr><td style="padding:28px 28px 8px;">
<div style="font-family:Georgia,serif;font-size:24px;font-weight:bold;">Euronest</div>
<div style="font-size:10px;font-weight:bold;letter-spacing:3px;color:#b4532a;">APARTAMENTOS</div>
</td></tr>
<tr><td style="padding:16px 28px 0;">
<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#4a5740;">${escape(t("title"))}</h1>
<p style="margin:0 0 12px;font-size:15px;line-height:1.5;">${escape(greeting)}</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.5;">${escape(intro)}</p>
</td></tr>
<tr><td style="padding:0 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;border:1px solid #e8dfd2;border-radius:12px;">
<tr><td style="padding:14px 16px 4px;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#6b635b;">${escape(t("details"))}</td></tr>
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:6px 16px;font-size:14px;line-height:1.4;"><span style="color:#6b635b;">${escape(label)}:</span> <strong>${escape(value)}</strong></td></tr>`,
  )
  .join("\n")}
<tr><td style="height:10px;"></td></tr>
</table>
</td></tr>
<tr><td align="center" style="padding:24px 28px 8px;">
<a href="${escape(data.verificationUrl)}" style="display:inline-block;background:#b4532a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 24px;border-radius:999px;">${escape(t("verifyButton"))}</a>
</td></tr>
<tr><td style="padding:4px 28px 0;">
<p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:#6b635b;text-align:center;">${escape(t("verifyNote"))}</p>
<p style="margin:0 0 8px;font-size:14px;line-height:1.5;">${escape(help)}</p>
<p style="margin:0 0 28px;font-size:14px;line-height:1.5;">${escape(t("signature"))}</p>
</td></tr>
</table>
<p style="margin:16px 0 0;font-size:12px;color:#6b635b;">Euronest Apartamentos · ${escape(settings.phone)} · ${escape(settings.email)}</p>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}
