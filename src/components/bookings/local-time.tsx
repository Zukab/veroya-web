"use client";

import { useSyncExternalStore } from "react";

// Fecha y hora en la zona horaria del dispositivo de quien mira la página (un
// huésped en Colombia no debe ver la hora de España). El servidor no la conoce,
// así que se escribe en el navegador; antes de cargar no se muestra nada.
const noSubscribe = () => () => {};

export function LocalTime({ iso, locale, label }: { iso: string; locale: string; label: string }) {
  const formatted = useSyncExternalStore(
    noSubscribe,
    () =>
      new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "es-ES", { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(iso),
      ),
    () => null,
  );
  return formatted ? <span>{`${label} ${formatted}`}</span> : null;
}
