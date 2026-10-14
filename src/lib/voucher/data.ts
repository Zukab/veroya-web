import "server-only";
import { type AmenityKey, knownAmenities } from "@/lib/amenities";
import { toCents } from "@/lib/admin/format";
import { nightsBetween } from "@/lib/bookings/dates";
import { type AgencySettings, getAgencySettings } from "@/lib/data/settings";
import { createAdminClient } from "@/lib/supabase/admin";
import { verificationUrl } from "@/lib/site-url";
import type { Database } from "@/types/database";
import { abbreviateGuestName } from "./guest-name";

// Datos del voucher y del correo de confirmación de una reserva. Lee con la clave
// secreta: quien llame debe haber comprobado antes que es un administrador
// (requireAdmin).

export type PaymentKind = "paid" | "partial" | "pending" | "on_arrival";

export type VoucherData = {
  bookingId: string;
  code: string;
  status: Database["public"]["Enums"]["booking_status"];
  locale: "es" | "en";
  issuedAt: Date;
  // Marca de agua "DOCUMENTO DE PRUEBA": en desarrollo y con correos @example.com.
  test: boolean;
  guest: { fullName: string; voucherName: string; email: string; count: number };
  checkIn: string;
  checkOut: string;
  nights: number;
  apartment: {
    name: string;
    city: string;
    address: string;
    rooms: number | null;
    baths: number | null;
    size: number | null;
    bedsDouble: number;
    bedsSingle: number;
    sofaBeds: number;
    amenities: AmenityKey[];
  };
  // Importes en euros.
  payment: { kind: PaymentKind; total: number | null; paid: number };
  verificationUrl: string;
  confirmationEmailSentAt: string | null;
  settings: AgencySettings;
};

export async function loadVoucherData(bookingId: string): Promise<VoucherData | null> {
  const [{ data: booking, error }, settings] = await Promise.all([
    createAdminClient()
      .from("bookings")
      .select(
        "id, booking_code, status, locale, user_name, user_email, guests, check_in, check_out, apartment_name, city_name, payment_terms, total_amount, verification_token, confirmation_email_sent_at, apartment:apartments(address, rooms, baths, size, beds_double, beds_single, sofa_beds, amenities, city:cities(name)), booking_payments(amount)",
      )
      .eq("id", bookingId)
      .maybeSingle(),
    getAgencySettings(),
  ]);
  if (error) throw new Error(`No se pudo leer la reserva: ${error.message}`);
  if (!booking) return null;

  const locale = booking.locale === "en" ? "en" : "es";
  const apartment = booking.apartment;
  const paidCents = booking.booking_payments.reduce((sum, payment) => sum + toCents(payment.amount), 0);
  const totalCents = booking.total_amount == null ? null : toCents(booking.total_amount);

  let kind: PaymentKind;
  if (paidCents > 0) kind = totalCents == null || paidCents >= totalCents ? "paid" : "partial";
  else kind = booking.payment_terms === "al_llegar" ? "on_arrival" : "pending";

  return {
    bookingId: booking.id,
    code: booking.booking_code,
    status: booking.status,
    locale,
    issuedAt: new Date(),
    test: process.env.NODE_ENV !== "production" || booking.user_email.toLowerCase().endsWith("@example.com"),
    guest: {
      fullName: booking.user_name,
      voucherName: abbreviateGuestName(booking.user_name),
      email: booking.user_email,
      count: booking.guests,
    },
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    nights: nightsBetween(booking.check_in, booking.check_out),
    apartment: {
      name: booking.apartment_name,
      city: apartment?.city.name ?? booking.city_name,
      address: apartment?.address ?? "",
      rooms: apartment?.rooms ?? null,
      baths: apartment?.baths ?? null,
      size: apartment?.size ?? null,
      bedsDouble: apartment?.beds_double ?? 0,
      bedsSingle: apartment?.beds_single ?? 0,
      sofaBeds: apartment?.sofa_beds ?? 0,
      amenities: knownAmenities(apartment?.amenities ?? []),
    },
    payment: {
      kind,
      total: totalCents == null ? null : totalCents / 100,
      paid: paidCents / 100,
    },
    verificationUrl: verificationUrl(booking.verification_token, locale),
    confirmationEmailSentAt: booking.confirmation_email_sent_at,
    settings,
  };
}
