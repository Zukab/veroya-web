import type { Metadata } from "next";
import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { requireAdmin } from "@/lib/auth/admin";
import { ApartmentForm } from "../apartment-form";

export const metadata: Metadata = { title: "Nuevo apartamento" };

// Lee la sesión en cada petición (sin navegación instantánea; ver el layout).
export const instant = false;

export default async function NewApartmentPage() {
  const { supabase } = await requireAdmin();
  const { data: cities, error } = await supabase.from("cities").select("slug, name").order("name");
  if (error) throw new Error(`No se pudieron leer las ciudades: ${error.message}`);

  return (
    <main className="flex-1 py-10">
      <Container className="max-w-4xl">
        <AdminPageHeader title="Nuevo apartamento" back={{ href: "/admin/apartamentos", label: "Apartamentos" }} />
        {cities.length === 0 ? (
          <EmptyState>
            Antes hay que crear al menos una{" "}
            <Link href="/admin/ciudades/nueva" className="font-medium text-terracotta-700 underline">
              ciudad
            </Link>
            .
          </EmptyState>
        ) : (
          <ApartmentForm cities={cities} />
        )}
      </Container>
    </main>
  );
}
