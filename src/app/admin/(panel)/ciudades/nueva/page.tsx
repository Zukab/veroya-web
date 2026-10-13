import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/admin";
import { CityForm } from "../city-form";

export const metadata: Metadata = { title: "Nueva ciudad" };

export default async function NewCityPage() {
  await requireAdmin();
  return (
    <main className="flex-1 py-10">
      <Container className="max-w-3xl">
        <AdminPageHeader title="Nueva ciudad" back={{ href: "/admin/ciudades", label: "Ciudades" }} />
        <CityForm />
      </Container>
    </main>
  );
}
