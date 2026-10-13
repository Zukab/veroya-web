import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

const LOGIN_PATH = "/admin/login";

// Proxy de /admin: renueva la sesión de Supabase (cookies) en cada petición y
// redirige al login si no hay sesión. La comprobación de administrador se hace en
// el servidor (src/lib/auth/admin.ts), no aquí.
export async function updateAdminSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  const { data } = await supabase.auth.getClaims();
  const hasSession = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  if (!hasSession && pathname !== LOGIN_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "";
    url.searchParams.set("next", pathname);
    return redirectWithCookies(url, response);
  }

  if (hasSession && pathname === LOGIN_PATH) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/reservas";
    url.search = "";
    return redirectWithCookies(url, response);
  }

  return response;
}

// Una redirección que conserva las cookies de sesión renovadas.
function redirectWithCookies(url: URL, from: NextResponse) {
  const redirect = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
