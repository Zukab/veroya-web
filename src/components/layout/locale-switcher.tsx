"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const itemClasses =
  "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide transition-colors";

// Enlaces ES / EN que mantienen la página actual.
export function LocaleSwitcher() {
  const pathname = usePathname();
  return <LocaleLinks pathname={pathname} />;
}

// Versión sin ruta actual (lleva a la portada de cada idioma). Sirve de fallback
// mientras se resuelve usePathname en rutas que no se pudieron prerenderizar.
export function LocaleLinks({ pathname = "/" }: { pathname?: string }) {
  const t = useTranslations("LocaleSwitcher");
  const current = useLocale();

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="flex items-center rounded-full border border-sand-300 bg-white p-0.5"
    >
      {routing.locales.map((locale) =>
        locale === current ? (
          <span
            key={locale}
            aria-current="true"
            title={t(locale)}
            className={`${itemClasses} bg-ink text-white`}
          >
            {locale}
          </span>
        ) : (
          <Link
            key={locale}
            href={pathname}
            locale={locale}
            hrefLang={locale}
            title={t(locale)}
            className={`${itemClasses} text-stone-600 hover:text-ink`}
          >
            {locale}
          </Link>
        ),
      )}
    </div>
  );
}
