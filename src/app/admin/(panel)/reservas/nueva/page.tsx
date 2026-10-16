import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/admin";
import { readApartmentOptions, readConfirmedStays } from "../apartment-options";
import { BookingForm } from "../booking-form";

export const metadata: Metadata = { title: "Crear reserva" };

// Lee la sesión en cada petición (sin navegación instantánea; ver el layout).
export const instant = false;

export default async function NewBookingPage() {
  const { supabase } = await requireAdmin();
  const [apartments, confirmedStays] = await Promise.all([
    readApartmentOptions(supabase),
    readConfirmedStays(supabase),
  ]);

  return (
    <main className="flex-1 py-10">
      <Container className="max-w-4xl">
        <AdminPageHeader title="Crear reserva" back={{ href: "/admin/reservas", label: "Reservas" }}>
          <p className="mt-2 text-sm text-stone-600">
            Se genera un localizador y un PIN nuevos. Si las fechas se cruzan con otra reserva
            confirmada del mismo apartamento, el formulario lo avisa, pero se puede guardar igual.
          </p>
        </AdminPageHeader>
        <BookingForm apartments={apartments} confirmedStays={confirmedStays} />
      </Container>
    </main>
  );
}
