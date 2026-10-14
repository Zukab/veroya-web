"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

// Copia un texto (p. ej. el localizador) al portapapeles.
export function CopyButton({ value, label, doneLabel }: { value: string; label: string; doneLabel: string }) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          // Sin permiso para el portapapeles: no pasa nada, el texto está a la vista.
        }
      }}
      className="inline-flex items-center gap-1 rounded-md border border-sand-300 px-1.5 py-0.5 text-[0.65rem] font-medium text-stone-600 hover:bg-sand-100 print:hidden"
    >
      {done ? <Check aria-hidden="true" className="size-3" /> : <Copy aria-hidden="true" className="size-3" />}
      {done ? doneLabel : label}
    </button>
  );
}
