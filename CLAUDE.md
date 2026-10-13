# Veroya Apartments — página web

Página web de Veroya Apartments, negocio de alquiler de apartamentos en España.
Proyecto nuevo y limpio: no se reutiliza código, datos ni infraestructura de ninguna
versión anterior.

**Plazo: la parte básica debe quedar en producción en 1–2 días.** Prioriza que funcione,
sea segura y sea simple. No agregues funciones fuera del alcance sin preguntar.

## Estado del proyecto

**Bloque 1 — base del proyecto: terminado (2026-10-13).** Desplegado en Vercel con la
dirección de prueba.
- Next.js 16 + TypeScript + Tailwind, `next-intl` (es/en), validación de entorno con zod y
  clientes de Supabase (`src/lib/supabase/`).
- Esquema, RLS, lista de administradores y bucket `media` aplicados en Supabase
  (`supabase/migrations/`). Tipos en `src/types/database.ts`.
- Datos de ejemplo cargados en el proyecto real (ver "Datos de ejemplo").
- Usuario administrador creado: `veroyaproyecto@gmail.com` (en `public.admins`).
- Solo existe la portada provisional; no hay páginas públicas reales ni panel todavía.

**Siguientes bloques:** páginas públicas, panel de administración, formulario de reserva.

Pendiente de verificar:
- Escrituras con sesión iniciada (admin y usuario no admin) contra RLS y Storage: no se
  han probado porque aún no hay panel. Hacerlo en el bloque del panel.
- Protección contra contraseñas filtradas de Supabase Auth: desactivada (aviso de
  `db advisors`); probablemente no disponible en el plan gratuito. Activarla si lo está.

## Stack

- Next.js 16 (App Router) + TypeScript estricto + Tailwind CSS 4
- Supabase: PostgreSQL, Auth (solo para el panel de administración) y Storage (fotos)
- Despliegue en el plan gratuito de Vercel por ahora.
- El código debe poder moverse a Cloudflare sin rehacerlo: no usar servicios exclusivos de
  Vercel (Blob, KV, Edge Config, Analytics) y servir las imágenes desde Supabase Storage sin
  depender de la optimización de imágenes de Vercel (`images.unoptimized: true`).
- Supabase en plan gratuito por ahora.
- Idiomas: español (por defecto) e inglés, con `next-intl` y rutas con prefijo (`/en/...`).
- Validación de formularios y entradas del servidor con `zod`.

Particularidades de Next.js 16 (lee `AGENTS.md` y la documentación en
`node_modules/next/dist/docs/` antes de escribir código):
- `middleware.ts` ahora se llama `src/proxy.ts` (mismo papel). Ahí está el proxy de
  `next-intl`; la protección de `/admin` se añadirá ahí también.
- `cacheComponents` está activado: leer cookies o cabeceras hace dinámica la página. Las
  páginas públicas leen datos con el cliente sin sesión (`src/lib/supabase/public.ts`) para
  poder cachearse; el cliente con cookies (`server.ts`) es solo para el panel.
- El idioma se obtiene con `next/root-params` (`src/i18n/request.ts`).

## Cuentas e infraestructura

- Repositorio: GitHub personal de Sebastián (privado), `https://github.com/Zukab/veroya-web`.
- Despliegue: cuenta personal de Vercel de Sebastián (plan gratuito), conectada a ese GitHub.
- Supabase: proyecto `veroya` en **us-west-2 (Oregón)**, creado con la cuenta del proyecto
  `veroyaproyecto@gmail.com`. Registro público de Auth desactivado.
- Las funciones de Vercel corren en **`pdx1`** (Oregón), la misma zona que Supabase, fijado
  en `vercel.json`. Si Supabase cambia de región, cambia también `vercel.json`.
- Dominio: uno nuevo, por definir. Mientras tanto se usa la dirección de prueba de Vercel.
- Sebastián administra todas las cuentas. Nunca escribas claves, contraseñas ni tokens en el
  código, en commits ni en archivos versionados; todo va en `.env.local`.

## Comandos

- `npm run dev` — servidor local
- `npm run build` — debe pasar sin errores antes de dar una tarea por terminada
- `npm run lint`
- `npm run db:types` — regenera `src/types/database.ts` tras cada migración
- `npx supabase migration new <nombre>` — nueva migración en `supabase/migrations/`
- `npx supabase db push` — aplica las migraciones al proyecto enlazado (mostrar antes las
  migraciones a Sebastián y esperar su aprobación)
- `npx supabase db query --linked -f <archivo.sql>` — ejecuta un SQL en el proyecto enlazado

No hay Docker: no se usa Supabase local; todo va contra el proyecto real enlazado.

Variables de entorno en `.env.local` (nunca se suben al repo):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
Se usan las claves nuevas de Supabase con los nombres de siempre: en `..._ANON_KEY` va la
publishable key (`sb_publishable_...`) y en `..._SERVICE_ROLE_KEY` la secret key
(`sb_secret_...`). La URL es solo la base (`https://<ref>.supabase.co`, sin `/rest/v1`).
Se validan con zod en `src/lib/env.ts` y `src/lib/env.server.ts`.

## Alcance

Parte pública:
- `/` inicio (portada, ciudades destacadas, apartamentos destacados)
- `/ciudades` y `/ciudades/[ciudad]` (apartamentos de la ciudad)
- `/apartamento/[id]` detalle con galería, comodidades y formulario de reserva
- `/como-funciona`, `/estancias-largas`, `/propietarios` (páginas de contenido; usa textos
  provisionales claros que el cliente reemplazará)

Formulario de reserva: nombre, correo, teléfono, país, número de huéspedes, fecha de entrada,
fecha de salida y mensaje opcional. Al guardar, genera un código `VRY-XXXXX`
(5 caracteres A-Z0-9) y un PIN de 4 dígitos, queda en estado `Pendiente` y se le muestran
al usuario el código y el PIN. Además:
- **Protección contra spam:** campo trampa invisible (honeypot) y límite de envíos por IP.
  El límite no puede usar servicios exclusivos de Vercel (p. ej. KV); debe funcionar
  también en Cloudflare (por ejemplo, con una tabla en Supabase).
- **Código repetido:** si el insert falla por `booking_code` duplicado (error `23505`),
  reintentar con otro código generado con `crypto`.

Panel de administración (`/admin`):
- `/admin/login` con Supabase Auth (correo y contraseña). Sin registro público:
  los usuarios se crean desde el panel de Supabase y, para poder escribir, se añaden a
  `public.admins` (ver "Seguridad").
- `/admin/apartamentos` y `/admin/apartamentos/[id]`: crear, editar, borrar, subir fotos.
- `/admin/ciudades` y `/admin/ciudades/[slug]`: crear, editar, borrar, subir foto. Borrar
  una ciudad con apartamentos está bloqueado en la base de datos (error `23503`): el panel
  debe mostrar un mensaje claro.
- `/admin/reservas`: listado (más recientes primero), filtro por estado, cambiar estado
  (`Pendiente`, `Confirmada`, `Cancelada`) y borrar.

Los contenidos (ciudades, apartamentos, fotos) los carga el cliente desde el panel.

Fuera de alcance por ahora: pagos, calendarios de disponibilidad, sincronización con
Airbnb/Booking, correos automáticos.

**No bloquees reservas por cruce de fechas.** El cliente registra reservas que pueden
coincidir en el mismo apartamento; el sistema solo registra y el equipo gestiona.

## Idiomas

- Español sin prefijo (`/ciudades`) e inglés con prefijo (`/en/ciudades`). Las rutas en
  inglés usan los mismos segmentos que en español (no se traducen).
- Sin detección por idioma del navegador ni cookie de idioma: la URL decide el idioma.
- Textos de la interfaz en `messages/es.json` y `messages/en.json`.
- Contenidos de la base de datos: **descripciones y barrios solo en español** por ahora
  (también en `/en`).
- **Comodidades:** lista fija definida en el código y traducida con `next-intl`; en la base
  de datos se guardan sus claves en `amenities`, y el panel las elige con casillas.
  El seed actual aún guarda texto en español ("Wifi", "Aire acondicionado"…): al
  implementar la lista hay que pasar el seed y los datos existentes a claves.

## Modelo de datos (Supabase)

- `cities`: `slug` (PK, texto), `name`, `image_url`, `description`, `created_at`
- `apartments`: `id` (PK, texto, slug legible), `city_slug` (FK → cities, on delete
  restrict, on update cascade), `name`, `price` (entero, euros por noche), `rooms`,
  `baths`, `size` (m², opcional), `max_guests`, `rating` (numeric 3,2; null = sin
  valoraciones), `reviews`, `min_nights`, `neighborhood`, `description`,
  `images` (text[] con URLs de Storage), `amenities` (text[]), `created_at`
- `bookings`: `id` (uuid), `booking_code` (único), `booking_pin`, `created_at`,
  `status` (enum: Pendiente, Confirmada, Cancelada), `user_name`, `user_email`,
  `user_phone`, `user_country`, `guests`, `check_in` (date), `check_out` (date),
  `city_name`, `apartment_id` (FK nullable, on delete set null), `apartment_name`, `message`
- `admins`: `user_id` (PK, FK → auth.users), `created_at` — lista de administradores

Gestiona el esquema con migraciones SQL en `supabase/migrations/`. Las restricciones CHECK
de la base de datos son la última barrera; la validación principal es con zod.

## Datos de ejemplo

- `supabase/seed.sql` está **cargado en el proyecto real** (no hay Supabase local).
  Identificables por slugs/ids `ejemplo-...`, correos `@example.com` y códigos `VRY-EJ...`.
  Se puede volver a ejecutar sin duplicar datos.
- **Antes del lanzamiento**, borrarlos con:
  `npx supabase db query --linked -f supabase/cleanup-seed.sql`

## Seguridad

- Row Level Security activado en todas las tablas.
  - Escribir exige **estar autenticado y estar en `public.admins`** (función
    `private.is_admin()`). Alta de un administrador desde el SQL Editor de Supabase:
    `insert into public.admins (user_id) select id from auth.users where email = '...';`
  - `cities` y `apartments`: lectura pública; escritura solo administradores.
  - `bookings`: sin acceso público. La creación se hace en una Server Action o Route
    Handler del servidor que valida con `zod` y usa la clave secreta. Los administradores
    leen, borran y solo pueden cambiar la columna `status`.
  - Storage `media`: lectura pública por URL; subir, reemplazar y borrar solo
    administradores. Máximo 5 MB, solo JPEG, PNG y WebP.
- La `SUPABASE_SERVICE_ROLE_KEY` solo se usa en código de servidor, nunca en el cliente
  (`src/lib/supabase/admin.ts`, marcado `server-only`).
- Ninguna contraseña ni clave escrita en el código.
- Las rutas `/admin/*` se protegen en el servidor (`src/proxy.ts` + verificación de sesión
  y de pertenencia a `public.admins`), no solo ocultándolas en el cliente.
- Las imágenes van en Supabase Storage (bucket público `media`), nunca como base64 en la
  base de datos.
- Código y PIN de reserva generados con `crypto`, no con `Math.random`.
- Validar fechas: `check_out` posterior a `check_in`, años razonables (la base de datos
  exige 2020–2100).

## Forma de trabajo

- Antes de tareas grandes, propone un plan corto y espera aprobación.
- Al ejecutar un plan, termina cada paso (build, lint y commit) y espera la confirmación
  de Sebastián antes de empezar el siguiente.
- Cambios pequeños y un commit por paso lógico, con mensajes en español.
- Corre `npm run build` y `npm run lint` antes de decir que algo está listo.
- Pregunta antes de instalar dependencias que no estén en el stack de arriba.
- Diseño limpio, moderno y responsive (primero móvil).
