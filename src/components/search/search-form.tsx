"use client";

import { CalendarDays, MapPin, Search, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";
import { addDays, todayInSpain } from "@/lib/bookings/dates";
import type { SearchParams } from "@/lib/search";

const noSubscribe = () => () => {};

export type SearchCity = { slug: string; name: string; country: string };

// Buscador de la portada y de /buscar. Es un formulario GET normal (funciona sin
// JavaScript); el estado solo ajusta las fechas mínimas.
export function SearchForm({
  cities,
  maxGuests,
  defaults,
  variant = "hero",
}: {
  cities: SearchCity[];
  maxGuests: number;
  defaults?: Partial<SearchParams>;
  variant?: "hero" | "compact";
}) {
  const t = useTranslations("Search");
  const locale = useLocale();
  // La fecha de hoy se calcula en el navegador: la portada se prerenderiza.
  const today = useSyncExternalStore(noSubscribe, todayInSpain, () => undefined);
  const [checkIn, setCheckIn] = useState(defaults?.checkIn ?? "");
  const [checkOut, setCheckOut] = useState(defaults?.checkOut ?? "");

  // Ciudades agrupadas por país si hay más de uno.
  const countries = [...new Set(cities.map((city) => city.country || "—"))];
  const grouped = countries.length > 1;

  const fieldClasses =
    variant === "hero"
      ? "rounded-xl px-3 py-2.5 transition-colors focus-within:bg-sand-50 hover:bg-sand-50"
      : "rounded-xl border border-sand-200 bg-white px-3 py-2";
  const labelClasses =
    "flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-wider text-stone-500";
  const controlClasses = "mt-1 block w-full bg-transparent text-sm text-ink outline-none";

  return (
    <form
      action={locale === "en" ? "/en/buscar" : "/buscar"}
      method="get"
      role="search"
      className={
        variant === "hero"
          ? "grid gap-1 rounded-2xl bg-white p-2 text-left shadow-2xl shadow-stone-900/20 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-center"
          : "grid gap-2 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] lg:items-center"
      }
    >
      <div className={fieldClasses}>
        <label htmlFor={`search-city-${variant}`} className={labelClasses}>
          <MapPin aria-hidden="true" className="size-3.5 text-terracotta-600" />
          {t("city")}
        </label>
        <select
          id={`search-city-${variant}`}
          name="ciudad"
          defaultValue={defaults?.city ?? ""}
          className={controlClasses}
        >
          <option value="">{t("anyCity")}</option>
          {grouped
            ? countries.map((country) => (
                <optgroup key={country} label={country}>
                  {cities
                    .filter((city) => (city.country || "—") === country)
                    .map((city) => (
                      <option key={city.slug} value={city.slug}>
                        {city.name}
                      </option>
                    ))}
                </optgroup>
              ))
            : cities.map((city) => (
                <option key={city.slug} value={city.slug}>
                  {city.name}
                </option>
              ))}
        </select>
      </div>

      <div className={fieldClasses}>
        <label htmlFor={`search-in-${variant}`} className={labelClasses}>
          <CalendarDays aria-hidden="true" className="size-3.5 text-terracotta-600" />
          {t("checkIn")}
        </label>
        <input
          id={`search-in-${variant}`}
          type="date"
          name="entrada"
          min={today}
          value={checkIn}
          onChange={(event) => {
            setCheckIn(event.target.value);
            if (checkOut && event.target.value && checkOut <= event.target.value) setCheckOut("");
          }}
          className={controlClasses}
        />
      </div>

      <div className={fieldClasses}>
        <label htmlFor={`search-out-${variant}`} className={labelClasses}>
          <CalendarDays aria-hidden="true" className="size-3.5 text-terracotta-600" />
          {t("checkOut")}
        </label>
        <input
          id={`search-out-${variant}`}
          type="date"
          name="salida"
          min={checkIn ? addDays(checkIn, 1) : today && addDays(today, 1)}
          value={checkOut}
          onChange={(event) => setCheckOut(event.target.value)}
          className={controlClasses}
        />
      </div>

      <div className={fieldClasses}>
        <label htmlFor={`search-guests-${variant}`} className={labelClasses}>
          <Users aria-hidden="true" className="size-3.5 text-terracotta-600" />
          {t("guests")}
        </label>
        <select
          id={`search-guests-${variant}`}
          name="huespedes"
          defaultValue={String(defaults?.guests ?? 2)}
          className={controlClasses}
        >
          {Array.from({ length: Math.max(1, maxGuests) }, (_, index) => index + 1).map((count) => (
            <option key={count} value={count}>
              {t("guestsOption", { count })}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-terracotta-600 px-6 font-medium text-white transition-colors hover:bg-terracotta-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta-600 sm:col-span-2 lg:col-span-1"
      >
        <Search aria-hidden="true" className="size-4" />
        {t("submit")}
      </button>
    </form>
  );
}
