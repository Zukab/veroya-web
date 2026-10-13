import type { ReactNode } from "react";

// Piezas comunes de formulario (web pública y panel).

export const inputClasses =
  "block w-full rounded-xl border border-sand-300 bg-white px-3.5 py-2.5 text-base text-ink " +
  "placeholder:text-stone-400 focus:border-terracotta-500 focus:outline-2 focus:outline-terracotta-500/30 " +
  "aria-invalid:border-red-500 disabled:bg-sand-100 sm:text-sm";

export function Field({
  id,
  label,
  error,
  hint,
  className = "",
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-stone-500">{hint}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

// Aviso de error general del formulario.
export function FormAlert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {children}
    </p>
  );
}
