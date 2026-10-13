import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Todas las rutas excepto /api, /_next, /_vercel y archivos con extensión
  // (favicon.ico, imágenes, etc.).
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
