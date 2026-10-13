import type { Metadata } from "next";
import { Suspense } from "react";
import { safeNextPath } from "./next-path";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

// Sin registro público: los usuarios se crean en Supabase y se añaden a
// public.admins (ver CLAUDE.md, "Seguridad").
export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-sand-200 bg-white p-8 shadow-sm">
        <p className="flex items-baseline gap-2">
          <span className="font-serif text-2xl font-semibold">Euronest</span>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
            Panel
          </span>
        </p>
        <h1 className="mt-6 text-lg font-semibold">Entrar en el panel</h1>
        <div className="mt-4">
          <Suspense fallback={<LoginForm next="/admin/reservas" />}>
            {searchParams.then(({ next }) => (
              <LoginForm next={safeNextPath(next)} />
            ))}
          </Suspense>
        </div>
      </div>
    </main>
  );
}
