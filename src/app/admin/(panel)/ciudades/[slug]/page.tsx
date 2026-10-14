import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { Notice } from "@/components/admin/form-status";
import { AdminPageHeader, FormSection } from "@/components/admin/page-header";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/admin";
import { deleteCity } from "../actions";
import { CityForm } from "../city-form";

export const metadata: Metadata = { title: "Editar ciudad" };

export default async function EditCityPage({ params, searchParams }: PageProps<"/admin/ciudades/[slug]">) {
  const { supabase } = await requireAdmin();
  const [{ slug }, { creada }] = await Promise.all([params, searchParams]);

  const { data: city, error } = await supabase
    .from("cities")
    .select("slug, name, country, description, image_url")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`No se pudo leer la ciudad: ${error.message}`);
  if (!city) notFound();

  return (
    <main className="flex-1 py-10">
      <Container className="max-w-3xl">
        <AdminPageHeader
          title={city.name}
          back={{ href: "/admin/ciudades", label: "Ciudades" }}
          actions={
            <Link
              href={`/ciudades/${city.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm font-medium text-terracotta-700 hover:underline"
            >
              Ver en la web
              <ExternalLink aria-hidden="true" className="size-4" />
            </Link>
          }
        />
        {creada && <Notice>Ciudad creada.</Notice>}

        <CityForm city={city} />

        <div className="mt-10">
          <FormSection title="Borrar ciudad">
            <p className="mb-4 text-sm text-stone-600">
              Solo se puede borrar una ciudad sin apartamentos. También se borra su foto.
            </p>
            <DeleteButton
              action={deleteCity}
              fields={{ slug: city.slug }}
              confirmMessage={`¿Borrar la ciudad "${city.name}"? No se puede deshacer.`}
              label="Borrar ciudad"
            />
          </FormSection>
        </div>
      </Container>
    </main>
  );
}
