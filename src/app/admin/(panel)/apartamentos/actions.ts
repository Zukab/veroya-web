"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { apartmentSchema } from "@/lib/admin/content-schema";
import { type AdminFormState, adminFieldErrors, errorState } from "@/lib/admin/form";
import { removeMediaUrls } from "@/lib/admin/storage";
import { requireAdmin } from "@/lib/auth/admin";
import { CACHE_TAGS } from "@/lib/data/tags";

const GENERIC_ERROR = "No se pudo guardar. Inténtalo de nuevo en unos minutos.";

// Las ciudades muestran cuántos apartamentos tienen.
function refreshPublicPages() {
  updateTag(CACHE_TAGS.apartments);
  updateTag(CACHE_TAGS.cities);
}

function apartmentFromForm(formData: FormData, originalId: string) {
  const field = (name: string) => formData.get(name) ?? "";
  return apartmentSchema.safeParse({
    id: originalId || field("id"),
    city_slug: field("city_slug"),
    name: field("name"),
    price: field("price"),
    rooms: field("rooms"),
    baths: field("baths"),
    size: field("size"),
    max_guests: field("max_guests"),
    min_nights: field("min_nights"),
    rating: field("rating"),
    reviews: field("reviews"),
    neighborhood: field("neighborhood"),
    description: field("description"),
    images: formData.getAll("images"),
    amenities: formData.getAll("amenities"),
  });
}

// Crea (sin original_id) o edita un apartamento. El identificador no cambia al editar.
export async function saveApartment(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const originalId = String(formData.get("original_id") ?? "");

  const parsed = apartmentFromForm(formData, originalId);
  if (!parsed.success) return errorState("Revisa los campos marcados.", adminFieldErrors(parsed.error));
  const apartment = parsed.data;

  if (!originalId) {
    const { error } = await supabase.from("apartments").insert(apartment);
    if (error?.code === "23505") {
      return errorState("Revisa los campos marcados.", { id: "Ya existe un apartamento con ese identificador." });
    }
    if (error?.code === "23503") {
      return errorState("Revisa los campos marcados.", { city_slug: "Esa ciudad ya no existe." });
    }
    if (error) {
      console.error("Panel: error al crear apartamento", error);
      return errorState(GENERIC_ERROR);
    }
    refreshPublicPages();
    redirect(`/admin/apartamentos/${apartment.id}?creado=1`);
  }

  const { data: before } = await supabase
    .from("apartments")
    .select("images")
    .eq("id", originalId)
    .maybeSingle();

  const { data: updated, error } = await supabase
    .from("apartments")
    // apartment.id es el original: el identificador no cambia.
    .update(apartment)
    .eq("id", originalId)
    .select("id");
  if (error?.code === "23503") {
    return errorState("Revisa los campos marcados.", { city_slug: "Esa ciudad ya no existe." });
  }
  if (error) {
    console.error("Panel: error al editar apartamento", error);
    return errorState(GENERIC_ERROR);
  }
  if (!updated?.length) return errorState("El apartamento ya no existe.");

  const removed = (before?.images ?? []).filter((url) => !apartment.images.includes(url));
  await removeMediaUrls(supabase, removed);
  refreshPublicPages();
  return { status: "success", message: "Cambios guardados." };
}

export async function deleteApartment(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");

  const { data, error } = await supabase.from("apartments").delete().eq("id", id).select("images");
  // Una reserva confirmada debe tener apartamento (bookings_confirmed_requires_apartment).
  if (error?.code === "23514") {
    return errorState(
      "No se puede borrar este apartamento porque tiene reservas confirmadas. Cancélalas o pásalas a otro apartamento antes.",
    );
  }
  if (error) {
    console.error("Panel: error al borrar apartamento", error);
    return errorState("No se pudo borrar. Inténtalo de nuevo en unos minutos.");
  }
  if (!data?.length) return errorState("El apartamento ya no existe.");

  await removeMediaUrls(supabase, data[0].images);
  refreshPublicPages();
  redirect("/admin/apartamentos?borrado=1");
}
