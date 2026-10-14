import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/admin/form-status";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { inputClasses } from "@/components/ui/form";
import { BOOKING_STATUSES } from "@/lib/admin/booking-schema";
import { formatDate, formatDateTime, formatEuros, toCents } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Reservas" };

// Lee la sesión en cada petición (sin navegación instantánea; ver el layout).
export const instant = false;

const PAGE_SIZE = 25;

type Status = (typeof BOOKING_STATUSES)[number];

// Texto de búsqueda seguro para el filtro "or" de PostgREST (sin comas ni paréntesis).
function cleanQuery(value: unknown) {
  return typeof value === "string" ? value.replace(/[^\p{L}\p{N}@.\-_ ]/gu, "").trim().slice(0, 80) : "";
}

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/reservas">) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const status = BOOKING_STATUSES.includes(params.estado as Status) ? (params.estado as Status) : null;
  const query = cleanQuery(params.q);
  const page = Math.max(1, Number.parseInt(String(params.pagina ?? "1"), 10) || 1);

  let request = supabase
    .from("bookings")
    .select(
      "id, booking_code, status, source, user_name, user_email, check_in, check_out, guests, apartment_name, city_name, total_amount, created_at, booking_payments(amount)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
  if (status) request = request.eq("status", status);
  if (query) {
    request = request.or(
      `booking_code.ilike.%${query}%,user_name.ilike.%${query}%,user_email.ilike.%${query}%`,
    );
  }

  const { data: bookings, count, error } = await request;
  if (error) throw new Error(`No se pudieron leer las reservas: ${error.message}`);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const pageHref = (target: number) => {
    const search = new URLSearchParams();
    if (status) search.set("estado", status);
    if (query) search.set("q", query);
    if (target > 1) search.set("pagina", String(target));
    const text = search.toString();
    return `/admin/reservas${text ? `?${text}` : ""}`;
  };

  return (
    <main className="flex-1 py-10">
      <Container>
        <AdminPageHeader
          title="Reservas"
          actions={
            <Link href="/admin/reservas/nueva" className={buttonClasses()}>
              <Plus aria-hidden="true" className="size-4" />
              Crear reserva
            </Link>
          }
        />
        {params.borrada && <Notice>Reserva borrada.</Notice>}

        <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-stone-700">Estado</span>
            <select name="estado" defaultValue={status ?? ""} className={`${inputClasses} w-44`}>
              <option value="">Todas</option>
              {BOOKING_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-56 flex-1 text-sm">
            <span className="mb-1 block font-medium text-stone-700">Buscar</span>
            <input
              name="q"
              defaultValue={query}
              placeholder="Localizador, nombre o correo"
              className={inputClasses}
            />
          </label>
          <button type="submit" className={buttonClasses({ variant: "secondary" })}>
            Filtrar
          </button>
        </form>

        {bookings.length === 0 ? (
          <EmptyState>No hay reservas con estos filtros.</EmptyState>
        ) : (
          <ul className="divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white">
            {bookings.map((booking) => {
              const paidCents = booking.booking_payments.reduce((sum, item) => sum + toCents(item.amount), 0);
              return (
                <li key={booking.id}>
                  <Link
                    href={`/admin/reservas/${booking.id}`}
                    className="grid gap-x-6 gap-y-1 px-4 py-3 hover:bg-sand-50 md:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)_9rem]"
                  >
                    <span>
                      <span className="block font-mono text-sm font-semibold">{booking.booking_code}</span>
                      <StatusBadge status={booking.status} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{booking.user_name}</span>
                      <span className="block truncate text-sm text-stone-500">{booking.user_email}</span>
                    </span>
                    <span className="min-w-0 text-sm">
                      <span className="block truncate">
                        {booking.apartment_name || "Sin apartamento"}
                        {booking.city_name && <span className="text-stone-500"> · {booking.city_name}</span>}
                      </span>
                      <span className="block text-stone-500">
                        {formatDate(booking.check_in)} – {formatDate(booking.check_out)} · {booking.guests} huésp.
                      </span>
                    </span>
                    <span className="text-sm md:text-right">
                      <span className="block">
                        {booking.total_amount == null ? "Total sin definir" : formatEuros(booking.total_amount)}
                      </span>
                      <span className="block text-stone-500">
                        {paidCents > 0 ? `Pagado ${formatEuros(paidCents / 100)}` : "Sin pagos"}
                      </span>
                      <span className="block text-xs text-stone-400">
                        {booking.source === "web" ? "Web" : "Panel"} · {formatDateTime(booking.created_at)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {totalPages > 1 && (
          <nav aria-label="Páginas" className="mt-6 flex items-center justify-between text-sm">
            {page > 1 ? (
              <Link href={pageHref(page - 1)} className="font-medium text-terracotta-700 hover:underline">
                ← Más recientes
              </Link>
            ) : (
              <span />
            )}
            <span className="text-stone-500">
              Página {page} de {totalPages} · {count} reservas
            </span>
            {page < totalPages ? (
              <Link href={pageHref(page + 1)} className="font-medium text-terracotta-700 hover:underline">
                Más antiguas →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </Container>
    </main>
  );
}
