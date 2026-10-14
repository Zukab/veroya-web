// Diseño común de los correos (HTML con estilos en línea, que es lo que entienden
// los clientes de correo) y versión de texto. Todo el texto se escapa.

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export type EmailContent = {
  locale: string;
  subject: string;
  preheader: string;
  title: string;
  paragraphs: string[];
  detailsTitle: string;
  rows: [string, string][];
  button: { label: string; href: string };
  note: string;
  closing: string[];
  contact: { phone: string; email: string };
};

export function renderEmail(content: EmailContent) {
  const { locale, subject, preheader, title, paragraphs, detailsTitle, rows, button, note, closing, contact } =
    content;
  const e = escapeHtml;

  const html = `<!doctype html>
<html lang="${e(locale)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${e(subject)}</title></head>
<body style="margin:0;padding:0;background:#faf7f2;font-family:Helvetica,Arial,sans-serif;color:#1c1917;">
<span style="display:none;max-height:0;overflow:hidden;">${e(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e8dfd2;border-radius:16px;">
<tr><td style="padding:28px 28px 8px;">
<div style="font-family:Georgia,serif;font-size:24px;font-weight:bold;">Euronest</div>
<div style="font-size:10px;font-weight:bold;letter-spacing:3px;color:#b4532a;">APARTAMENTOS</div>
</td></tr>
<tr><td style="padding:16px 28px 0;">
<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-size:22px;color:#4a5740;">${e(title)}</h1>
${paragraphs.map((text) => `<p style="margin:0 0 12px;font-size:15px;line-height:1.5;">${e(text)}</p>`).join("\n")}
</td></tr>
<tr><td style="padding:8px 28px 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;border:1px solid #e8dfd2;border-radius:12px;">
<tr><td style="padding:14px 16px 4px;font-size:11px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#6b635b;">${e(detailsTitle)}</td></tr>
${rows
  .map(
    ([label, value]) =>
      `<tr><td style="padding:6px 16px;font-size:14px;line-height:1.4;"><span style="color:#6b635b;">${e(label)}:</span> <strong>${e(value)}</strong></td></tr>`,
  )
  .join("\n")}
<tr><td style="height:10px;"></td></tr>
</table>
</td></tr>
<tr><td align="center" style="padding:24px 28px 8px;">
<a href="${e(button.href)}" style="display:inline-block;background:#b4532a;color:#ffffff;text-decoration:none;font-weight:bold;font-size:15px;padding:12px 24px;border-radius:999px;">${e(button.label)}</a>
</td></tr>
<tr><td style="padding:4px 28px 0;">
<p style="margin:0 0 20px;font-size:13px;line-height:1.5;color:#6b635b;text-align:center;">${e(note)}</p>
${closing.map((text, index) => `<p style="margin:0 0 ${index === closing.length - 1 ? 28 : 8}px;font-size:14px;line-height:1.5;">${e(text)}</p>`).join("\n")}
</td></tr>
</table>
<p style="margin:16px 0 0;font-size:12px;color:#6b635b;">Euronest Apartamentos · ${e(contact.phone)} · ${e(contact.email)}</p>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    ...paragraphs.flatMap((paragraph) => [paragraph, ""]),
    `${detailsTitle}:`,
    ...rows.map(([label, value]) => `- ${label}: ${value}`),
    "",
    `${button.label}: ${button.href}`,
    note,
    "",
    ...closing.flatMap((paragraph) => [paragraph, ""]),
  ]
    .join("\n")
    .trim();

  return { subject, html, text };
}
