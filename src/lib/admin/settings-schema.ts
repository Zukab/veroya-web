import { z } from "zod";

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
});

export type SettingsInput = z.infer<typeof settingsSchema>;
