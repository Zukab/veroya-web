import "server-only";
import { EmailNotConfiguredError, EmailSendError, ExampleAddressError } from "./resend";

// Resultado de los correos que se envían desde el panel: nunca lanzan, devuelven un
// mensaje en español para mostrarlo.
export type EmailResult = { ok: true; to: string } | { ok: false; message: string };

export function emailErrorResult(error: unknown, context: string): EmailResult {
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
    console.error(`Correo: Resend rechazó ${context}`, error.status, error.message);
    // Sin dominio verificado, Resend solo envía a la dirección de su cuenta.
    if (error.status === 403) {
      return {
        ok: false,
        message: `Resend no permite enviar a este destinatario todavía: hasta verificar el dominio solo envía a la dirección de la cuenta. (${error.message})`,
      };
    }
    return { ok: false, message: `Resend no aceptó el envío: ${error.message}` };
  }
  console.error(`Correo: error al enviar ${context}`, error);
  return { ok: false, message: "No se pudo enviar el correo. Inténtalo de nuevo en unos minutos." };
}
