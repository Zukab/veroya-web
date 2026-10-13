import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { requireSession } from "@/lib/auth/admin";
import { signOut } from "./actions";

// El panel lee la sesión en cada petición: no se espera navegación instantánea.
export const instant = false;

const navLinks = [
  { href: "/admin/reservas", label: "Reservas" },
  { href: "/admin/apartamentos", label: "Apartamentos" },
  { href: "/admin/ciudades", label: "Ciudades" },
];

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <>
      <header className="border-b border-sand-200 bg-white">
        <Container className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
          <Link href="/admin/reservas" className="flex items-baseline gap-2">
            <span className="font-serif text-xl font-semibold">Euronest</span>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta-600">
              Panel
            </span>
          </Link>
          <nav aria-label="Panel" className="order-last w-full sm:order-none sm:w-auto">
            <ul className="-mx-3 flex gap-1 overflow-x-auto">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="block whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-stone-700 hover:bg-sand-100 hover:text-ink"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Suspense fallback={<div className="h-9 w-40" />}>
            <SessionInfo />
          </Suspense>
        </Container>
      </header>

      <Suspense fallback={<PanelLoading />}>
        <AdminGate>{children}</AdminGate>
      </Suspense>
    </>
  );
}

async function SessionInfo() {
  const access = await requireSession();
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="hidden text-stone-500 md:inline">{access.email}</span>
      <form action={signOut}>
        <button type="submit" className="rounded-full px-3 py-2 font-medium text-stone-700 hover:bg-sand-100">
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}

// Sin sesión redirige al login; con sesión pero sin estar en public.admins no
// muestra nada del panel.
async function AdminGate({ children }: { children: React.ReactNode }) {
  const access = await requireSession();

  if (access.status !== "admin") {
    return (
      <main className="flex-1 py-16">
        <Container className="max-w-xl">
          <h1 className="font-serif text-3xl font-semibold">Sin permisos</h1>
          <p className="mt-3 text-stone-600">
            Tu usuario ({access.email ?? "sin correo"}) no tiene permisos de administrador. Pide
            a quien gestiona Supabase que te añada a la lista de administradores.
          </p>
        </Container>
      </main>
    );
  }

  return <>{children}</>;
}

function PanelLoading() {
  return (
    <main aria-busy="true" className="flex-1 py-10">
      <Container className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded-lg bg-sand-200" />
        <div className="h-64 rounded-2xl bg-sand-200" />
      </Container>
    </main>
  );
}
