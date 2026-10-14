import "server-only";
import { z } from "zod";

// Variables secretas: solo en código de servidor.
// Opcionales (el envío de correos y los enlaces del voucher avisan si faltan):
//   - SITE_URL: dirección pública de la web, sin barra final
//     (p. ej. https://euronestapartamentos.com). Para los enlaces del QR y del correo.
//   - RESEND_API_KEY y EMAIL_FROM: envío del correo de confirmación con Resend.
const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SITE_URL: z.preprocess(
    emptyToUndefined,
    z
      .url()
      .refine((url) => !url.endsWith("/"), { message: "Sin barra final" })
      .optional(),
  ),
  RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().startsWith("re_").optional()),
  EMAIL_FROM: z.preprocess(emptyToUndefined, z.string().min(3).optional()),
});

const parsed = serverEnvSchema.safeParse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  SITE_URL: process.env.SITE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
});

if (!parsed.success) {
  throw new Error(
    `Variables de entorno de servidor no válidas:\n${z.prettifyError(parsed.error)}`,
  );
}

export const serverEnv = parsed.data;
