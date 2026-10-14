import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { LocaleLinks, LocaleSwitcher } from "./locale-switcher";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { navLinks } from "./nav-links";

export function SiteHeader() {
  const t = useTranslations("Nav");

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/90 backdrop-blur">
      <Container className="relative flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label={t("mainNavigation")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map(({ href, key }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="rounded-full px-3 py-2 text-sm font-medium whitespace-nowrap text-stone-700 transition-colors hover:bg-sand-100 hover:text-ink"
                >
                  {t(key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Envuelto: "hidden" no puede ir junto al inline-flex del botón. */}
          <div className="hidden xl:block">
            <Link href="/solicitud" className={buttonClasses({ className: "h-9 px-4 whitespace-nowrap" })}>
              {t("request")}
            </Link>
          </div>
          <Suspense fallback={<LocaleLinks />}>
            <LocaleSwitcher />
          </Suspense>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
