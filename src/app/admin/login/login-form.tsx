"use client";

import { useActionState } from "react";
import { buttonClasses } from "@/components/ui/button";
import { Field, FormAlert, inputClasses } from "@/components/ui/form";
import { type SignInState, signIn } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signIn, {} satisfies SignInState);

  return (
    <form action={formAction} className="space-y-4">
      {state.error && <FormAlert>{state.error}</FormAlert>}
      <input type="hidden" name="next" value={next} />
      <Field id="login-email" label="Correo electrónico">
        <input
          id="login-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          defaultValue={state.email}
          className={inputClasses}
        />
      </Field>
      <Field id="login-password" label="Contraseña">
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClasses}
        />
      </Field>
      <button type="submit" disabled={pending} className={buttonClasses({ className: "w-full" })}>
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
