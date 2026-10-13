import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Notice } from "@/components/admin/form-status";
import { AdminPageHeader } from "@/components/admin/page-header";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Ciudades" };

export default async function AdminCitiesPage({ searchParams }: PageProps<"/admin/ciudades">) {
  const { supabase } = await requireAdmin();
  const { borrada } = await searchParams;

  const { data: cities, error } = await supabase
    .from("cities")
    .select("slug, name, image_url, apartments(count)")
    .order("name");
  if (error) throw new Error(`No se pudieron leer las ciudades: ${error.message}`);

  return (
    <main className="flex-1 py-10">
      <Container>
        <AdminPageHeader
          title="Ciudades"
          actions={
            <Link href="/admin/ciudades/nueva" className={buttonClasses()}>
              <Plus aria-hidden="true" className="size-4" />
              Nueva ciudad
            </Link>
          }
        />
        {borrada && <Notice>Ciudad borrada.</Notice>}

        {cities.length === 0 ? (
          <EmptyState>Todavía no hay ciudades.</EmptyState>
        ) : (
          <ul className="divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white">
            {cities.map((city) => {
              const count = city.apartments[0]?.count ?? 0;
              return (
                <li key={city.slug}>
                  <Link
                    href={`/admin/ciudades/${city.slug}`}
                    className="flex items-center gap-4 px-4 py-3 hover:bg-sand-50"
                  >
                    <span className="size-12 shrink-0 overflow-hidden rounded-lg bg-sand-100">
                      {city.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element -- miniatura del panel
                        <img src={city.image_url} alt="" className="size-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{city.name}</span>
                      <span className="block truncate text-sm text-stone-500">/{city.slug}</span>
                    </span>
                    <span className="text-sm text-stone-600">
                      {count} {count === 1 ? "apartamento" : "apartamentos"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </main>
  );
}
