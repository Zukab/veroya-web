import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { Notice } from "@/components/admin/form-status";
import { AdminPageHeader, FormSection } from "@/components/admin/page-header";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/admin";
import { deleteApartment } from "../actions";
import { ApartmentForm } from "../apartment-form";

export const metadata: Metadata = { title: "Editar apartamento" };

// Lee la sesión en cada petición (sin navegación instantánea; ver el layout).
export const instant = false;

export default async function EditApartmentPage({
  params,
  searchParams,
}: PageProps<"/admin/apartamentos/[id]">) {
  const { supabase } = await requireAdmin();
  const [{ id }, { creado }] = await Promise.all([params, searchParams]);

  const [apartmentResult, citiesResult] = await Promise.all([
    supabase
      .from("apartments")
      .select(
        "id, city_slug, name, price, rooms, baths, size, max_guests, rating, reviews, min_nights, beds_double, beds_single, sofa_beds, address, neighborhood, description, images, amenities",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("cities").select("slug, name").order("name"),
  ]);
  if (apartmentResult.error) throw new Error(`No se pudo leer el apartamento: ${apartmentResult.error.message}`);
  if (citiesResult.error) throw new Error(`No se pudieron leer las ciudades: ${citiesResult.error.message}`);
  const apartment = apartmentResult.data;
  if (!apartment) notFound();

  return (
    <main className="flex-1 py-10">
      <Container className="max-w-4xl">
        <AdminPageHeader
          title={apartment.name}
          back={{ href: "/admin/apartamentos", label: "Apartamentos" }}
          actions={
            <Link
              href={`/apartamento/${apartment.id}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm font-medium text-terracotta-700 hover:underline"
            >
              Ver en la web
              <ExternalLink aria-hidden="true" className="size-4" />
            </Link>
          }
        />
        {creado && <Notice>Apartamento creado.</Notice>}

        <ApartmentForm apartment={apartment} cities={citiesResult.data} />

        <div className="mt-10">
          <FormSection title="Borrar apartamento">
            <p className="mb-4 text-sm text-stone-600">
              No se puede borrar si tiene reservas confirmadas. Las reservas pendientes o
              canceladas se conservan con el nombre del apartamento. También se borran sus fotos.
            </p>
            <DeleteButton
              action={deleteApartment}
              fields={{ id: apartment.id }}
              confirmMessage={`¿Borrar el apartamento "${apartment.name}"? No se puede deshacer.`}
              label="Borrar apartamento"
            />
          </FormSection>
        </div>
      </Container>
    </main>
  );
}
