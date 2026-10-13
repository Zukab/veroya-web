// Destino tras el login: solo rutas del panel (evita redirecciones abiertas).
export function safeNextPath(next: unknown) {
  return typeof next === "string" &&
    /^\/admin(\/[\w\-/]*)?$/.test(next) &&
    next !== "/admin/login"
    ? next
    : "/admin/reservas";
}
