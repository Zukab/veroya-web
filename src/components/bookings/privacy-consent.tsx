"use client";

import { useLocale, useTranslations } from "next-intl";

// Casilla obligatoria de aceptación de la política de privacidad en los
// formularios públicos. El enlace se abre en otra pestaña para no perder lo escrito.
export function PrivacyConsent({ id, error }: { id: string; error?: string }) {
  const t = useTranslations("BookingForm");
  const locale = useLocale();

  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-2.5 text-sm text-stone-700">
        <input
          id={id}
          name="privacy"
          type="checkbox"
          value="yes"
          required
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 size-4 shrink-0 accent-terracotta-600"
        />
        <span>
          {t.rich("privacyConsent", {
            link: (chunks) => (
              <a
                href={locale === "en" ? "/en/privacidad" : "/privacidad"}
                target="_blank"
                rel="noopener"
                className="font-medium text-terracotta-700 underline underline-offset-2"
              >
                {chunks}
              </a>
            ),
          })}
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
