import { Mail, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";
import { getAgencySettings, whatsappUrl } from "@/lib/data/settings";
import { LocaleLinks, LocaleSwitcher } from "./locale-switcher";
import { Logo } from "./logo";
import { navLinks } from "./nav-links";

export function SiteFooter() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");

  return (
    <footer className="mt-auto border-t border-sand-200 bg-sand-100 print:hidden">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
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
            <li>
              <Link href="/verificar" className="text-sm text-stone-700 hover:text-terracotta-700">
                {t("verify")}
              </Link>
            </li>
          </ul>
        </div>

        <FooterContact />

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
        <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-5 text-xs text-stone-500">
          <span>© {t("rights")}</span>
          <nav aria-label={t("legalNotice")} className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/aviso-legal" className="hover:text-terracotta-700">
              {t("legalNotice")}
            </Link>
            <Link href="/privacidad" className="hover:text-terracotta-700">
              {t("privacy")}
            </Link>
            <Link href="/cookies" className="hover:text-terracotta-700">
              {t("cookies")}
            </Link>
          </nav>
        </Container>
      </div>
    </footer>
  );
}

// Datos de contacto de la agencia (/admin/ajustes).
async function FooterContact() {
  const [settings, t, tWhatsApp] = await Promise.all([
    getAgencySettings(),
    getTranslations("Footer"),
    getTranslations("WhatsApp"),
  ]);
  const whatsapp = whatsappUrl(settings.whatsapp, tWhatsApp("general"));
  const linkClasses = "inline-flex items-center gap-2 text-sm text-stone-700 hover:text-terracotta-700";

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500">{t("contact")}</h2>
      <ul className="mt-3 space-y-2">
        {whatsapp && (
          <li>
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={linkClasses}>
              <MessageCircle aria-hidden="true" className="size-4 text-[#1da851]" />
              WhatsApp
            </a>
          </li>
        )}
        {settings.phone && (
          <li>
            <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className={linkClasses}>
              <Phone aria-hidden="true" className="size-4 text-terracotta-600" />
              {settings.phone}
            </a>
          </li>
        )}
        {settings.email && (
          <li>
            <a href={`mailto:${settings.email}`} className={`${linkClasses} break-all`}>
              <Mail aria-hidden="true" className="size-4 shrink-0 text-terracotta-600" />
              {settings.email}
            </a>
          </li>
        )}
      </ul>
    </div>
  );
}
