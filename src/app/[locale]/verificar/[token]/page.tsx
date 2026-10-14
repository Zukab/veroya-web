import { CircleCheck, CircleX, Clock } from "lucide-react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { getFormatter, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { getVerifiedBooking } from "@/lib/bookings/verification";
import type { Database } from "@/types/database";

// Página a la que lleva el QR del voucher: muestra el estado actual de la reserva
// y nada más (ningún dato personal ni importe). Se lee en cada visita, sin caché.

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
    <main className="py-12 sm:py-16">
      <Container className="max-w-md">
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
  { icon: typeof CircleCheck; box: string; title: "statusConfirmed" | "statusPending" | "statusCancelled"; note: "noteConfirmed" | "notePending" | "noteCancelled" }
> = {
  Confirmada: {
    icon: CircleCheck,
    box: "border-olive-600/30 bg-olive-50 text-olive-700",
    title: "statusConfirmed",
    note: "noteConfirmed",
  },
  Pendiente: {
    icon: Clock,
    box: "border-amber-300 bg-amber-50 text-amber-800",
    title: "statusPending",
    note: "notePending",
  },
  Cancelada: {
    icon: CircleX,
    box: "border-red-200 bg-red-50 text-red-800",
    title: "statusCancelled",
    note: "noteCancelled",
  },
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

  const format = await getFormatter();
  const style = statusStyles[booking.status];
  const Icon = style.icon;
  const date = (value: string) =>
    format.dateTime(new Date(`${value}T00:00:00Z`), { dateStyle: "long", timeZone: "UTC" });
  const apartment = [booking.apartment_name, booking.city_name].filter(Boolean).join(", ");

  return (
    <div className="space-y-5 rounded-3xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
      <div role="status" className={`rounded-2xl border px-5 py-6 text-center ${style.box}`}>
        <Icon aria-hidden="true" className="mx-auto size-10" strokeWidth={1.75} />
        <h1 className="mt-2 font-serif text-2xl font-semibold">{t(style.title)}</h1>
        <p className="mt-1 text-sm">{t(style.note)}</p>
        <p className="mt-3 text-xs opacity-80">
          {t("checkedAt", {
            date: format.dateTime(new Date(), {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Europe/Madrid",
            }),
          })}
        </p>
      </div>

      <dl className="divide-y divide-dashed divide-sand-300 text-sm">
        <Row label={t("code")}>
          <span className="font-mono font-semibold tracking-wider">{booking.booking_code}</span>
        </Row>
        {apartment && <Row label={t("apartment")}>{apartment}</Row>}
        <Row label={t("checkIn")}>{date(booking.check_in)}</Row>
        <Row label={t("checkOut")}>{date(booking.check_out)}</Row>
      </dl>

      <p className="text-center text-xs text-stone-500">{t("onlyStatus")}</p>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-3">
      <dt className="text-stone-500">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function VerifySkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse space-y-5 rounded-3xl border border-sand-200 bg-white p-6 sm:p-8">
      <div className="h-36 rounded-2xl bg-sand-200" />
      <div className="space-y-3">
        <div className="h-4 rounded bg-sand-200" />
        <div className="h-4 rounded bg-sand-200" />
        <div className="h-4 w-2/3 rounded bg-sand-200" />
      </div>
    </div>
  );
}
