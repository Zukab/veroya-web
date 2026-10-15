"use client";

import { CalendarDays, CircleCheck, MapPin, MessageCircle, Users } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import { type ReactNode, useActionState, useState } from "react";
import { createGeneralRequest } from "@/app/[locale]/solicitud/actions";
import { buttonClasses } from "@/components/ui/button";
import { Field, FormAlert, inputClasses } from "@/components/ui/form";
import { Link } from "@/i18n/navigation";
import { addDays, nightsBetween, todayInAgency } from "@/lib/bookings/dates";
import type { PublicBookingState } from "@/lib/bookings/form-state";
import { MAX_SEARCH_GUESTS, parseSearchParams } from "@/lib/search";
import { PrivacyConsent } from "./privacy-consent";

export type RequestCity = { slug: string; name: string; country: string; image_url: string | null };

const initialState: PublicBookingState = { status: "idle" };

// Solicitud general (/solicitud): ciudad, fechas, huéspedes y datos de contacto,
// con un resumen al lado. Llega relleno desde el buscador (?ciudad=…); por leer la
// URL, la página lo envuelve en <Suspense>.
export function RequestForm({ cities, whatsappHref }: { cities: RequestCity[]; whatsappHref: string | null }) {
  const [formKey, setFormKey] = useState(0);
  return (
    <RequestFormInner
      key={formKey}
      cities={cities}
      whatsappHref={whatsappHref}
      onReset={() => setFormKey((key) => key + 1)}
    />
  );
}

function RequestFormInner({
  cities,
  whatsappHref,
  onReset,
}: {
  cities: RequestCity[];
  whatsappHref: string | null;
  onReset: () => void;
}) {
  const t = useTranslations("RequestForm");
  const tBooking = useTranslations("BookingForm");
  const tError = useTranslations("BookingErrors");
  const format = useFormatter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const today = todayInAgency();
  const initial = parseSearchParams((name) => searchParams.get(name), today);
  const [state, formAction, pending] = useActionState(createGeneralRequest, initialState);

  const values = state.status === "error" ? state.values : {};
  const [citySlug, setCitySlug] = useState(values.city || (initial.city && cities.some((c) => c.slug === initial.city) ? initial.city : ""));
  const [checkIn, setCheckIn] = useState(values.check_in || initial.checkIn || "");
  const [checkOut, setCheckOut] = useState(values.check_out || initial.checkOut || "");
  const [guests, setGuests] = useState(values.guests || String(initial.guests ?? 2));

  const date = (value: string) =>
    format.dateTime(new Date(`${value}T00:00:00Z`), { dateStyle: "medium", timeZone: "UTC" });

  if (state.status === "success") {
    return (
      <div role="status" className="mx-auto max-w-xl space-y-5 rounded-3xl border border-sand-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2 text-olive-700">
          <CircleCheck aria-hidden="true" className="size-7" />
          <h2 className="font-serif text-2xl font-semibold">{t("successTitle")}</h2>
        </div>
        <p className="text-stone-600">{t("successText")}</p>
        <dl className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-sand-100 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{tBooking("code")}</dt>
            <dd className="mt-1 font-mono text-xl font-semibold tracking-wider">{state.code}</dd>
          </div>
          <div className="rounded-2xl bg-sand-100 p-4">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">{tBooking("pin")}</dt>
            <dd className="mt-1 font-mono text-xl font-semibold tracking-[0.3em]">{state.pin}</dd>
          </div>
        </dl>
        <p className="text-sm text-stone-700">
          {tBooking("stay", { checkIn: date(state.checkIn), checkOut: date(state.checkOut), guests: state.guests })}
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link href="/verificar" className={buttonClasses()}>
            {t("checkStatus")}
          </Link>
          <button type="button" onClick={onReset} className={buttonClasses({ variant: "secondary" })}>
            {t("newRequest")}
          </button>
        </div>
      </div>
    );
  }

  const fieldErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const errorText = (field: string) => {
    const error = fieldErrors[field];
    return error ? tError(error.key, error.values) : undefined;
  };
  const inputProps = (field: string) => ({
    id: `request-${field}`,
    name: field,
    "aria-invalid": fieldErrors[field] ? true : undefined,
    "aria-describedby": fieldErrors[field] ? `request-${field}-error` : undefined,
  });

  const city = cities.find((item) => item.slug === citySlug);
  const nights = checkIn && checkOut && checkOut > checkIn ? nightsBetween(checkIn, checkOut) : 0;

  return (
    <form action={formAction} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <div className="space-y-6">
        {state.status === "error" && state.formError && <FormAlert>{tError(state.formError)}</FormAlert>}
        <input type="hidden" name="locale" value={locale} />

        {/* Campo trampa contra bots: invisible para las personas. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor="request-website">{tBooking("honeypot")}</label>
          <input id="request-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <Fieldset legend={t("stay")}>
          <Field id="request-city" label={t("city")} error={errorText("city")}>
            <select
              {...inputProps("city")}
              required
              value={citySlug}
              onChange={(event) => setCitySlug(event.target.value)}
              className={inputClasses}
            >
              <option value="">{t("cityPlaceholder")}</option>
              {cities.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.country ? `${item.name} (${item.country})` : item.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_8rem]">
            <Field id="request-check_in" label={t("checkIn")} error={errorText("check_in")}>
              <input
                {...inputProps("check_in")}
                type="date"
                required
                min={today}
                value={checkIn}
                onChange={(event) => {
                  setCheckIn(event.target.value);
                  if (checkOut && event.target.value && checkOut <= event.target.value) setCheckOut("");
                }}
                className={inputClasses}
              />
            </Field>
            <Field id="request-check_out" label={t("checkOut")} error={errorText("check_out")}>
              <input
                {...inputProps("check_out")}
                type="date"
                required
                min={checkIn ? addDays(checkIn, 1) : addDays(today, 1)}
                value={checkOut}
                onChange={(event) => setCheckOut(event.target.value)}
                className={inputClasses}
              />
            </Field>
            <Field
              id="request-guests"
              label={t("guests")}
              error={errorText("guests")}
              className="col-span-2 sm:col-span-1"
            >
              <select
                {...inputProps("guests")}
                value={guests}
                onChange={(event) => setGuests(event.target.value)}
                className={inputClasses}
              >
                {Array.from({ length: MAX_SEARCH_GUESTS }, (_, index) => index + 1).map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Fieldset>

        <Fieldset legend={t("contact")}>
          <Field id="request-user_name" label={t("name")} error={errorText("user_name")}>
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
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="request-user_email" label={t("email")} error={errorText("user_email")}>
              <input
                {...inputProps("user_email")}
                type="email"
                required
                maxLength={254}
                autoComplete="email"
                placeholder="tu@correo.com"
                defaultValue={values.user_email}
                className={inputClasses}
              />
            </Field>
            <Field id="request-user_phone" label={t("phone")} error={errorText("user_phone")}>
              <input
                {...inputProps("user_phone")}
                type="tel"
                required
                maxLength={40}
                autoComplete="tel"
                placeholder="+34 …"
                defaultValue={values.user_phone}
                className={inputClasses}
              />
            </Field>
          </div>
          <Field id="request-user_country" label={t("country")} error={errorText("user_country")}>
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
          <Field id="request-message" label={t("message")} error={errorText("message")}>
            <textarea
              {...inputProps("message")}
              rows={3}
              maxLength={2000}
              placeholder={t("messagePlaceholder")}
              defaultValue={values.message}
              className={inputClasses}
            />
          </Field>
        </Fieldset>
      </div>

      {/* Resumen */}
      <aside className="lg:sticky lg:top-24">
        <div className="rounded-3xl border border-sand-200 bg-white p-5 shadow-sm">
          <div className="relative aspect-16/10 overflow-hidden rounded-2xl bg-sand-100">
            {city?.image_url ? (
              <Image src={city.image_url} alt="" fill sizes="22rem" className="object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center text-stone-400">
                <MapPin aria-hidden="true" className="size-8" strokeWidth={1.5} />
              </div>
            )}
          </div>
          <h2 className="mt-4 font-serif text-xl font-semibold">{city ? city.name : t("summaryEmpty")}</h2>
          <p className="text-sm text-stone-600">{city ? city.country : t("summaryEmptyText")}</p>

          {(nights > 0 || city) && (
            <ul className="mt-4 space-y-2 text-sm text-stone-700">
              {nights > 0 && (
                <li className="flex items-center gap-2">
                  <CalendarDays aria-hidden="true" className="size-4 text-terracotta-600" />
                  {date(checkIn)} → {date(checkOut)} · {t("nights", { count: nights })}
                </li>
              )}
              <li className="flex items-center gap-2">
                <Users aria-hidden="true" className="size-4 text-terracotta-600" />
                {t("guestsCount", { count: Number(guests) || 1 })}
              </li>
            </ul>
          )}

          <hr className="my-5 border-sand-200" />
          <p className="text-sm text-stone-600">{t("summaryNote")}</p>
          <div className="mt-4">
            <PrivacyConsent id="request-privacy" error={errorText("privacy")} />
          </div>
          <button type="submit" disabled={pending} className={buttonClasses({ size: "lg", className: "mt-5 w-full" })}>
            {pending ? t("submitting") : t("submit")}
          </button>
          <p className="mt-3 text-center text-xs text-stone-500">{tBooking("privacy")}</p>
        </div>

        {whatsappHref && (
          <p className="mt-4 text-center text-sm text-stone-600">
            {t("orWhatsApp")}{" "}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-medium text-[#1da851] hover:underline"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              {t("whatsApp")}
            </a>
          </p>
        )}
      </aside>
    </form>
  );
}

function Fieldset({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-2xl border border-sand-200 bg-white px-5 pt-3 pb-5 sm:px-6">
      <legend className="px-2 font-semibold">{legend}</legend>
      {children}
    </fieldset>
  );
}
