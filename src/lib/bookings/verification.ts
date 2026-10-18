import "server-only";
import { paymentSummary } from "@/lib/bookings/payment-summary";
import { coordinatesOf } from "@/lib/maps";
import { createAdminClient } from "@/lib/supabase/admin";
import { fullAddress } from "@/lib/voucher/address";

// Lecturas de la página pública de verificación. bookings no tiene acceso
// público, así que se lee con la clave secreta y solo se devuelven los campos que
// la página muestra: estado, fechas, apartamento, titular y resumen de compra
// (total y pagos con fecha y forma de pago). Ni correo, ni teléfono, ni PIN. Solo
// se llega con el token del QR (128 bits) o con localizador y PIN.

const TOKEN = /^[0-9a-f]{32}$/;

export function isVerificationToken(value: string) {
  return TOKEN.test(value);
}

export async function getVerifiedBooking(token: string) {
  if (!isVerificationToken(token)) return null;

  const { data, error } = await createAdminClient()
    .from("bookings")
    .select(
      "booking_code, status, apartment_name, city_name, check_in, check_out, guests, user_name, companions, total_amount, payment_terms, booking_payments(amount, paid_on, method, created_at), apartment:apartments(images, address, latitude, longitude, city:cities(name, country))",
    )
    .eq("verification_token", token)
    .maybeSingle();

  if (error) throw new Error(`No se pudo leer la reserva: ${error.message}`);
  if (!data) return null;

  const { booking_payments: payments, total_amount, payment_terms, user_name, apartment, ...booking } = data;
  return {
    ...booking,
    // Nombre completo del titular, como en el voucher (pedido por el cliente).
    holder: user_name.trim(),
    cover: apartment?.images[0] ?? null,
    address: apartment?.address
      ? fullAddress({
          address: apartment.address,
          city: apartment.city.name,
          country: apartment.city.country,
        })
      : null,
    coordinates: apartment ? coordinatesOf(apartment) : null,
    payment: paymentSummary({ total: total_amount, payments, terms: payment_terms }),
    payments: [...payments]
      .sort((a, b) => a.paid_on.localeCompare(b.paid_on) || a.created_at.localeCompare(b.created_at))
      .map(({ amount, paid_on, method }) => ({ amount: Number(amount), paidOn: paid_on, method })),
  };
}

export type VerifiedBooking = NonNullable<Awaited<ReturnType<typeof getVerifiedBooking>>>;

// Token de verificación a partir del localizador y el PIN (o null si no coinciden).
export async function findVerificationToken(code: string, pin: string) {
  const { data, error } = await createAdminClient()
    .from("bookings")
    .select("verification_token")
    .eq("booking_code", code)
    .eq("booking_pin", pin)
    .maybeSingle();

  if (error) throw new Error(`No se pudo buscar la reserva: ${error.message}`);
  return data?.verification_token ?? null;
}
