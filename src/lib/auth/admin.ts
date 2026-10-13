import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// Capa de acceso del panel. Cada página y cada Server Action del panel comprueban
// aquí la sesión y la pertenencia a public.admins; el proxy solo redirige a quien
// no tiene sesión. RLS en la base de datos es la última barrera.

export type AdminAccess =
  | { status: "admin"; userId: string; email: string | null }
  | { status: "forbidden"; email: string | null };

// Una vez por petición (cache de React).
export const getAdminAccess = cache(async (): Promise<AdminAccess | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;

  const userId = data.claims.sub;
  const email = typeof data.claims.email === "string" ? data.claims.email : null;

  const { data: adminRow, error: adminError } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (adminError) throw new Error(`No se pudo comprobar el administrador: ${adminError.message}`);

  return adminRow ? { status: "admin", userId, email } : { status: "forbidden", email };
});

// Para páginas: sin sesión, al login. Devuelve el acceso (admin o sin permisos).
export async function requireSession() {
  const access = await getAdminAccess();
  if (!access) redirect("/admin/login");
  return access;
}

// Para Server Actions y lecturas del panel: devuelve el cliente con la sesión del
// administrador o corta la ejecución.
export async function requireAdmin() {
  const access = await getAdminAccess();
  if (!access) redirect("/admin/login");
  if (access.status !== "admin") throw new Error("No tienes permisos de administrador.");
  return { supabase: await createClient(), userId: access.userId };
}
