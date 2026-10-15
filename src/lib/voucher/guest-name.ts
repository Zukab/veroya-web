// Nombre de pila para saludar en los correos ("Laura Martín Gómez" → "Laura").
export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? "";
}
