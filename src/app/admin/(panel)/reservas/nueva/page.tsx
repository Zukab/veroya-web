import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/admin";
import { readApartmentOptions } from "../apartment-options";
import { BookingForm } from "../booking-form";

export const metadata: Metadata = { title: "Crear reserva" };

export default async function NewBookingPage() {
  const { supabase } = await requireAdmin();
  const apartments = await readApartmentOptions(supabase);

  return (
    <main className="flex-1 py-10">
      <Container className="max-w-4xl">
        <AdminPageHeader title="Crear reserva" back={{ href: "/admin/reservas", label: "Reservas" }}>
          <p className="mt-2 text-sm text-stone-600">
            Se genera un localizador y un PIN nuevos. Si se crea como confirmada, no puede cruzarse
            con otra reserva confirmada del mismo apartamento.
          </p>
        </AdminPageHeader>
        <BookingForm apartments={apartments} />
      </Container>
    </main>
  );
}
