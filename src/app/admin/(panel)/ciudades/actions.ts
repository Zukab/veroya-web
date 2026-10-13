"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { citySchema } from "@/lib/admin/content-schema";
import { type AdminFormState, adminFieldErrors, errorState } from "@/lib/admin/form";
import { removeMediaUrls } from "@/lib/admin/storage";
import { requireAdmin } from "@/lib/auth/admin";
import { CACHE_TAGS } from "@/lib/data/tags";

const GENERIC_ERROR = "No se pudo guardar. Inténtalo de nuevo en unos minutos.";

// Las páginas públicas muestran el nombre de la ciudad en tarjetas y fichas.
function refreshPublicPages() {
  updateTag(CACHE_TAGS.cities);
  updateTag(CACHE_TAGS.apartments);
}

// Crea (sin original_slug) o edita una ciudad. El identificador no cambia al editar.
export async function saveCity(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const originalSlug = String(formData.get("original_slug") ?? "");

  const parsed = citySchema.safeParse({
    slug: originalSlug || formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    image_url: formData.get("image_url") ?? "",
  });
  if (!parsed.success) return errorState("Revisa los campos marcados.", adminFieldErrors(parsed.error));
  const city = parsed.data;

  if (!originalSlug) {
    const { error } = await supabase.from("cities").insert(city);
    if (error?.code === "23505") {
      return errorState("Revisa los campos marcados.", { slug: "Ya existe una ciudad con ese identificador." });
    }
    if (error) {
      console.error("Panel: error al crear ciudad", error);
      return errorState(GENERIC_ERROR);
    }
    refreshPublicPages();
    redirect(`/admin/ciudades/${city.slug}?creada=1`);
  }

  const { data: before } = await supabase
    .from("cities")
    .select("image_url")
    .eq("slug", originalSlug)
    .maybeSingle();

  const { data: updated, error } = await supabase
    .from("cities")
    .update({ name: city.name, description: city.description, image_url: city.image_url })
    .eq("slug", originalSlug)
    .select("slug");
  if (error) {
    console.error("Panel: error al editar ciudad", error);
    return errorState(GENERIC_ERROR);
  }
  if (!updated?.length) return errorState("La ciudad ya no existe.");

  if (before?.image_url && before.image_url !== city.image_url) {
    await removeMediaUrls(supabase, [before.image_url]);
  }
  refreshPublicPages();
  return { status: "success", message: "Cambios guardados." };
}

export async function deleteCity(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const slug = String(formData.get("slug") ?? "");

  const { data, error } = await supabase.from("cities").delete().eq("slug", slug).select("image_url");
  if (error?.code === "23503") {
    return errorState(
      "No se puede borrar esta ciudad porque tiene apartamentos. Muévelos a otra ciudad o bórralos antes.",
    );
  }
  if (error) {
    console.error("Panel: error al borrar ciudad", error);
    return errorState("No se pudo borrar. Inténtalo de nuevo en unos minutos.");
  }
  if (!data?.length) return errorState("La ciudad ya no existe.");

  await removeMediaUrls(supabase, [data[0].image_url]);
  refreshPublicPages();
  redirect("/admin/ciudades?borrada=1");
}
