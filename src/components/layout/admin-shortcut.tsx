"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

// Acceso al panel en la cabecera de la web, visible solo en el navegador con una
// sesión iniciada (cookie de Supabase). Se decide en el navegador para que las
// páginas públicas sigan cacheadas. No da acceso a nada: el panel comprueba la
// sesión y el permiso de administrador en el servidor.
const SESSION_COOKIE = /(?:^|;\s*)sb-[^=]+-auth-token(?:\.\d+)?=/;

const noSubscribe = () => () => {};
const hasSession = () => SESSION_COOKIE.test(document.cookie);

export function AdminShortcut() {
  const loggedIn = useSyncExternalStore(noSubscribe, hasSession, () => false);
  if (!loggedIn) return null;

  return (
    <Link
      href="/admin"
      prefetch={false}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-sand-300 bg-white px-3 text-sm font-medium text-stone-700 hover:bg-sand-100"
    >
      <LayoutDashboard aria-hidden="true" className="size-4" />
      Panel
    </Link>
  );
}
