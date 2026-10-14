# Euronest Apartamentos — página web

Página web de **Euronest Apartamentos**, negocio de alquiler de apartamentos en España.
El cliente (en Colombia) es el único propietario de todos los apartamentos; compra y vende
pisos con frecuencia, así que los crea y borra él mismo desde el panel.
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
**Bloque 2 — páginas públicas: terminado (2026-10-13).**
- Base visual, inicio, `/ciudades`, `/ciudades/[ciudad]`, `/apartamento/[id]` (galería,
  comodidades y formulario de reserva) y las tres páginas de contenido con textos
  provisionales.
- Comodidades pasadas a claves fijas (migración `..._comodidades_a_claves` aplicada).

**Bloque 3 — panel de administración: terminado (2026-10-13).** Login, sesión en el proxy,
ciudades y apartamentos con fotos, y reservas con pagos.

**Bloque 4 — voucher: en curso.** Diseño aprobado por el cliente (2026-10-13); ver
"Reservas y voucher". Pasos:
1. Apartamentos con dirección (web con enlace a Google Maps y voucher), camas y comodidades
   nuevas (migración `..._apartamentos_direccion_y_camas`).
2. Ajustes de la agencia en `/admin/ajustes`.
3. Página pública de verificación.
4. Voucher en PDF generado en el servidor y botón "Descargar voucher" en el panel.
5. Correo al confirmar, con el PDF adjunto y el enlace de verificación.

Pendiente de verificar:
- Escrituras con sesión iniciada contra RLS: `bookings`, `booking_payments` y
  `check_rate_limit` **ya probados** (2026-10-13) simulando a `admin-prueba@example.com`
  (admin), `sinpermisos@example.com` (sin permisos), `anon` y `service_role` por SQL dentro
  de una transacción con `ROLLBACK`. Faltan `cities`, `apartments` y Storage: probarlos
  igual en el paso del panel de contenidos. Claude no escribe contraseñas (ni de prueba):
  las pantallas del panel las prueba con la sesión que Sebastián inicie en el navegador.
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
- Iconos con `lucide-react` (aprobado). Voucher en PDF con `@react-pdf/renderer` y `qrcode`
  (aprobados). Fuentes con `next/font/google`: Geist (texto) y
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
Opcionales (ver `.env.example`): `SITE_URL` (enlaces absolutos del QR y del correo,
`src/lib/site-url.ts`; si falta, la dirección de producción de Vercel o localhost),
`RESEND_API_KEY` y `EMAIL_FROM` (correo de confirmación).

## Alcance

Parte pública:
- `/` inicio (portada, ciudades y apartamentos destacados: los 6 mejor valorados; los que
  no tienen valoraciones van al final)
- `/ciudades` y `/ciudades/[ciudad]` (apartamentos de la ciudad)
- `/apartamento/[id]` detalle con galería, camas, comodidades, dirección (con enlace a
  Google Maps, `src/lib/maps.ts`) y formulario de reserva
- `/como-funciona`, `/estancias-largas`, `/propietarios` (páginas de contenido; usa textos
  provisionales claros que el cliente reemplazará)
- `/verificar` (consulta con localizador y PIN, 10 intentos cada 15 minutos por IP) y
  `/verificar/[token]` (destino del QR): estado actual, localizador, apartamento y fechas.
  Sin caché, `noindex`. Lecturas en `src/lib/bookings/verification.ts` con la clave secreta,
  solo de esos campos. Enlazada desde el pie y desde el mensaje de solicitud enviada.

Formulario de reserva: nombre, correo, teléfono, país, número de huéspedes, fecha de entrada,
fecha de salida y mensaje opcional. Al guardar, genera un localizador `ENA-XXXXX`
(5 caracteres A-Z0-9; la base de datos exige el prefijo `ENA-`, que sustituyó a `VRY-` de
la marca anterior) y un PIN de 4 dígitos, queda en estado `Pendiente` y se le muestran
al usuario el código y el PIN. Además:
- **Protección contra spam:** campo trampa invisible (honeypot) y límite de **30 envíos por
  hora y por IP** (el equipo del cliente puede registrar muchas reservas seguidas desde el
  mismo equipo). El límite no puede usar servicios exclusivos de Vercel (p. ej. KV); debe
  funcionar también en Cloudflare (por ejemplo, con una tabla en Supabase).
- **Reglas del apartamento:** rechazar estancias por debajo de `min_nights` y más huéspedes
  que `max_guests`, con un mensaje claro.
- **Código repetido:** si el insert falla por `booking_code` duplicado (error `23505`),
  reintentar con otro código generado con `crypto`.
- Implementado en `src/app/[locale]/apartamento/[id]/actions.ts` (Server Action) y
  `src/components/bookings/booking-form.tsx`. Validación en `src/lib/bookings/schema.ts`;
  los errores son claves de `BookingErrors` en los mensajes. Guarda `total_amount` =
  precio × noches (el formulario lo muestra como precio orientativo).
- El límite por IP (`src/lib/rate-limit.ts`) guarda un HMAC de la IP con la clave secreta
  de Supabase como clave: si se rota esa clave, los contadores empiezan de cero.

Panel de administración (`/admin`):
- `/admin/login` con Supabase Auth (correo y contraseña). Sin registro público:
  los usuarios se crean desde el panel de Supabase y, para poder escribir, se añaden a
  `public.admins` (ver "Seguridad").
- `/admin/apartamentos` y `/admin/apartamentos/[id]`: crear, editar, borrar, subir fotos.
- `/admin/ciudades` y `/admin/ciudades/[slug]`: crear, editar, borrar, subir foto. Borrar
  una ciudad con apartamentos está bloqueado en la base de datos (error `23503`): el panel
  debe mostrar un mensaje claro. Borrar un apartamento con reservas `Confirmada` también
  falla (error `23514`, regla `bookings_confirmed_requires_apartment`): el panel debe
  explicar que hay que cancelar o mover antes esas reservas.
- `/admin/reservas`: listado (más recientes primero), filtro por estado, botón "Crear
  reserva", cambiar estado (`Pendiente`, `Confirmada`, `Cancelada`), registrar pagos y
  borrar. Ver "Reservas y voucher".
  - Listado con búsqueda por localizador, nombre o correo y 25 por página.
  - `/admin/reservas/nueva` y `/admin/reservas/[id]`: el panel edita datos del huésped,
    fechas, apartamento, estado, idioma, total y condiciones de pago. Si cambia el
    apartamento se copian su nombre y su ciudad.
  - En el panel, `min_nights` y `max_guests` **solo se avisan** (no bloquean): el equipo
    puede hacer excepciones y registrar reservas pasadas. El formulario público sí los
    exige.
  - Total: al crear, si se deja vacío se usa precio × noches; el panel propone ese cálculo.
  - Errores explicados: cruce con otra confirmada (`23P01`, indica qué reserva) y
    confirmada sin apartamento (`23514`).
  - Pagos: se registran (importe, fecha, forma, nota) o se borran; la ficha muestra total,
    pagado y pendiente.

- `/admin/ajustes`: contacto de la agencia (teléfono y correo), horas de entrada y salida,
  normas (una por línea) y política de cancelación. Los usan el voucher y el correo; se leen
  con `getAgencySettings()` (`src/lib/data/settings.ts`, etiqueta `settings`). Los textos
  van solo en español, también en los vouchers en inglés.

Los contenidos (ciudades, apartamentos, fotos) los carga el cliente desde el panel.
- Crear: `/admin/ciudades/nueva` y `/admin/apartamentos/nuevo` (por eso `nueva`/`nuevo` son
  identificadores reservados). El identificador (slug/id) no se cambia una vez creado.
- Fotos: el navegador las reduce a 2000 px en WebP y las sube a `media` (`ciudades/` y
  `apartamentos/`, nombres aleatorios) con la sesión del administrador. Al guardar o borrar
  se eliminan de Storage las que ya no se usan; si se sube una foto y no se guarda el
  formulario, queda huérfana en Storage (no afecta a la web).
- Al guardar se invalidan las etiquetas de caché con `updateTag()`.

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
4. **Voucher en PDF** solo con la marca Euronest Apartamentos. Diseño aprobado por el
   cliente: maqueta en `referencias/maqueta-voucher/` (fuera del repositorio). Una página A4:
   - Localizador, fecha de emisión y estado en la fecha de emisión.
   - Apartamento: nombre, dirección y enlace a Google Maps; habitaciones, baños, m², camas
     y comodidades.
   - Entrada y salida con sus horas, noches y número de huéspedes.
   - Titular abreviado: nombre e inicial del apellido ("Laura Martín G.").
   - Pago: total y "Pagado", "Pendiente de pago" o "Pago al llegar".
   - QR a la página de verificación, información de la estancia (horarios, normas y
     cancelación) y contacto de la agencia, sacados de los ajustes de la agencia.
   - **No incluye:** correo ni teléfono del huésped, forma de pago ni datos de tarjeta, ni
     el PIN.
   - Código en `src/lib/voucher/`: `data.ts` (lee la reserva con la clave secreta; llamar
     solo tras `requireAdmin()`), `document.tsx` (`@react-pdf/renderer`, textos en
     `Voucher` de los mensajes, idioma de la reserva), `render.ts` (QR con `qrcode` y
     fuentes TTF de `fonts/`, incluidas en el despliegue con `outputFileTracingIncludes`
     de `next.config.ts`) y `guest-name.ts` (nombre abreviado).
   - Descarga: `/admin/reservas/[id]/voucher` (solo reservas confirmadas).
   - Marca de agua en desarrollo (`NODE_ENV` distinto de `production`) y en reservas con
     correo `@example.com`.
   - Para moverlo a Cloudflare habría que revisar la lectura de fuentes del disco y la
     compatibilidad de `@react-pdf/renderer` con Workers.
5. **Página de verificación:** muestra solo el estado actual (confirmada, pendiente o
   cancelada), el localizador, el apartamento y las fechas; ningún dato personal ni importe.
   Se accede con el enlace del QR o con localizador y PIN.
6. **Correo de confirmación:** al confirmar una reserva en el panel se envía un correo al
   huésped con el PDF adjunto y el enlace de verificación. Con huéspedes reales funciona
   solo cuando el dominio esté verificado en Resend.
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
  `images` (text[] con URLs de Storage), `amenities` (text[]), `created_at`, y desde
  `..._apartamentos_direccion_y_camas`: `address` (texto, `''` en los apartamentos
  anteriores; el panel la exige), `beds_double`, `beds_single` y `sofa_beds` (enteros, 0 por
  defecto)
- `bookings`: `id` (uuid), `booking_code` (único, `ENA-XXXXX`), `booking_pin`,
  `created_at`, `status` (enum: Pendiente, Confirmada, Cancelada), `user_name`,
  `user_email`, `user_phone`, `user_country`, `guests`, `check_in` (date), `check_out`
  (date), `city_name`, `apartment_id` (FK nullable, on delete set null), `apartment_name`,
  `message`, y desde M1 (`..._reservas_pagos_voucher`):
  - `source` (enum `web`/`panel`), `created_by` (FK → auth.users): los fija el trigger al
    crear según haya sesión o no; no se pueden falsear ni cambiar.
  - `locale` (`es`/`en`), `verification_token` (32 hex, único, para el QR),
    `payment_terms` (enum `pendiente`/`al_llegar`), `total_amount` (numeric 10,2, euros;
    null = sin definir), `confirmed_at` (lo mantiene el trigger), `confirmation_email_sent_at`
    (solo lo escribe el servidor) y `updated_at`.
  - Restricciones: una `Confirmada` exige `apartment_id`; no puede haber dos `Confirmada`
    del mismo apartamento con fechas cruzadas (exclusión con `btree_gist`, error `23P01`).
- `booking_payments`: `id`, `booking_id` (FK, on delete cascade), `amount` (numeric 10,2,
  > 0), `paid_on` (date), `method` (enum `efectivo`/`transferencia`/`tarjeta`/`bizum`/
  `otro`), `note`, `created_by` y `created_at` (los fija el trigger). Solo se registran o
  se borran; no se editan.
- `admins`: `user_id` (PK, FK → auth.users), `created_at` — lista de administradores
- `agency_settings`: una sola fila (`id = true`) con `phone`, `email`, `check_in_time`,
  `check_out_time`, `house_rules` y `cancellation_policy`. Lectura pública; solo los
  administradores la editan (no se crean ni borran filas).
- `private.rate_limit_hits` + `public.check_rate_limit(bucket, key_hash, max, ventana_s)`:
  límite de intentos por hash de IP u otra clave; solo lo ejecuta el servidor
  (`service_role`).

Gestiona el esquema con migraciones SQL en `supabase/migrations/`. Las restricciones CHECK
de la base de datos son la última barrera; la validación principal es con zod.

## Datos de ejemplo

- `supabase/seed.sql` está **cargado en el proyecto real** (no hay Supabase local).
  Identificables por slugs/ids `ejemplo-...`, correos `@example.com` y códigos `ENA-EJ...`.
  Se puede volver a ejecutar sin duplicar datos (si se cargara en una base vacía, el
  trigger pondría a sus reservas la fecha de la carga como `created_at`).
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
    leen, crean, borran y editan solo estas columnas: `status`, datos del huésped,
    `guests`, `message`, `locale`, fechas, apartamento (`apartment_id`, `apartment_name`,
    `city_name`), `payment_terms` y `total_amount`.
  - `booking_payments`: solo administradores; leer, registrar y borrar (no editar).
  - Storage `media`: lectura pública por URL; subir, reemplazar y borrar solo
    administradores. Máximo 5 MB, solo JPEG, PNG y WebP.
- La `SUPABASE_SERVICE_ROLE_KEY` solo se usa en código de servidor, nunca en el cliente
  (`src/lib/supabase/admin.ts`, marcado `server-only`).
- Ninguna contraseña ni clave escrita en el código.
- Las rutas `/admin/*` se protegen en el servidor (`src/proxy.ts` + verificación de sesión
  y de pertenencia a `public.admins`), no solo ocultándolas en el cliente.
  - `src/app/admin/layout.tsx` es un layout raíz aparte (solo español, sin `next-intl`,
    `noindex`); las páginas con sesión van en el grupo `src/app/admin/(panel)/`.
  - `src/proxy.ts` desvía `/admin` a `src/lib/supabase/proxy.ts`: renueva la sesión y
    manda al login a quien no la tiene (con `?next=`, solo hacia rutas `/admin`).
  - `src/lib/auth/admin.ts`: `requireSession()` para páginas y `requireAdmin()` para cada
    lectura y Server Action del panel (devuelve el cliente con la sesión). El layout del
    panel muestra "Sin permisos" a usuarios con sesión que no están en `public.admins`.
  - Login con límite propio de 10 intentos cada 15 minutos por IP, además del de Supabase.
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
