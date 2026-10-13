import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";

// Cliente del navegador para el panel de administración (p. ej. subir fotos a
// Storage con la sesión del administrador).
export function createClient() {
  return createBrowserClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
