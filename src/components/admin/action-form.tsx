"use client";

import { type ReactNode, startTransition } from "react";

// Formulario del panel que envía a una acción de useActionState sin que React lo
// vacíe al terminar (con <form action> se restablece y se perderían los datos si
// hay errores de validación).
export function ActionForm({
  action,
  confirmMessage,
  className,
  children,
}: {
  action: (formData: FormData) => void;
  confirmMessage?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        const formData = new FormData(event.currentTarget);
        startTransition(() => action(formData));
      }}
    >
      {children}
    </form>
  );
}
