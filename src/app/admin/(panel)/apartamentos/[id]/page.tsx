import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/admin/delete-button";
import { Notice } from "@/components/admin/form-status";
import { AdminPageHeader, FormSection } from "@/components/admin/page-header";
import { Container } from "@/components/ui/container";
import { formatDate } from "@/lib/admin/format";
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

  const [apartmentResult, citiesResult, confirmedResult] = await Promise.all([
    supabase
      .from("apartments")
      .select(
        "id, city_slug, name, price, rooms, baths, size, max_guests, rating, reviews, min_nights, beds_double, beds_single, sofa_beds, address, neighborhood, description, images, amenities",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase.from("cities").select("slug, name").order("name"),
    // Las reservas confirmadas impiden borrar el apartamento: se listan para resolverlas.
    supabase
      .from("bookings")
      .select("id, booking_code, user_name, check_in, check_out")
      .eq("apartment_id", id)
      .eq("status", "Confirmada")
      .order("check_in"),
  ]);
  if (apartmentResult.error) throw new Error(`No se pudo leer el apartamento: ${apartmentResult.error.message}`);
  if (citiesResult.error) throw new Error(`No se pudieron leer las ciudades: ${citiesResult.error.message}`);
  if (confirmedResult.error) throw new Error(`No se pudieron leer las reservas: ${confirmedResult.error.message}`);
  const apartment = apartmentResult.data;
  if (!apartment) notFound();
  const confirmed = confirmedResult.data;

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
            {confirmed.length > 0 ? (
              <>
                <p className="mb-3 text-sm text-stone-600">
                  Tiene {confirmed.length === 1 ? "1 reserva confirmada" : `${confirmed.length} reservas confirmadas`}.
                  Para poder borrarlo, abre cada una y cancélala, pásala a otro apartamento o bórrala:
                </p>
                <ul className="divide-y divide-sand-200 rounded-xl border border-sand-200 bg-white text-sm">
                  {confirmed.map((booking) => (
                    <li key={booking.id}>
                      <Link
                        href={`/admin/reservas/${booking.id}`}
                        className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 hover:bg-sand-50"
                      >
                        <span>
                          <span className="font-mono font-medium text-ink">{booking.booking_code}</span>
                          <span className="text-stone-600"> · {booking.user_name}</span>
                        </span>
                        <span className="text-stone-500">
                          {formatDate(booking.check_in)} – {formatDate(booking.check_out)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <p className="mb-4 text-sm text-stone-600">
                  Las reservas pendientes o canceladas se conservan con el nombre del apartamento.
                  También se borran sus fotos.
                </p>
                <DeleteButton
                  action={deleteApartment}
                  fields={{ id: apartment.id }}
                  confirmMessage={`¿Borrar el apartamento "${apartment.name}"? No se puede deshacer.`}
                  label="Borrar apartamento"
                />
              </>
            )}
          </FormSection>
        </div>
      </Container>
    </main>
  );
}
