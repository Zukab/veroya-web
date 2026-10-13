import type { z } from "zod";

// Estado común de los formularios del panel (mensajes ya en español).
export type AdminFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const idleState: AdminFormState = { status: "idle" };

export function adminFieldErrors(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !fieldErrors[field]) fieldErrors[field] = issue.message;
  }
  return fieldErrors;
}

export function errorState(message: string, fieldErrors?: Record<string, string>): AdminFormState {
  return { status: "error", message, fieldErrors };
}
