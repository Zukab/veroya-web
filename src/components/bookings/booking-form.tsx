"use client";

import { CircleCheck } from "lucide-react";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { createBookingRequest } from "@/app/[locale]/apartamento/[id]/actions";
import { buttonClasses } from "@/components/ui/button";
import { Field, FormAlert, inputClasses } from "@/components/ui/form";
import { Link } from "@/i18n/navigation";
import { PrivacyConsent } from "./privacy-consent";
import { addDays, nightsBetween, todayInAgency } from "@/lib/bookings/dates";
import type { PublicBookingState } from "@/lib/bookings/form-state";
import { priceFormat } from "@/lib/format";
import { type SearchParams, parseSearchParams } from "@/lib/search";

type Props = {
  apartmentId: string;
  price: number;
  maxGuests: number;
};

const initialState: PublicBookingState = { status: "idle" };

// Formulario público de solicitud de reserva. Tras un envío correcto muestra el
// localizador y el PIN; "Hacer otra solicitud" lo vuelve a montar vacío.
// Las fechas y los huéspedes llegan rellenos desde el buscador (?entrada=…); por
// leer la URL, la página lo envuelve en <Suspense>.
export function BookingWidget(props: Props) {
  const [formKey, setFormKey] = useState(0);
  const searchParams = useSearchParams();
  const initial = parseSearchParams((name) => searchParams.get(name), todayInAgency());
  return (
    <BookingForm key={formKey} {...props} initial={initial} onReset={() => setFormKey((key) => key + 1)} />
  );
}

function BookingForm({
  apartmentId,
  price,
  maxGuests,
  initial,
  onReset,
}: Props & { initial: SearchParams; onReset: () => void }) {
  const t = useTranslations("BookingForm");
  const tError = useTranslations("BookingErrors");
  const format = useFormatter();
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(createBookingRequest, initialState);

  // Las fechas son controladas para calcular las noches y el precio orientativo.
  const [checkIn, setCheckIn] = useState(initial.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(initial.checkOut ?? "");

  if (state.status === "success") {
    const date = (value: string) =>
      format.dateTime(new Date(`${value}T00:00:00Z`), { dateStyle: "medium", timeZone: "UTC" });

    return (
      <div role="status" className="space-y-4">
        <div className="flex items-center gap-2 text-olive-700">
          <CircleCheck aria-hidden="true" className="size-6" />
          <h2 className="font-serif text-2xl font-semibold">{t("successTitle")}</h2>
        </div>
        <p className="text-sm text-stone-600">{t("successText")}</p>
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-sand-100 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{t("code")}</dt>
            <dd className="mt-1 font-mono text-xl font-semibold tracking-wider">{state.code}</dd>
          </div>
          <div className="rounded-2xl bg-sand-100 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{t("pin")}</dt>
            <dd className="mt-1 font-mono text-xl font-semibold tracking-[0.3em]">{state.pin}</dd>
          </div>
        </dl>
        <p className="text-sm text-stone-700">
          {t("stay", {
            checkIn: date(state.checkIn),
            checkOut: date(state.checkOut),
            guests: state.guests,
          })}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="button" onClick={onReset} className={buttonClasses({ variant: "secondary" })}>
            {t("newRequest")}
          </button>
          <Link href="/verificar" className="text-sm font-medium text-terracotta-700 hover:text-terracotta-600">
            {t("checkStatus")}
          </Link>
        </div>
      </div>
    );
  }

  const values = state.status === "error" ? state.values : {};
  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const errorText = (field: string) => {
    const error = fieldErrors[field];
    return error ? tError(error.key, error.values) : undefined;
  };
  const inputProps = (field: string) => ({
    id: `booking-${field}`,
    name: field,
    "aria-invalid": fieldErrors[field] ? true : undefined,
    "aria-describedby": fieldErrors[field] ? `booking-${field}-error` : undefined,
  });

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;

  return (
    <form action={formAction} noValidate className="space-y-4">
      <div>
        <h2 className="font-serif text-2xl font-semibold">{t("title")}</h2>
        <p className="mt-1 text-sm text-stone-600">{t("intro")}</p>
      </div>

      {state.status === "error" && state.formError && (
        <FormAlert>{tError(state.formError)}</FormAlert>
      )}

      <input type="hidden" name="apartment_id" value={apartmentId} />
      <input type="hidden" name="locale" value={locale} />

      {/* Campo trampa contra bots: invisible para las personas. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="booking-website">{t("honeypot")}</label>
        <input id="booking-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field id="booking-check_in" label={t("checkIn")} error={errorText("check_in")}>
          <input
            {...inputProps("check_in")}
            type="date"
            required
            value={checkIn || values.check_in || ""}
            onChange={(event) => setCheckIn(event.target.value)}
            className={inputClasses}
          />
        </Field>
        <Field id="booking-check_out" label={t("checkOut")} error={errorText("check_out")}>
          <input
            {...inputProps("check_out")}
            type="date"
            required
            min={checkIn ? addDays(checkIn, 1) : undefined}
            value={checkOut || values.check_out || ""}
            onChange={(event) => setCheckOut(event.target.value)}
            className={inputClasses}
          />
        </Field>
      </div>

      {nights > 0 && (
        <div className="rounded-xl bg-sand-100 px-4 py-3 text-sm">
          <p className="font-medium">
            {t("estimate", { nights, total: format.number(price * nights, priceFormat) })}
          </p>
          <p className="text-xs text-stone-500">{t("estimateNote")}</p>
        </div>
      )}

      <Field id="booking-guests" label={t("guests")} error={errorText("guests")}>
        <select
          {...inputProps("guests")}
          defaultValue={values.guests || String(Math.min(initial.guests ?? 2, maxGuests))}
          className={inputClasses}
        >
          {Array.from({ length: maxGuests }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>
              {count}
            </option>
          ))}
        </select>
      </Field>

      <Field id="booking-user_name" label={t("name")} error={errorText("user_name")}>
        <input
          {...inputProps("user_name")}
          type="text"
          required
          maxLength={120}
          autoComplete="name"
          defaultValue={values.user_name}
          className={inputClasses}
        />
      </Field>

      <Field id="booking-user_email" label={t("email")} error={errorText("user_email")}>
        <input
          {...inputProps("user_email")}
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          defaultValue={values.user_email}
          className={inputClasses}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <Field id="booking-user_phone" label={t("phone")} error={errorText("user_phone")}>
          <input
            {...inputProps("user_phone")}
            type="tel"
            required
            maxLength={40}
            autoComplete="tel"
            defaultValue={values.user_phone}
            className={inputClasses}
          />
        </Field>
        <Field id="booking-user_country" label={t("country")} error={errorText("user_country")}>
          <input
            {...inputProps("user_country")}
            type="text"
            required
            maxLength={80}
            autoComplete="country-name"
            defaultValue={values.user_country}
            className={inputClasses}
          />
        </Field>
      </div>

      <Field id="booking-message" label={t("message")} error={errorText("message")}>
        <textarea
          {...inputProps("message")}
          rows={3}
          maxLength={2000}
          placeholder={t("messagePlaceholder")}
          defaultValue={values.message}
          className={inputClasses}
        />
      </Field>

      <PrivacyConsent id="booking-privacy" error={errorText("privacy")} />

      <button
        type="submit"
        disabled={pending}
        className={buttonClasses({ size: "lg", className: "w-full" })}
      >
        {pending ? t("submitting") : t("submit")}
      </button>
      <p className="text-center text-xs text-stone-500">{t("privacy")}</p>
    </form>
  );
}
