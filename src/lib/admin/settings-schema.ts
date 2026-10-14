import { z } from "zod";
import { isMediaUrl } from "@/lib/media";

// Validación de los ajustes de la agencia (/admin/ajustes). Mensajes en español.

const time = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "Hora no válida (HH:MM)." });

const text = (max: number) =>
  z
    .string()
    .trim()
    .max(max, { error: `Máximo ${max} caracteres.` })
    .min(1, { error: "Obligatorio." });

export const settingsSchema = z.object({
  phone: text(40).regex(/^\+?[0-9 ()-]{6,}$/, { error: "Introduce un teléfono válido, con prefijo." }),
  // Vacío = sin botones de WhatsApp en la web.
  whatsapp: z
    .string()
    .trim()
    .max(40, { error: "Máximo 40 caracteres." })
    .refine((value) => value === "" || /^\+?[0-9 ()-]{6,}$/.test(value), {
      error: "Introduce un número válido, con prefijo (p. ej. +34 600 000 000).",
    }),
  hero_image_url: z
    .string()
    .refine((value) => value === "" || isMediaUrl(value), { error: "La foto debe estar subida al almacenamiento." })
    .transform((value) => value || null),
  email: z.string().trim().max(254, { error: "Máximo 254 caracteres." }).pipe(z.email({ error: "Correo no válido." })),
  check_in_time: time,
  check_out_time: time,
  // Una norma por línea: se quitan los espacios y las líneas vacías.
  house_rules: text(2000).transform((value) =>
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n"),
  ),
  cancellation_policy: text(2000),
  // Datos legales del titular (aviso legal y privacidad); pueden quedar vacíos.
  legal_name: z.string().trim().max(150, { error: "Máximo 150 caracteres." }),
  tax_id: z.string().trim().max(40, { error: "Máximo 40 caracteres." }),
  legal_address: z.string().trim().max(300, { error: "Máximo 300 caracteres." }),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
