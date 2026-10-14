"use client";

import { Printer } from "lucide-react";

// Imprime la página (o la guarda en PDF desde el diálogo de impresión).
export function PrintButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 text-sm font-medium text-terracotta-700 hover:text-terracotta-600 print:hidden"
    >
      <Printer aria-hidden="true" className="size-4" />
      {label}
    </button>
  );
}
