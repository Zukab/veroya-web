import { CalendarDays, CircleCheck, CircleX, Clock, Download, MapPin, PartyPopper, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { connection } from "next/server";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { type ReactNode, Suspense } from "react";
import { CopyButton } from "@/components/bookings/copy-button";
import { LocalTime } from "@/components/bookings/local-time";
import { PrintButton } from "@/components/bookings/print-button";
import { StaticMap } from "@/components/maps/static-map";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { nightsBetween } from "@/lib/bookings/dates";
import type { PaymentKind } from "@/lib/bookings/payment-summary";
import { getVerifiedBooking } from "@/lib/bookings/verification";
import { getAgencySettings, houseRulesList } from "@/lib/data/settings";
import { googleMapsUrl } from "@/lib/maps";
import type { Database } from "@/types/database";

// Página a la que lleva el QR del voucher (verificación oficial): estado actual de
// la reserva, datos de la estancia, titular abreviado, pago con su comprobante,
// recomendaciones de llegada y descarga del voucher. Sin correo, teléfono, PIN ni
// nombre completo del huésped. Se lee en cada visita, sin caché.

// Con Cache Components hace falta al menos un valor; los tokens reales se
// resuelven en cada visita.
export function generateStaticParams() {
  return [{ token: "__sin-token__" }];
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Verify");
  return { title: t("metaTitle"), robots: { index: false } };
}

export default function VerifyPage({ params }: PageProps<"/[locale]/verificar/[token]">) {
  return (
    <main className="py-10 sm:py-14 print:py-0">
      <Container className="max-w-xl">
        <Suspense fallback={<VerifySkeleton />}>
          <VerifyContent params={params} />
        </Suspense>
      </Container>
    </main>
  );
}

type Status = Database["public"]["Enums"]["booking_status"];

const statusStyles: Record<
  Status,
  {
    icon: typeof CircleCheck;
    box: string;
    title: "statusConfirmed" | "statusPending" | "statusCancelled";
    note: "noteConfirmed" | "notePending" | "noteCancelled";
  }
> = {
  Confirmada: { icon: CircleCheck, box: "border-olive-600/30 bg-olive-50 text-olive-700", title: "statusConfirmed", note: "noteConfirmed" },
  Pendiente: { icon: Clock, box: "border-amber-300 bg-amber-50 text-amber-800", title: "statusPending", note: "notePending" },
  Cancelada: { icon: CircleX, box: "border-red-200 bg-red-50 text-red-800", title: "statusCancelled", note: "noteCancelled" },
};

const paymentLabels = { paid: "paymentOk", partial: "partial", pending: "pending", on_arrival: "onArrival" } as const;

const paymentStyles: Record<PaymentKind, string> = {
  paid: "text-olive-700",
  partial: "text-amber-800",
  pending: "text-amber-800",
  on_arrival: "text-terracotta-700",
};

async function VerifyContent({ params }: Pick<PageProps<"/[locale]/verificar/[token]">, "params">) {
  const { token } = await params;
  // El estado y la hora de la consulta son siempre los actuales.
  await connection();
  const booking = await getVerifiedBooking(token);
  const t = await getTranslations("Verify");

  if (!booking) {
    return (
      <div className="rounded-3xl border border-sand-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <CircleX aria-hidden="true" className="mx-auto size-10 text-stone-400" strokeWidth={1.5} />
        <h1 className="mt-3 font-serif text-2xl font-semibold">{t("notFoundTitle")}</h1>
        <p className="mt-2 text-sm text-stone-600">{t("notFoundText")}</p>
        <Link href="/verificar" className="mt-5 inline-block text-sm font-medium text-terracotta-700 hover:text-terracotta-600">
          {t("lookupLink")}
        </Link>
      </div>
    );
  }

  const [format, locale, settings] = await Promise.all([getFormatter(), getLocale(), getAgencySettings()]);
  const style = statusStyles[booking.status];
  const StatusIcon = style.icon;
  const confirmed = booking.status === "Confirmada";
  const cancelled = booking.status === "Cancelada";
  const date = (value: string) => format.dateTime(new Date(`${value}T00:00:00Z`), { dateStyle: "long", timeZone: "UTC" });
  const euros = (value: number) => format.number(value, { style: "currency", currency: "EUR" });
  const nights = nightsBetween(booking.check_in, booking.check_out);
  // Momento de la consulta; se muestra en la hora del dispositivo de quien mira.
  const checkedAt = new Date().toISOString();
  const apartment = [booking.apartment_name, booking.city_name].filter(Boolean).join(" · ");
  const base = `${locale === "en" ? "/en" : ""}/verificar/${token}`;
  const methods = [...new Set(booking.payments.map((payment) => t(`methods.${payment.method}`)))].join(", ");
  const recommendations = [
    t("arrivalTimes", { checkIn: settings.check_in_time, checkOut: settings.check_out_time }),
    ...houseRulesList(settings.house_rules),
  ];

  return (
    <div className="space-y-5">
      <header className="text-center">
        <ShieldCheck aria-hidden="true" className="mx-auto size-9 rounded-full border border-sand-300 p-1.5 text-stone-600" />
        <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-stone-500">{t("official")}</p>
        <h1 className="mt-1 font-mono text-2xl font-semibold tracking-wider sm:text-3xl">{booking.booking_code}</h1>
      </header>

      <article className="overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-sm">
        {booking.cover && (
          <div className="relative aspect-16/9 bg-sand-100">
            <Image src={booking.cover} alt="" fill priority sizes="(min-width: 640px) 36rem, 100vw" className="object-cover" />
          </div>
        )}

        <div className="space-y-5 p-5 sm:p-6">
          {apartment && (
            <div>
              <h2 className="font-serif text-xl font-semibold">{apartment}</h2>
              {booking.address && (
                <p className="mt-1 flex items-start gap-1.5 text-sm text-stone-600">
                  <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-terracotta-600" />
                  {booking.address}
                </p>
              )}
              {booking.coordinates && (
                <StaticMap
                  coordinates={booking.coordinates}
                  href={googleMapsUrl(booking.address ?? "", undefined, booking.coordinates)}
                  label={t("openMap")}
                  className="mt-3 h-48 rounded-2xl border border-sand-200 sm:h-56"
                />
              )}
            </div>
          )}

          <div role="status" className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${style.box}`}>
            <StatusIcon aria-hidden="true" className="size-7 shrink-0" strokeWidth={1.75} />
            <div>
              <p className="font-serif text-lg font-semibold leading-tight">{t(style.title)}</p>
              <p className="text-xs opacity-80">
                {t(style.note)}{" "}
                <LocalTime iso={checkedAt} locale={locale} label={t("checkedAt")} />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <InfoBox label={t("code")} action={<CopyButton value={booking.booking_code} label={t("copy")} doneLabel={t("copied")} />}>
              <span className="font-mono tracking-wider">{booking.booking_code}</span>
            </InfoBox>
            <InfoBox label={t("guests")} icon={Users}>
              {t("guestsValue", { count: booking.guests })}
            </InfoBox>
            <InfoBox label={t("checkIn")} icon={CalendarDays}>
              {date(booking.check_in)}
              <span className="block text-xs text-stone-500">{t("fromTime", { time: settings.check_in_time })}</span>
            </InfoBox>
            <InfoBox label={t("checkOut")} icon={CalendarDays}>
              {date(booking.check_out)}
              <span className="block text-xs text-stone-500">
                {t("nightsUntil", { count: nights, time: settings.check_out_time })}
              </span>
            </InfoBox>
            <InfoBox label={t("holder")} className="col-span-2">
              {booking.holder}
            </InfoBox>
            {booking.companions.length > 0 && (
              <InfoBox label={t("companions")} className="col-span-2">
                {booking.companions.join(" · ")}
              </InfoBox>
            )}
          </div>

          {!cancelled && (
            <section className="rounded-2xl border border-sand-200 bg-sand-50 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[0.7rem] font-semibold uppercase tracking-wider text-stone-500">{t("paidValue")}</p>
                  <p className="mt-1 font-serif text-3xl font-semibold">{euros(booking.payment.paid)}</p>
                  {methods && <p className="mt-0.5 text-xs text-stone-500">{methods}</p>}
                </div>
                <p className={`flex items-center gap-1.5 text-sm font-medium ${paymentStyles[booking.payment.kind]}`}>
                  {booking.payment.kind === "paid" ? (
                    <CircleCheck aria-hidden="true" className="size-4" />
                  ) : (
                    <Clock aria-hidden="true" className="size-4" />
                  )}
                  {t(paymentLabels[booking.payment.kind])}
                </p>
              </div>

              {(booking.payment.total != null || booking.payments.length > 0) && (
                <dl className="mt-3 divide-y divide-dashed divide-sand-300 border-t border-sand-200 text-sm">
                  {booking.payments.map((payment, index) => (
                    <Row key={index} label={t("paymentLine", { date: date(payment.paidOn), method: t(`methods.${payment.method}`) })}>
                      {euros(payment.amount)}
                    </Row>
                  ))}
                  {booking.payment.total != null && <Row label={t("totalLine")}>{euros(booking.payment.total)}</Row>}
                  {booking.payment.pending != null && booking.payment.pending > 0 && (
                    <Row label={t("pendingLine")}>
                      <span className="text-amber-800">{euros(booking.payment.pending)}</span>
                    </Row>
                  )}
                </dl>
              )}

              {booking.payments.length > 0 && (
                <a
                  href={`${base}/comprobante`}
                  className="mt-3 inline-flex items-center gap-2 rounded-full border border-sand-300 bg-white px-4 py-2 text-sm font-medium hover:bg-sand-100 print:hidden"
                >
                  <Download aria-hidden="true" className="size-4" />
                  {t("downloadReceipt")}
                </a>
              )}
            </section>
          )}

          {confirmed && (
            <section className="rounded-2xl border border-olive-600/20 bg-olive-50 p-4 text-sm text-olive-700 sm:p-5">
              <p className="flex items-center gap-2 font-serif text-lg font-semibold">
                <PartyPopper aria-hidden="true" className="size-5" />
                {t("welcomeTitle")}
              </p>
              <p className="mt-1">{t("welcomeText")}</p>
            </section>
          )}

          {!cancelled && (
            <section>
              <h2 className="text-[0.7rem] font-semibold uppercase tracking-wider text-stone-500">{t("arrivalTitle")}</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-700 marker:text-terracotta-500">
                {recommendations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {confirmed && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200 p-4 print:hidden">
              <div>
                <p className="font-medium">{t("voucherTitle")}</p>
                <p className="text-xs text-stone-500">{t("voucherText")}</p>
              </div>
              <a
                href={`${base}/voucher`}
                className="inline-flex items-center gap-2 rounded-full bg-terracotta-600 px-4 py-2 text-sm font-medium text-white hover:bg-terracotta-700"
              >
                <Download aria-hidden="true" className="size-4" />
                {t("downloadVoucher")}
              </a>
            </div>
          )}
        </div>
      </article>

      <div className="flex flex-col items-center gap-2 text-center">
        <PrintButton label={t("print")} />
        <p className="text-xs text-stone-500">{t("receiptNote")}</p>
      </div>
    </div>
  );
}

function InfoBox({
  label,
  icon: Icon,
  action,
  className = "",
  children,
}: {
  label: string;
  icon?: typeof Users;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-xl border border-sand-200 px-3 py-2.5 ${className}`}>
      <p className="flex items-center gap-1 text-[0.65rem] font-semibold uppercase tracking-wider text-stone-500">
        {Icon && <Icon aria-hidden="true" className="size-3.5" />}
        {label}
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 font-medium">
        <div>{children}</div>
        {action}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="text-stone-600">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function VerifySkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-5">
      <div className="mx-auto h-16 w-48 rounded-xl bg-sand-200" />
      <div className="aspect-16/9 rounded-3xl bg-sand-200" />
      <div className="space-y-3">
        <div className="h-4 rounded bg-sand-200" />
        <div className="h-4 rounded bg-sand-200" />
        <div className="h-4 w-2/3 rounded bg-sand-200" />
      </div>
    </div>
  );
}
