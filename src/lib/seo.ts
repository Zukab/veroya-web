import type { Metadata } from "next";
import { getLocale } from "next-intl/server";

// Enlaces canonical y hreflang (es/en) de una página pública indexable.
// `path` es la ruta en español, sin prefijo ("/" o "/ciudades"); el
// metadataBase del layout la completa con el dominio.
export async function localeAlternates(path: string): Promise<Metadata["alternates"]> {
  const locale = await getLocale();
  const en = path === "/" ? "/en" : `/en${path}`;
  return {
    canonical: locale === "en" ? en : path,
    languages: { es: path, en, "x-default": path },
  };
}
