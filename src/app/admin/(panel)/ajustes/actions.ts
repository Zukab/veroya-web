"use server";

import { updateTag } from "next/cache";
import { type AdminFormState, adminFieldErrors, errorState } from "@/lib/admin/form";
import { settingsSchema } from "@/lib/admin/settings-schema";
import { requireAdmin } from "@/lib/auth/admin";
import { CACHE_TAGS } from "@/lib/data/tags";

export async function saveSettings(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const field = (name: string) => formData.get(name) ?? "";
  const parsed = settingsSchema.safeParse({
    phone: field("phone"),
    email: field("email"),
    check_in_time: field("check_in_time"),
    check_out_time: field("check_out_time"),
    house_rules: field("house_rules"),
    cancellation_policy: field("cancellation_policy"),
  });
  if (!parsed.success) return errorState("Revisa los campos marcados.", adminFieldErrors(parsed.error));

  const { data, error } = await supabase.from("agency_settings").update(parsed.data).eq("id", true).select("id");
  if (error) {
    console.error("Panel: error al guardar ajustes", error);
    return errorState("No se pudo guardar. Inténtalo de nuevo en unos minutos.");
  }
  if (!data?.length) return errorState("No se encontraron los ajustes de la agencia.");

  updateTag(CACHE_TAGS.settings);
  return { status: "success", message: "Ajustes guardados. Se usarán en los próximos vouchers y correos." };
}
