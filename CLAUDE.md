# Euronest Apartamentos — página web

Página web de **Euronest Apartamentos**, negocio de alquiler de apartamentos en España.
La marca se llamaba antes "Veroya" (cambio del 2026-10-13). Los nombres técnicos de la
infraestructura conservan "veroya" y no se renombran: repositorio `veroya-web`, proyecto
de Supabase `veroya`, cuenta `veroyaproyecto@gmail.com`, `package.json` y
`supabase/config.toml`. En todo lo que ve el usuario (web, correos, voucher) la marca es
"Euronest Apartamentos"; "Apartamentos" forma parte del nombre y no se traduce en `/en`.
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
**Bloque 2 — páginas públicas: pasos 1–5 terminados (2026-10-13).**
- Base visual, inicio, `/ciudades`, `/ciudades/[ciudad]`, `/apartamento/[id]` (galería y
  comodidades) y las tres páginas de contenido con textos provisionales.
- Comodidades pasadas a claves fijas (migración `..._comodidades_a_claves` aplicada).
- El formulario de reserva público **no está hecho**: el detalle del apartamento solo muestra
  el resumen de precio (comentario "Paso 6" en `src/app/[locale]/apartamento/[id]/page.tsx`).
  Se rehace dentro del plan de "Reservas y voucher".

**Siguientes bloques:** reservas y voucher (formulario público, panel de reservas, pagos,
PDF, verificación y correo) y el resto del panel de administración.

Pendiente de verificar:
- Escrituras con sesión iniciada (admin y usuario no admin) contra RLS y Storage: no se
  han probado porque aún no hay panel. Hacerlo en el bloque del panel.
- Protección contra contraseñas filtradas de Supabase Auth: desactivada (aviso de
  `db advisors`); probablemente no disponible en el plan gratuito. Activarla si lo está.

**Pendiente para el final (depende del dominio `euronestapartamentos.com`):**
1. Comprar el dominio.
2. Conectarlo a Vercel y poner `SITE_URL` con el dominio (hasta entonces, la dirección de
   Vercel).
3. Verificarlo en Resend (registros DNS) y cambiar `EMAIL_FROM` a una dirección del dominio.
4. Probar el envío de correos a huéspedes reales (antes, Resend solo envía a la dirección
   de la cuenta).
5. Revisar que los QR de los vouchers apunten al dominio definitivo. Los vouchers enviados
   antes llevan la dirección de Vercel: mantenerla activa o redirigirla al dominio.
6. Añadir `metadataBase`, `canonical` y `hreflang` (es/en), que Next solo genera con la
   URL definitiva.

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
- Iconos con `lucide-react` (aprobado). Fuentes con `next/font/google`: Geist (texto) y
  Fraunces (títulos).

Particularidades de Next.js 16 (lee `AGENTS.md` y la documentación en
`node_modules/next/dist/docs/` antes de escribir código):
- `middleware.ts` ahora se llama `src/proxy.ts` (mismo papel). Ahí está el proxy de
  `next-intl`; la protección de `/admin` se añadirá ahí también.
- `cacheComponents` está activado: leer cookies o cabeceras hace dinámica la página. Las
  páginas públicas leen datos con el cliente sin sesión (`src/lib/supabase/public.ts`) para
  poder cachearse; el cliente con cookies (`server.ts`) es solo para el panel.
- El idioma se obtiene con `next/root-params` (`src/i18n/request.ts`). `next/root-params`
  **no funciona en Server Actions**: ahí hay que pasar el idioma explícitamente
  (`getTranslations({ locale, namespace })`).
- Lecturas públicas en `src/lib/data/catalog.ts` con `'use cache'`, `cacheLife('hours')` y
  las etiquetas de `src/lib/data/tags.ts`. El panel debe invalidarlas con `updateTag()` al
  crear, editar o borrar ciudades y apartamentos.
- `partialPrefetching` está activado: en páginas con parámetros dinámicos, leer `params`
  dentro de un componente envuelto en `<Suspense>` con esqueleto (ver
  `ciudades/[ciudad]/page.tsx`). Las rutas dinámicas usan `generateStaticParams` con al
  menos un valor.

## Cuentas e infraestructura

- Repositorio: GitHub personal de Sebastián (privado), `https://github.com/Zukab/veroya-web`.
- Despliegue: cuenta personal de Vercel de Sebastián (plan gratuito), conectada a ese GitHub.
- Supabase: proyecto `veroya` en **us-west-2 (Oregón)**, creado con la cuenta del proyecto
  `veroyaproyecto@gmail.com`. Registro público de Auth desactivado.
- Las funciones de Vercel corren en **`pdx1`** (Oregón), la misma zona que Supabase, fijado
  en `vercel.json`. Si Supabase cambia de región, cambia también `vercel.json`.
- Dominio: `euronestapartamentos.com`, que se compra al final (ver "Pendiente para el
  final"). Mientras tanto se usa la dirección de prueba de Vercel.
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
- `/` inicio (portada, ciudades y apartamentos destacados: los 6 mejor valorados; los que
  no tienen valoraciones van al final)
- `/ciudades` y `/ciudades/[ciudad]` (apartamentos de la ciudad)
- `/apartamento/[id]` detalle con galería, comodidades y formulario de reserva
- `/como-funciona`, `/estancias-largas`, `/propietarios` (páginas de contenido; usa textos
  provisionales claros que el cliente reemplazará)

Formulario de reserva: nombre, correo, teléfono, país, número de huéspedes, fecha de entrada,
fecha de salida y mensaje opcional. Al guardar, genera un código `VRY-XXXXX`
(5 caracteres A-Z0-9; el prefijo `VRY-` viene de la marca anterior y está pendiente de
cambiar) y un PIN de 4 dígitos, queda en estado `Pendiente` y se le muestran
al usuario el código y el PIN. Además:
- **Protección contra spam:** campo trampa invisible (honeypot) y límite de **30 envíos por
  hora y por IP** (el equipo del cliente puede registrar muchas reservas seguidas desde el
  mismo equipo). El límite no puede usar servicios exclusivos de Vercel (p. ej. KV); debe
  funcionar también en Cloudflare (por ejemplo, con una tabla en Supabase).
- **Reglas del apartamento:** rechazar estancias por debajo de `min_nights` y más huéspedes
  que `max_guests`, con un mensaje claro.
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
- `/admin/reservas`: listado (más recientes primero), filtro por estado, botón "Crear
  reserva", cambiar estado (`Pendiente`, `Confirmada`, `Cancelada`), registrar pagos y
  borrar. Ver "Reservas y voucher".

Los contenidos (ciudades, apartamentos, fotos) los carga el cliente desde el panel.

Fuera de alcance por ahora: cobros en línea (pasarela de pago), calendarios de
disponibilidad públicos, sincronización con Airbnb/Booking y cualquier correo automático
distinto del de confirmación de reserva.

## Reservas y voucher

Reglas aprobadas por el cliente (2026-10-13). Sustituyen a la regla anterior de no
bloquear reservas por cruce de fechas.

1. **Origen de las reservas:** el formulario público y el equipo del cliente desde el panel
   (botón "Crear reserva" en `/admin/reservas`).
2. **Pagos:** el administrador registra el pago en el panel (monto, fecha y forma de pago).
   El voucher dice "Total pagado" solo si hay un pago registrado; si no, dice "Pendiente de
   pago" o "Pago al llegar".
3. **Disponibilidad:** no se pueden confirmar dos reservas en el mismo apartamento con
   fechas que se crucen. Las solicitudes `Pendiente` sí pueden coincidir; el bloqueo se
   aplica al pasar a `Confirmada`. Las fechas son intervalos [entrada, salida): si una
   reserva sale el mismo día que entra otra, no se cruzan. Si el cliente tiene varios
   apartamentos iguales, cada uno se registra como una unidad (un apartamento) distinta.
4. **Voucher en PDF** solo con la marca Euronest Apartamentos, inspirado en el diseño de
   referencia del cliente (`referencias/`, fuera del repositorio) pero sin copiar marcas
   ajenas ni los datos personales que aparecen en él. Incluye un QR que lleva a la página pública de
   verificación de la reserva.
5. **Página de verificación:** muestra el estado real (confirmada o no, fechas, apartamento
   y si el pago está registrado). Se accede con el enlace del QR o con localizador y PIN, y
   no muestra más datos personales de los necesarios.
6. **Correo de confirmación:** al confirmar una reserva se envía un correo al huésped con el
   PDF adjunto y el enlace de verificación.
7. **Desarrollo:** los vouchers de prueba llevan la marca de agua "DOCUMENTO DE PRUEBA · SIN
   VALIDEZ" y datos `@example.com`.

## Idiomas

- Español sin prefijo (`/ciudades`) e inglés con prefijo (`/en/ciudades`). Las rutas en
  inglés usan los mismos segmentos que en español (no se traducen).
- Sin detección por idioma del navegador ni cookie de idioma: la URL decide el idioma.
- Textos de la interfaz en `messages/es.json` y `messages/en.json`.
- Contenidos de la base de datos: **descripciones y barrios solo en español** por ahora
  (también en `/en`).
- **Comodidades:** lista fija definida en el código y traducida con `next-intl`; en la base
  de datos se guardan sus claves en `amenities`, y el panel las elige con casillas.
  La lista está en `src/lib/amenities.ts`, con iconos en
  `src/components/apartments/amenity-icon.tsx` y textos en `Amenities` de los mensajes.
  Las claves desconocidas se ignoran al mostrar.

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

## Diseño

- Colores **provisionales** hasta que el cliente confirme los suyos: arena (fondos),
  terracota (acento) y oliva (secundario), definidos en `@theme` de `src/app/globals.css`.
- Solo tema claro. Logotipo de texto provisional en `src/components/layout/logo.tsx`.
- Sin fotos se muestra un marcador (`PhotoPlaceholder`); las páginas deben verse bien así.
- Las tarjetas marcan "Estancia larga" a partir de 28 noches mínimas
  (`LONG_STAY_MIN_NIGHTS` en `src/lib/format.ts`).
- Las páginas de contenido muestran un aviso de texto provisional (`ContentPage`) hasta que
  el cliente entregue los textos; Propietarios no tiene botón de contacto hasta tener los
  datos de contacto.
