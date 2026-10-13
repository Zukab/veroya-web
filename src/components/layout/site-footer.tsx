import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { LocaleLinks, LocaleSwitcher } from "./locale-switcher";
import { Logo } from "./logo";
import { navLinks } from "./nav-links";

export function SiteFooter() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");

  return (
    <footer className="mt-auto border-t border-sand-200 bg-sand-100">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
        <div className="max-w-sm space-y-3">
          <Logo />
          <p className="text-sm text-stone-600">{t("tagline")}</p>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {t("explore")}
          </h2>
          <ul className="mt-3 space-y-2">
            {navLinks.map(({ href, key }) => (
              <li key={href}>
                <Link href={href} className="text-sm text-stone-700 hover:text-terracotta-700">
                  {tNav(key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {t("language")}
          </h2>
          <div className="mt-3 inline-block">
            <Suspense fallback={<LocaleLinks />}>
              <LocaleSwitcher />
            </Suspense>
          </div>
        </div>
      </Container>

      <div className="border-t border-sand-200">
        <Container className="py-5 text-xs text-stone-500">© {t("rights")}</Container>
      </div>
    </footer>
  );
}
