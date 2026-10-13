"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { checkRateLimit, clientIpKey } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "./next-path";

export type SignInState = { error?: string; email?: string };

const signInSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(200),
});

// Supabase Auth ya limita los intentos; esto añade un límite propio por IP.
const RATE_LIMIT = { bucket: "login-panel", max: 10, windowSeconds: 15 * 60 };

export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = signInSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { error: "Introduce tu correo y tu contraseña.", email };

  const allowed = await checkRateLimit({ ...RATE_LIMIT, key: await clientIpKey() });
  if (!allowed) return { error: "Demasiados intentos. Espera unos minutos y vuelve a probar.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Correo o contraseña incorrectos.", email };

  redirect(safeNextPath(formData.get("next")));
}
