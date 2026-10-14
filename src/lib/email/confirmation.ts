import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadVoucherData } from "@/lib/voucher/data";
import { renderVoucherPdf, voucherFileName } from "@/lib/voucher/render";
import { confirmationEmail } from "./confirmation-template";
import { EmailNotConfiguredError, EmailSendError, ExampleAddressError, sendEmail } from "./resend";

export type EmailResult = { ok: true; to: string } | { ok: false; message: string };

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
    if (error instanceof EmailNotConfiguredError) {
      return {
        ok: false,
        message: "El envío de correos no está configurado (faltan RESEND_API_KEY y EMAIL_FROM).",
      };
    }
    if (error instanceof ExampleAddressError) {
      return { ok: false, message: "Es un correo de ejemplo (@example.com): no se envía." };
    }
    if (error instanceof EmailSendError) {
      console.error("Correo: Resend rechazó el envío", error.status, error.message);
      // Sin dominio verificado, Resend solo envía a la dirección de su cuenta.
      if (error.status === 403) {
        return {
          ok: false,
          message: `Resend no permite enviar a este destinatario todavía: hasta verificar el dominio solo envía a la dirección de la cuenta. (${error.message})`,
        };
      }
      return { ok: false, message: `Resend no aceptó el envío: ${error.message}` };
    }
    console.error("Correo: error al enviar la confirmación", error);
    return { ok: false, message: "No se pudo enviar el correo. Inténtalo de nuevo en unos minutos." };
  }
}
