import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadVoucherData } from "@/lib/voucher/data";
import { renderVoucherPdf, voucherFileName } from "@/lib/voucher/render";
import { confirmationEmail } from "./confirmation-template";
import { sendEmail } from "./resend";
import { type EmailResult, emailErrorResult } from "./result";

export type { EmailResult };

// Envía al huésped el correo de confirmación con el voucher en PDF y el enlace de
// verificación, y anota confirmation_email_sent_at. Solo para reservas
// confirmadas. Quien llame debe haber comprobado antes que es un administrador.
// Nunca lanza: devuelve un mensaje en español para el panel.
export async function sendConfirmationEmail(bookingId: string): Promise<EmailResult> {
  try {
    const data = await loadVoucherData(bookingId);
    if (!data) return { ok: false, message: "La reserva ya no existe." };
    if (data.status !== "Confirmada") {
      return { ok: false, message: "Solo se envía el voucher de reservas confirmadas." };
    }

    const pdf = await renderVoucherPdf(data);
    const { subject, html, text } = confirmationEmail(data);
    await sendEmail({
      to: data.guest.email,
      subject,
      html,
      text,
      // Las respuestas del huésped llegan al correo de la agencia.
      replyTo: data.settings.email,
      attachments: [{ filename: voucherFileName(data.code), content: pdf }],
    });

    // Columna que solo escribe el servidor (los administradores no tienen permiso).
    const { error } = await createAdminClient()
      .from("bookings")
      .update({ confirmation_email_sent_at: new Date().toISOString() })
      .eq("id", bookingId);
    if (error) console.error("Correo: enviado, pero no se pudo anotar la fecha", error);

    return { ok: true, to: data.guest.email };
  } catch (error) {
    return emailErrorResult(error, "la confirmación");
  }
}
