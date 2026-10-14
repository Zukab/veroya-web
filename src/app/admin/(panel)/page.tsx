import { redirect } from "next/navigation";

// Lee la sesión en cada petición (sin navegación instantánea; ver el layout).
export const instant = false;

export default function AdminHomePage() {
  redirect("/admin/reservas");
}
