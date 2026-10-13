import { Link } from "@/i18n/navigation";

// Logotipo de texto provisional hasta tener el del cliente. "Apartamentos" forma
// parte de la marca: no se traduce en /en. En móvil va debajo para que quepa.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Euronest Apartamentos"
      className={`flex flex-col leading-none sm:flex-row sm:items-baseline sm:gap-1.5 ${className}`}
    >
      <span className="font-serif text-2xl font-semibold tracking-tight text-ink">
        Euronest
      </span>
      <span className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-terracotta-600 sm:mt-0 sm:text-[0.65rem] sm:tracking-[0.2em]">
        Apartamentos
      </span>
    </Link>
  );
}
