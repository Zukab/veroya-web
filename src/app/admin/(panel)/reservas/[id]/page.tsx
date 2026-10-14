import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { Notice } from "@/components/admin/form-status";
import { AdminPageHeader, FormSection } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { paymentMethodLabels, paymentTermsLabels } from "@/lib/admin/booking-schema";
import { formatDate, formatDateTime, formatEuros, toCents } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/admin";
import { todayInSpain } from "@/lib/bookings/dates";
import { verificationUrl } from "@/lib/site-url";
import { deleteBooking, deletePayment } from "../actions";
import { readApartmentOptions } from "../apartment-options";
import { BookingForm } from "../booking-form";
import { PaymentForm } from "../payment-form";
import { SendVoucherButton } from "../send-voucher-button";

export const metadata: Metadata = { title: "Reserva" };

// Lee la sesión en cada petición (sin navegación instantánea; ver el layout).
export const instant = false;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function BookingPage({ params, searchParams }: PageProps<"/admin/reservas/[id]">) {
  const { supabase } = await requireAdmin();
  const [{ id }, { creada, correo }] = await Promise.all([params, searchParams]);
  if (!UUID.test(id)) notFound();

  const [bookingResult, apartments] = await Promise.all([
    supabase
      .from("bookings")
      .select(
        "id, booking_code, booking_pin, status, source, created_at, confirmed_at, confirmation_email_sent_at, verification_token, apartment_id, apartment_name, city_name, check_in, check_out, guests, user_name, user_email, user_phone, user_country, message, locale, payment_terms, total_amount, booking_payments(id, amount, paid_on, method, note, created_at)",
      )
      .eq("id", id)
      .maybeSingle(),
    readApartmentOptions(supabase),
  ]);
  if (bookingResult.error) throw new Error(`No se pudo leer la reserva: ${bookingResult.error.message}`);
  const booking = bookingResult.data;
  if (!booking) notFound();

  const payments = [...booking.booking_payments].sort(
    (a, b) => a.paid_on.localeCompare(b.paid_on) || a.created_at.localeCompare(b.created_at),
  );
  const paidCents = payments.reduce((sum, payment) => sum + toCents(payment.amount), 0);
  const totalCents = booking.total_amount == null ? null : toCents(booking.total_amount);

  return (
    <main className="flex-1 py-10">
      <Container className="max-w-4xl">
        <AdminPageHeader
          title={booking.booking_code}
          back={{ href: "/admin/reservas", label: "Reservas" }}
          actions={<StatusBadge status={booking.status} />}
        />
        {creada && (
          <Notice>
            Reserva creada.
            {correo === "enviado" && ` Correo de confirmación enviado a ${booking.user_email}.`}
          </Notice>
        )}
        {correo === "fallido" && (
          <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            No se pudo enviar el correo de confirmación. Usa «Enviar por correo» en la sección
            «Voucher» para reintentarlo y ver el motivo.
          </p>
        )}

        <dl className="mb-8 grid grid-cols-2 gap-4 rounded-2xl border border-sand-200 bg-white p-5 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-stone-500">PIN</dt>
            <dd className="font-mono text-base font-semibold tracking-widest">{booking.booking_pin}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Origen</dt>
            <dd>{booking.source === "web" ? "Formulario web" : "Panel"}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Creada</dt>
            <dd>{formatDateTime(booking.created_at)}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Confirmada</dt>
            <dd>{booking.confirmed_at ? formatDateTime(booking.confirmed_at) : "—"}</dd>
          </div>
        </dl>

        <BookingForm booking={booking} apartments={apartments} />

        <div className="mt-10 space-y-6">
          <FormSection title="Voucher">
            {booking.status === "Confirmada" ? (
              <p className="mb-4 text-sm text-stone-600">
                PDF con los datos de la estancia y un QR que lleva a la página de verificación. Al
                confirmar la reserva se envía automáticamente por correo al huésped.
                <span className="mt-1 block">
                  Correo de confirmación:{" "}
                  <strong>
                    {booking.confirmation_email_sent_at
                      ? `enviado el ${formatDateTime(booking.confirmation_email_sent_at)}`
                      : "no enviado"}
                  </strong>
                </span>
              </p>
            ) : (
              <p className="mb-4 text-sm text-stone-600">
                El voucher se puede descargar y enviar cuando la reserva esté confirmada. Al
                confirmarla, se envía automáticamente por correo al huésped.
              </p>
            )}
            <div className="flex flex-wrap items-start gap-3">
              {booking.status === "Confirmada" && (
                <a href={`/admin/reservas/${booking.id}/voucher`} download className={buttonClasses()}>
                  Descargar voucher (PDF)
                </a>
              )}
              <a
                href={verificationUrl(booking.verification_token, booking.locale)}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: "secondary" })}
              >
                Ver página de verificación
              </a>
              {booking.status === "Confirmada" && (
                <SendVoucherButton
                  bookingId={booking.id}
                  email={booking.user_email}
                  sent={Boolean(booking.confirmation_email_sent_at)}
                />
              )}
            </div>
          </FormSection>

          <FormSection title="Pagos">
            <dl className="mb-5 grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-stone-500">Total de la estancia</dt>
                <dd className="text-base font-semibold">
                  {totalCents == null ? "Sin definir" : formatEuros(totalCents / 100)}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Pagado</dt>
                <dd className="text-base font-semibold">{formatEuros(paidCents / 100)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Pendiente</dt>
                <dd className="text-base font-semibold">
                  {totalCents == null ? "—" : formatEuros(Math.max(0, totalCents - paidCents) / 100)}
                </dd>
              </div>
            </dl>
            {paidCents === 0 && (
              <p className="mb-5 text-sm text-stone-600">
                Sin pagos registrados: el voucher dirá «{paymentTermsLabels[booking.payment_terms]}».
              </p>
            )}

            {payments.length > 0 && (
              <ul className="mb-6 divide-y divide-sand-200 rounded-xl border border-sand-200">
                {payments.map((payment) => (
                  <li key={payment.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span>
                      <span className="font-semibold">{formatEuros(payment.amount)}</span>
                      <span className="text-stone-500">
                        {" "}
                        · {paymentMethodLabels[payment.method]} · {formatDate(payment.paid_on)}
                      </span>
                      {payment.note && <span className="block text-stone-500">{payment.note}</span>}
                    </span>
                    <DeleteButton
                      action={deletePayment}
                      fields={{ payment_id: payment.id }}
                      confirmMessage={`¿Borrar el pago de ${formatEuros(payment.amount)}?`}
                      label="Borrar pago"
                    />
                  </li>
                ))}
              </ul>
            )}

            {/* La key vacía el formulario después de registrar un pago. */}
            <PaymentForm key={payments.length} bookingId={booking.id} today={todayInSpain()} />
          </FormSection>

          <FormSection title="Borrar reserva">
            <p className="mb-4 text-sm text-stone-600">Se borran también sus pagos. No se puede deshacer.</p>
            <DeleteButton
              action={deleteBooking}
              fields={{ booking_id: booking.id }}
              confirmMessage={`¿Borrar la reserva ${booking.booking_code}? No se puede deshacer.`}
              label="Borrar reserva"
            />
          </FormSection>
        </div>
      </Container>
    </main>
  );
}
