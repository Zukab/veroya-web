import { ArrowRight, Info, type LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Link } from "@/i18n/navigation";

type Section = { icon: LucideIcon; title: string; text: string };

// Estructura común de las páginas de contenido (cómo funciona, estancias largas,
// propietarios): título, introducción, bloques y llamada a la acción final.
export function ContentPage({
  title,
  intro,
  sections,
  numbered = false,
  cta,
}: {
  title: string;
  intro: string;
  sections: Section[];
  numbered?: boolean;
  cta: { title: string; text: string; button?: { label: string; href: string } };
}) {
  const t = useTranslations("ContentPage");

  return (
    <main className="pb-16 sm:pb-24">
      <section className="border-b border-sand-200 bg-sand-100">
        <Container className="py-12 sm:py-20">
          {/* Aviso visible hasta que el cliente entregue los textos definitivos. */}
          <p className="mb-6 inline-flex items-center gap-2 rounded-xl border border-terracotta-100 bg-terracotta-50 px-3 py-1 text-xs font-medium text-terracotta-700">
            <Info aria-hidden="true" className="size-3.5" />
            {t("placeholderNotice")}
          </p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-stone-600">{intro}</p>
        </Container>
      </section>

      <Container className="py-12 sm:py-16">
        <ol className="grid gap-6 sm:grid-cols-2">
          {sections.map(({ icon: Icon, title: sectionTitle, text }, index) => (
            <li
              key={sectionTitle}
              className="rounded-3xl border border-sand-200 bg-white p-6 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-full bg-terracotta-50 text-terracotta-600">
                  <Icon aria-hidden="true" className="size-5" />
                </span>
                {numbered && (
                  <span className="font-serif text-sm font-semibold text-stone-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                )}
              </div>
              <h2 className="mt-5 text-xl font-semibold">{sectionTitle}</h2>
              <p className="mt-2 leading-relaxed text-stone-600">{text}</p>
            </li>
          ))}
        </ol>
      </Container>

      <Container>
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-olive-700 px-6 py-10 text-white sm:px-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 className="font-serif text-3xl font-semibold">{cta.title}</h2>
            <p className="mt-2 text-white/80">{cta.text}</p>
          </div>
          {cta.button && (
            <Link
              href={cta.button.href}
              className={buttonClasses({
                variant: "secondary",
                className: "shrink-0 border-transparent",
              })}
            >
              {cta.button.label}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          )}
        </div>
      </Container>
    </main>
  );
}
