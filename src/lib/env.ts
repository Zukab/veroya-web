import { z } from "zod";

// Variables públicas: se incluyen en el JavaScript del navegador.
// Deben leerse con process.env.NOMBRE literal para que Next.js las sustituya.
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .url()
    .refine((url) => new URL(url).pathname === "/", {
      message: "Debe ser solo la URL base del proyecto (https://<ref>.supabase.co), sin /rest/v1",
    }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1)
    .refine((key) => !key.startsWith("sb_secret_"), {
      message: "La clave secreta no puede ir en una variable pública",
    }),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  throw new Error(
    `Variables de entorno públicas no válidas:\n${z.prettifyError(parsed.error)}`,
  );
}

export const publicEnv = parsed.data;
