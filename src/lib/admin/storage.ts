import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MEDIA_BUCKET, mediaPathFromUrl } from "@/lib/media";
import type { Database } from "@/types/database";

// Borra de Storage las fotos que ya no se usan (con la sesión del administrador).
// Si falla, solo se registra: una foto huérfana no rompe nada.
export async function removeMediaUrls(supabase: SupabaseClient<Database>, urls: (string | null)[]) {
  const paths = urls.map((url) => (url ? mediaPathFromUrl(url) : null)).filter((path) => path !== null);
  if (paths.length === 0) return;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  if (error) console.error("No se pudieron borrar fotos de Storage", paths, error);
}
