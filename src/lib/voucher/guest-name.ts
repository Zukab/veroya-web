// Nombre del titular en el voucher: abreviado para no publicar el nombre completo.
//   "Laura Martín Gómez"     → "Laura Martín G."
//   "María José García López" → "María José G. L."
//   "Juan de la Cruz"        → "Juan C."
//   "John Smith"             → "John S."
// Con tres palabras o más (sin contar partículas) se mantienen las dos primeras;
// con dos, solo la primera. El resto se queda en iniciales.

const PARTICLES = new Set(["de", "del", "la", "las", "los", "y", "e", "da", "das", "do", "dos", "di", "van", "von"]);

export function abbreviateGuestName(fullName: string) {
  const words = fullName
    .trim()
    .split(/\s+/)
    .filter((word) => word && !PARTICLES.has(word.toLocaleLowerCase("es")));
  if (words.length <= 1) return words[0] ?? "";

  const keep = words.length >= 3 ? 2 : 1;
  const initials = words.slice(keep).map((word) => `${word.charAt(0).toLocaleUpperCase("es")}.`);
  return [...words.slice(0, keep), ...initials].join(" ");
}

// Nombre de pila para saludar en el correo.
export function firstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? "";
}
