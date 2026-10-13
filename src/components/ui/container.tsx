import type { ComponentProps } from "react";

// Ancho máximo y márgenes laterales comunes a todas las páginas.
export function Container({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}
      {...props}
    />
  );
}
