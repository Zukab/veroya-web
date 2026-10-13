import type { ReactNode } from "react";

// Título de sección con subtítulo opcional y una acción a la derecha (p. ej. "Ver todas").
export function SectionHeading({
  title,
  subtitle,
  action,
  as: Heading = "h2",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <Heading
          className={`font-serif font-semibold tracking-tight text-ink ${
            Heading === "h1" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl"
          }`}
        >
          {title}
        </Heading>
        {subtitle && <p className="mt-2 text-stone-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
