import "server-only";
import { type AmenityKey, knownAmenities } from "@/lib/amenities";
import { nightsBetween } from "@/lib/bookings/dates";
import { type PaymentKind, paymentSummary } from "@/lib/bookings/payment-summary";
import { type AgencySettings, getAgencySettings } from "@/lib/data/settings";
import { type Coordinates, coordinatesOf } from "@/lib/maps";
import { createAdminClient } from "@/lib/supabase/admin";
import { verificationUrl } from "@/lib/site-url";
import type { Database } from "@/types/database";

// Datos del voucher, del comprobante de pago y del correo de confirmación de una
// reserva. Lee con la clave secreta: quien llame debe haber comprobado antes el
// acceso (requireAdmin en el panel, o el token del QR en /verificar).

export type { PaymentKind };

export type VoucherData = {
  bookingId: string;
  code: string;
  status: Database["public"]["Enums"]["booking_status"];
  locale: "es" | "en";
  issuedAt: Date;
  // Marca de agua "DOCUMENTO DE PRUEBA": en desarrollo y con correos @example.com.
  test: boolean;
  guest: { fullName: string; email: string; count: number };
  checkIn: string;
  checkOut: string;
  nights: number;
  apartment: {
    name: string;
    city: string;
    country: string;
    address: string;
    coordinates: Coordinates | null;
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
  payments: { amount: number; paidOn: string; method: Database["public"]["Enums"]["payment_method"] }[];
  verificationUrl: string;
  confirmationEmailSentAt: string | null;
  settings: AgencySettings;
};

export async function loadVoucherData(bookingId: string): Promise<VoucherData | null> {
  const [{ data: booking, error }, settings] = await Promise.all([
    createAdminClient()
      .from("bookings")
      .select(
        "id, booking_code, status, locale, user_name, user_email, guests, check_in, check_out, apartment_name, city_name, payment_terms, total_amount, verification_token, confirmation_email_sent_at, apartment:apartments(address, latitude, longitude, rooms, baths, size, beds_double, beds_single, sofa_beds, amenities, city:cities(name, country)), booking_payments(amount, paid_on, method, created_at)",
      )
      .eq("id", bookingId)
      .maybeSingle(),
    getAgencySettings(),
  ]);
  if (error) throw new Error(`No se pudo leer la reserva: ${error.message}`);
  if (!booking) return null;

  const locale = booking.locale === "en" ? "en" : "es";
  const apartment = booking.apartment;
  const { kind, total, paid } = paymentSummary({
    total: booking.total_amount,
    payments: booking.booking_payments,
    terms: booking.payment_terms,
  });

  return {
    bookingId: booking.id,
    code: booking.booking_code,
    status: booking.status,
    locale,
    issuedAt: new Date(),
    test: process.env.NODE_ENV !== "production" || booking.user_email.toLowerCase().endsWith("@example.com"),
    guest: {
      fullName: booking.user_name.trim(),
      email: booking.user_email,
      count: booking.guests,
    },
    checkIn: booking.check_in,
    checkOut: booking.check_out,
    nights: nightsBetween(booking.check_in, booking.check_out),
    apartment: {
      name: booking.apartment_name,
      city: apartment?.city.name ?? booking.city_name,
      country: apartment?.city.country ?? "",
      address: apartment?.address ?? "",
      coordinates: apartment ? coordinatesOf(apartment) : null,
      rooms: apartment?.rooms ?? null,
      baths: apartment?.baths ?? null,
      size: apartment?.size ?? null,
      bedsDouble: apartment?.beds_double ?? 0,
      bedsSingle: apartment?.beds_single ?? 0,
      sofaBeds: apartment?.sofa_beds ?? 0,
      amenities: knownAmenities(apartment?.amenities ?? []),
    },
    payment: { kind, total, paid },
    payments: [...booking.booking_payments]
      .sort((a, b) => a.paid_on.localeCompare(b.paid_on) || a.created_at.localeCompare(b.created_at))
      .map(({ amount, paid_on, method }) => ({ amount: Number(amount), paidOn: paid_on, method })),
    verificationUrl: verificationUrl(booking.verification_token, locale),
    confirmationEmailSentAt: booking.confirmation_email_sent_at,
    settings,
  };
}

// Id de la reserva a partir del token del QR (para las descargas públicas).
export async function bookingIdByToken(token: string) {
  if (!/^[0-9a-f]{32}$/.test(token)) return null;
  const { data, error } = await createAdminClient()
    .from("bookings")
    .select("id")
    .eq("verification_token", token)
    .maybeSingle();
  if (error) throw new Error(`No se pudo leer la reserva: ${error.message}`);
  return data?.id ?? null;
}
