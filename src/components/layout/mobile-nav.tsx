"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { Link } from "@/i18n/navigation";
import { navLinks } from "./nav-links";

// Menú desplegable para móvil. Usa <details>, así que funciona sin JavaScript;
// con JavaScript se cierra al elegir un enlace.
export function MobileNav() {
  const t = useTranslations("Nav");
  const detailsRef = useRef<HTMLDetailsElement>(null);

  function close() {
    detailsRef.current?.removeAttribute("open");
  }

  return (
    <details ref={detailsRef} className="group md:hidden">
      <summary
        aria-label={t("menu")}
        className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full text-ink hover:bg-sand-100 [&::-webkit-details-marker]:hidden"
      >
        <Menu className="size-5 group-open:hidden" />
        <X className="hidden size-5 group-open:block" />
      </summary>
      <nav
        aria-label={t("mainNavigation")}
        className="absolute inset-x-0 top-full border-b border-sand-200 bg-sand-50 shadow-lg"
      >
        <ul className="flex flex-col px-4 py-2">
          {navLinks.map(({ href, key }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={close}
                className="block border-b border-sand-200 py-3 text-base font-medium last:border-0"
              >
                {t(key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}
