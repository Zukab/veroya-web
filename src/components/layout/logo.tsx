import { Link } from "@/i18n/navigation";
import { BRAND_MARK } from "@/lib/brand";

// Logotipo: el arco de la marca y el nombre. "Apartamentos" forma parte de la marca: no
// se traduce en /en. En móvil va debajo de "Euronest" para que quepa.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" aria-label="Euronest Apartamentos" className={`flex items-center gap-1.5 sm:gap-2.5 ${className}`}>
      <svg
        viewBox={BRAND_MARK.viewBox}
        aria-hidden="true"
        className="h-7 w-auto shrink-0 text-terracotta-600 sm:h-9"
      >
        <path fill="currentColor" fillRule="evenodd" d={`${BRAND_MARK.arch}${BRAND_MARK.door}`} />
      </svg>
      <span className="flex flex-col leading-none sm:flex-row sm:items-baseline sm:gap-1.5">
        <span className="font-serif text-2xl font-semibold tracking-tight text-ink">Euronest</span>
        <span className="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.22em] text-terracotta-600 sm:mt-0 sm:text-[0.65rem] sm:tracking-[0.2em]">
          Apartamentos
        </span>
      </span>
    </Link>
  );
}
