import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  back,
  actions,
  children,
}: {
  title: string;
  back?: { href: string; label: string };
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8">
      {back && (
        <Link
          href={back.href}
          className="mb-2 inline-flex items-center gap-1 text-sm text-stone-500 hover:text-ink"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
          {back.label}
        </Link>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">{title}</h1>
        {actions}
      </div>
      {children}
    </div>
  );
}

// Sección con título dentro de un formulario del panel.
export function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-sand-200 bg-white p-5 sm:p-6">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}
