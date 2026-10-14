import type { Metadata } from "next";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Container } from "@/components/ui/container";
import { requireAdmin } from "@/lib/auth/admin";
import { getAgencySettings } from "@/lib/data/settings";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getAgencySettings();

  return (
    <main className="flex-1 py-10">
      <Container className="max-w-3xl">
        <AdminPageHeader title="Ajustes de la agencia">
          <p className="mt-2 text-stone-600">
            Datos que aparecen en el voucher y en el correo de confirmación de las reservas.
          </p>
        </AdminPageHeader>
        <SettingsForm settings={settings} />
      </Container>
    </main>
  );
}
