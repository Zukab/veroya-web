import Link from "next/link";
import "./globals.css";

// Se muestra cuando no hay un layout de idioma válido (por ejemplo, /archivo.txt).
export default function GlobalNotFound() {
  return (
    <html lang="es">
      <body className="flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Página no encontrada</h1>
        <Link href="/" className="font-medium underline underline-offset-4">
          Volver al inicio
        </Link>
      </body>
    </html>
  );
}
