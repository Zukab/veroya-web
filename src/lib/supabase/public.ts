import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";

// Cliente sin sesión para leer datos públicos (ciudades y apartamentos) desde el
// servidor. No lee cookies, así que las páginas públicas pueden cachearse.
export function createPublicClient() {
  return createClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
}
