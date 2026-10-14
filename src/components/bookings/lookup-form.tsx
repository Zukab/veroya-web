"use client";

import { useLocale, useTranslations } from "next-intl";
import { useActionState } from "react";
import { type LookupState, lookupBooking } from "@/app/[locale]/verificar/actions";
import { buttonClasses } from "@/components/ui/button";
import { Field, FormAlert, inputClasses } from "@/components/ui/form";

const initialState: LookupState = { status: "idle" };

// Consulta de una reserva con localizador y PIN. Si coinciden, la acción lleva a
// la página de verificación de esa reserva.
export function LookupForm() {
  const t = useTranslations("Verify");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(lookupBooking, initialState);
  const error = state.status === "error" ? state.error : null;

  return (
    <form action={formAction} className="space-y-4">
      {error && <FormAlert>{t(error)}</FormAlert>}
      <input type="hidden" name="locale" value={locale} />

      <div className="grid grid-cols-[1fr_7rem] gap-3">
        <Field id="lookup-code" label={t("code")}>
          <input
            id="lookup-code"
            name="code"
            required
            maxLength={20}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            placeholder={t("codePlaceholder")}
            defaultValue={state.status === "error" ? state.code : ""}
            className={`${inputClasses} font-mono uppercase tracking-wider`}
          />
        </Field>
        <Field id="lookup-pin" label={t("pin")}>
          <input
            id="lookup-pin"
            name="pin"
            required
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            autoComplete="off"
            className={`${inputClasses} font-mono tracking-[0.3em]`}
          />
        </Field>
      </div>

      <button type="submit" disabled={pending} className={buttonClasses({ className: "w-full" })}>
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
