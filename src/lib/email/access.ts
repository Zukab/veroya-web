import "server-only";
import { getAgencySettings } from "@/lib/data/settings";
import { verificationUrl } from "@/lib/site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { accessEmail } from "./access-template";
import { sendEmail } from "./resend";
import { type EmailResult, emailErrorResult } from "./result";

// Envía al huésped el localizador y el PIN de su reserva, en cualquier estado.
// Quien llame debe haber comprobado antes que es un administrador. Nunca lanza.
export async function sendAccessEmail(bookingId: string): Promise<EmailResult> {
  try {
    const [{ data: booking, error }, settings] = await Promise.all([
      createAdminClient()
        .from("bookings")
        .select(
          "booking_code, booking_pin, status, locale, user_name, user_email, apartment_name, city_name, check_in, check_out, verification_token",
        )
        .eq("id", bookingId)
        .maybeSingle(),
      getAgencySettings(),
    ]);
    if (error) throw new Error(`No se pudo leer la reserva: ${error.message}`);
    if (!booking) return { ok: false, message: "La reserva ya no existe." };

    const locale = booking.locale === "en" ? "en" : "es";
    const email = accessEmail({
      locale,
      code: booking.booking_code,
      pin: booking.booking_pin,
      status: booking.status,
      guestName: booking.user_name,
      apartment: booking.apartment_name,
      city: booking.city_name,
      checkIn: booking.check_in,
      checkOut: booking.check_out,
      verificationUrl: verificationUrl(booking.verification_token, locale),
      settings,
    });
    await sendEmail({ to: booking.user_email, replyTo: settings.email, ...email });
    return { ok: true, to: booking.user_email };
  } catch (error) {
    return emailErrorResult(error, "los datos de acceso");
  }
}
