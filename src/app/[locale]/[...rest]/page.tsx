import { notFound } from "next/navigation";

// Cualquier ruta desconocida dentro de un idioma muestra el 404 traducido de
// app/[locale]/not-found.tsx.
export default function CatchAllPage() {
  notFound();
}
