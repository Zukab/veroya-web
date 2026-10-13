import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  // Español sin prefijo (/ciudades) e inglés con prefijo (/en/ciudades).
  localePrefix: "as-needed",
  // Siempre español salvo que la URL diga /en: sin redirecciones por idioma del
  // navegador ni cookie de idioma.
  localeDetection: false,
  localeCookie: false,
});
