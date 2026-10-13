import "server-only";
import { z } from "zod";

// Variables secretas: solo en código de servidor.
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

const parsed = serverEnvSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
});

if (!parsed.success) {
  throw new Error(
    `Variables de entorno de servidor no válidas:\n${z.prettifyError(parsed.error)}`,
  );
}

export const serverEnv = parsed.data;
