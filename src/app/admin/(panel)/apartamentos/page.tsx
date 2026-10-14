import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/admin/form-status";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Apartamentos" };

// Lee la sesión en cada petición (sin navegación instantánea; ver el layout).
export const instant = false;

export default async function AdminApartmentsPage({ searchParams }: PageProps<"/admin/apartamentos">) {
  const { supabase } = await requireAdmin();
  const { borrado } = await searchParams;

  const { data: apartments, error } = await supabase
    .from("apartments")
    .select("id, name, price, min_nights, max_guests, images, neighborhood, city:cities(name)")
    .order("city_slug")
    .order("name");
  if (error) throw new Error(`No se pudieron leer los apartamentos: ${error.message}`);

  return (
    <main className="flex-1 py-10">
      <Container>
        <AdminPageHeader
          title="Apartamentos"
          actions={
            <Link href="/admin/apartamentos/nuevo" className={buttonClasses()}>
              <Plus aria-hidden="true" className="size-4" />
              Nuevo apartamento
            </Link>
          }
        />
        {borrado && <Notice>Apartamento borrado.</Notice>}

        {apartments.length === 0 ? (
          <EmptyState>Todavía no hay apartamentos.</EmptyState>
        ) : (
          <ul className="divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white">
            {apartments.map((apartment) => (
              <li key={apartment.id}>
                <Link
                  href={`/admin/apartamentos/${apartment.id}`}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-sand-50"
                >
                  <span className="size-14 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                    {apartment.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element -- miniatura del panel
                      <img src={apartment.images[0]} alt="" className="size-full object-cover" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{apartment.name}</span>
                    <span className="block truncate text-sm text-stone-500">
                      {[apartment.neighborhood, apartment.city.name].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                  <span className="hidden text-right text-sm text-stone-600 sm:block">
                    <span className="block font-medium text-ink">{apartment.price} € / noche</span>
                    mín. {apartment.min_nights} · hasta {apartment.max_guests} huésp.
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </main>
  );
}
