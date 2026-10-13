import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = { title: "Reservas" };

// Provisional: el listado de reservas llega en el paso 5.
export default async function BookingsPage() {
  await requireAdmin();
  return (
    <main className="flex-1 py-10">
      <Container>
        <h1 className="font-serif text-3xl font-semibold">Reservas</h1>
      </Container>
    </main>
  );
}
