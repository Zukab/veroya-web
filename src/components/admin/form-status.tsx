import type { AdminFormState } from "@/lib/admin/form";

// Mensaje general de un formulario del panel (error o éxito).
export function FormStatus({ state }: { state: AdminFormState }) {
  if (state.status === "idle" || !state.message) return null;

  return state.status === "error" ? (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {state.message}
    </p>
  ) : (
    <p role="status" className="rounded-xl border border-olive-600/30 bg-olive-50 px-4 py-3 text-sm text-olive-700">
      {state.message}
    </p>
  );
}

// Aviso a partir de un parámetro de la URL (p. ej. tras crear o borrar y redirigir).
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="mb-6 rounded-xl border border-olive-600/30 bg-olive-50 px-4 py-3 text-sm text-olive-700">
      {children}
    </p>
  );
}
