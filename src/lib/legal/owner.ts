import { getAgencySettings } from "@/lib/data/settings";
import type { LegalOwner } from "./content";

// Datos del titular para los textos legales (de /admin/ajustes).
export async function getLegalOwner(): Promise<LegalOwner> {
  const settings = await getAgencySettings();
  return {
    name: settings.legal_name,
    taxId: settings.tax_id,
    address: settings.legal_address,
    email: settings.email,
    phone: settings.phone,
  };
}
