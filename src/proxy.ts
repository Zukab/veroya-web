import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateAdminSession } from "./lib/supabase/proxy";

const intlProxy = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // El panel no tiene idiomas: sesión de Supabase y redirección al login.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return updateAdminSession(request);
  }

  return intlProxy(request);
}

export const config = {
  // Todas las rutas excepto /api, /_next, /_vercel y archivos con extensión
  // (favicon.ico, imágenes, etc.).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
