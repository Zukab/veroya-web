import { Link } from "@/i18n/navigation";

// Logotipo de texto provisional hasta tener el del cliente.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-baseline gap-1.5 ${className}`}>
      <span className="font-serif text-2xl font-semibold tracking-tight text-ink">
        Veroya
      </span>
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-terracotta-600">
        Apartments
      </span>
    </Link>
  );
}
