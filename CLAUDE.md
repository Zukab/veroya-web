# Euronest Apartamentos — página web

Página web de **Euronest Apartamentos**, negocio de alquiler de apartamentos (en España y en otros países: el panel admite ciudades de cualquier país).
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
- Datos de ejemplo en el proyecto real, creados desde el panel (ver "Datos de ejemplo").
- Usuario administrador creado: `veroyaproyecto@gmail.com` (en `public.admins`).
**Bloque 2 — páginas públicas: terminado (2026-10-13).**
- Base visual, inicio, `/ciudades`, `/ciudades/[ciudad]`, `/apartamento/[id]` (galería,
  comodidades y formulario de reserva) y las tres páginas de contenido con textos
  provisionales.
- Comodidades pasadas a claves fijas (migración `..._comodidades_a_claves` aplicada).

**Bloque 3 — panel de administración: terminado (2026-10-13).** Login, sesión en el proxy,
ciudades y apartamentos con fotos, y reservas con pagos.

**Bloque 4 — voucher: terminado (2026-10-13).** Diseño aprobado por el cliente; ver
"Reservas y voucher". Dirección, camas y comodidades nuevas en los apartamentos, ajustes de
la agencia (`/admin/ajustes`), página pública de verificación, voucher en PDF y correo de
confirmación. Pendiente:
- Probar con la sesión de Sebastián las pantallas del panel de este bloque: formulario de
  apartamentos (dirección y camas), `/admin/ajustes`, descarga del voucher y envío del
  correo. El PDF, el QR, el correo y la verificación se probaron en local sin sesión.

Pendiente de verificar:
- Escrituras con sesión iniciada contra RLS: `bookings`, `booking_payments` y
  `check_rate_limit` **ya probados** (2026-10-13) simulando a `admin-prueba@example.com`
  (admin), `sinpermisos@example.com` (sin permisos), `anon` y `service_role` por SQL dentro
  de una transacción con `ROLLBACK`. `cities`, `apartments`, `agency_settings` y Storage
  **también probados** (2026-10-13): anon rechazado; sin permisos no crea nada y edita o
  borra 0 filas; admin puede todo (Storage además por su API: anon no sube ni borra).
  Claude no escribe contraseñas (ni de prueba): las pantallas del panel las prueba con la
  sesión que Sebastián inicie en el navegador.
- Protección contra contraseñas filtradas de Supabase Auth: desactivada (aviso de
  `db advisors`); probablemente no disponible en el plan gratuito. Activarla si lo está.

**Dominio `euronestapartamentos.com`: conectado (2026-10-15).**
- Comprado en **Spaceship** (cuenta `veroyaproyecto@gmail.com`, 2,90 $ el primer año con
  el código `COMPROS`; renueva por unos 10 $/año, caduca el 2027-10-15: tener activada la
  renovación automática). Los DNS se gestionan en Spaceship (no en Vercel): `A @` y
  `CNAME www` de Vercel, y DKIM (`resend._domainkey`), `send`, `rsend` y `_dmarc` de
  Resend. Sin MX: el dominio no recibe correo (las respuestas van al `reply_to` de la
  agencia).
- Vercel: dominio principal sin `www` (`www` redirige con 308). `SITE_URL` y `EMAIL_FROM`
  (`Euronest Apartamentos <reservas@euronestapartamentos.com>`) solo en **Production**;
  Preview, Development y `.env.local` siguen con la dirección de pruebas de Resend, que solo
  envía a `veroyaproyecto@gmail.com` (la base de datos es la real).
- Resend: dominio en la región São Paulo (`sa-east-1`), sin seguimiento de aperturas ni
  clics. La `RESEND_API_KEY` solo permite enviar (no gestiona dominios).
- `vercel.json` redirige `veroya-web-6h67.vercel.app` al dominio (los QR de vouchers
  antiguos siguen funcionando). `metadataBase`, `canonical` y `hreflang` en
  `src/lib/seo.ts` (`localeAlternates()` en cada página pública indexable).
- Correo a una dirección real probado en producción (2026-10-15, solicitud `ENA-KNSI9`):
  llegó a la bandeja de entrada de Gmail desde `reservas@euronestapartamentos.com`, con el
  enlace al dominio (la reserva de prueba se borró después).
- Cuenta de Spaceship con el correo `veroyaproyecto@gmail.com`. Titular y contactos
  (administrativo, técnico y facturación) del dominio: el cliente, Miguel Antonio Canizalez
  Cubillos (Cali, Colombia), con `veroyaproyecto@gmail.com`, desde el 2026-10-15; es el
  contacto predeterminado de la libreta de direcciones. Renovación automática y privacidad
  WHOIS activadas. El contacto anterior (Sebastián) queda en la libreta, sin usar.
- **Sin tarjeta en Spaceship** (Sebastián quitó la suya): el cliente debe poner la suya
  antes del 2027-10-15 o la renovación automática fallará. Va en el manual de usuario.
- Sebastián mantiene la web: Vercel y GitHub siguen en sus cuentas personales.

**Manual de usuario (pendiente, más adelante):** incluir que el cliente ponga su tarjeta en
Spaceship (cuenta `veroyaproyecto@gmail.com`) antes del 2027-10-15.

**Entrega al cliente (2026-10-15):** marca de agua comprobada en producción: un voucher de
una reserva real sale sin ella; solo la llevan las reservas `@example.com` y lo generado en
desarrollo. Todo el catálogo sigue siendo de ejemplo (8 apartamentos `ejemplo-...` con
valoraciones inventadas). Las 9 reservas de prueba (con sus pagos) se borraron el
2026-10-15: la base de datos queda sin reservas. El cliente debe
crear apartamentos nuevos (no editar los de ejemplo: el id `ejemplo-...` no cambia y sale
en la URL) y después borrar los de ejemplo. Faltan en `/admin/ajustes` los datos legales
del titular (nombre, NIF/NIT y dirección).
- `veroya-web.vercel.app` (sin sufijo, proyecto antiguo con la marca anterior) se conserva
  por decisión de Sebastián (2026-10-15): no borrarlo.

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
- Dominio: `https://euronestapartamentos.com`, registrado en Spaceship y conectado a
  Vercel y a Resend (ver "Dominio" en "Estado del proyecto").
- Sebastián administra todas las cuentas. Nunca escribas claves, contraseñas ni tokens en el
  código, en commits ni en archivos versionados; todo va en `.env.local`.

## Comandos

- `npm run dev` — servidor local
- `npm run build` — debe pasar sin errores antes de dar una tarea por terminada
- `npm run lint`
- `npm test` — pruebas automáticas con Vitest (`tests/`): buscador, reglas de reserva,
  localizador, voucher, correos y textos legales. Solo lógica, sin base de datos.
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
- Botón flotante de WhatsApp en todas las páginas y contacto en el pie (datos de
  `/admin/ajustes`; `whatsappUrl()` en `src/lib/data/settings.ts`).
- `/` inicio: portada con buscador (ciudad, entrada, salida, huéspedes; foto de
  `/admin/ajustes`), ciudades y apartamentos destacados (los 6 mejor valorados; los que no
  tienen valoraciones van al final)
- `/buscar?ciudad=&entrada=&salida=&huespedes=`: resultados con capacidad suficiente y, si
  hay fechas, libres (sin reserva Confirmada que se cruce, `src/lib/bookings/availability.ts`)
  y con la estancia mínima cumplida. Parámetros en `src/lib/search.ts`; las tarjetas los
  conservan y el formulario del apartamento llega relleno.
- `/ciudades` y `/ciudades/[ciudad]` (apartamentos de la ciudad)
- `/apartamento/[id]` detalle con galería, camas, comodidades, dirección (con enlace a
  Google Maps, `src/lib/maps.ts`) y formulario de reserva
- `/como-funciona`, `/estancias-largas`, `/propietarios`: textos aprobados por el cliente
  (2026-10-15), igual que sus ajustes en `/admin/ajustes`. Propietarios va dirigida a quien quiere vender o
  alquilar su piso (el cliente compra apartamentos), con botones de WhatsApp y correo.
- `/aviso-legal`, `/privacidad`, `/cookies`: textos en `src/lib/legal/content.ts` (es/en),
  pensados para varios países (RGPD y Ley 1581 de Colombia). Usan los datos del titular de
  `/admin/ajustes` (`src/lib/legal/owner.ts`). Son una base: recomendar revisión legal.
  Enlazados en el pie. Los formularios públicos exigen la casilla de privacidad
  (`PrivacyConsent`, campo `privacy` validado en el servidor).
- `/solicitud`: solicitud general sin elegir apartamento (ciudad, fechas, huéspedes y datos;
  llega rellena desde el buscador). Se guarda como Pendiente con `apartment_id` null y la
  ciudad en `city_name`; el equipo asigna el apartamento en el panel y la confirma. Botón
  "Solicitar reserva" en la cabecera. Inserción común en `src/lib/bookings/create-public.ts`.
- `/verificar` (consulta con localizador y PIN, 10 intentos cada 15 minutos por IP) y
  `/verificar/[token]` (destino del QR; ver "Reservas y voucher", punto 5). Sin caché,
  `noindex`, imprimible. Lecturas en `src/lib/bookings/verification.ts` con la clave secreta,
  solo de los campos que muestra. Enlazada desde el pie, el mensaje de solicitud enviada, el
  botón «Mi reserva» de la cabecera (en móvil solo el icono; texto en el menú) y un enlace
  bajo el buscador del inicio (pedido por el cliente el 2026-10-15). Sigue pidiendo el PIN.

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
  explicar que hay que cancelar o mover antes esas reservas. La sección «Borrar apartamento»
  de la ficha lista esas reservas confirmadas con enlace a cada una y no muestra el botón
  mientras existan (el mensaje de error queda por si cambian entre medias).
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

- `/admin/ajustes`: contacto de la agencia (teléfono, correo y WhatsApp), foto de portada del
  inicio (carpeta `portada/` de `media`), horas de entrada y salida,
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

1. **Origen de las reservas:** el formulario de cada apartamento, la solicitud general
   (`/solicitud`) y el equipo del cliente desde el panel (botón "Crear reserva" en
   `/admin/reservas`). El cliente a veces usa el formulario público por los huéspedes que le
   escriben por WhatsApp.
2. **Pagos:** el administrador registra el pago en el panel (monto, fecha y forma de pago).
   El voucher dice "Total pagado" solo si hay un pago registrado; si no, dice "Pendiente de
   pago" o "Pago al llegar".
3. **Disponibilidad:** no se pueden confirmar dos reservas en el mismo apartamento con
   fechas que se crucen. Las solicitudes `Pendiente` sí pueden coincidir; el bloqueo se
   aplica al pasar a `Confirmada`. Las fechas son intervalos [entrada, salida): si una
   reserva sale el mismo día que entra otra, no se cruzan. Si el cliente tiene varios
   apartamentos iguales, cada uno se registra como una unidad (un apartamento) distinta.
   El formulario público no acepta solicitudes que se crucen con una reserva Confirmada
   del mismo apartamento (error `unavailable`); el panel sí puede crearlas como Pendiente.
4. **Voucher en PDF** solo con la marca Euronest Apartamentos. Diseño aprobado por el
   cliente: maqueta en `referencias/maqueta-voucher/` (fuera del repositorio). Una página A4:
   - Localizador, fecha de emisión y estado en la fecha de emisión.
   - Apartamento: nombre, dirección y enlace a Google Maps; habitaciones, baños, m², camas
     y comodidades.
   - Entrada y salida con sus horas, noches y número de huéspedes.
   - Titular con el **nombre completo** (pedido por el cliente el 2026-10-14; antes iba
     abreviado).
   - Pago: total y "Pagado", "Pendiente de pago" o "Pago al llegar".
   - QR a la página de verificación, información de la estancia (horarios, normas y
     cancelación) y contacto de la agencia, sacados de los ajustes de la agencia.
   - **No incluye:** correo ni teléfono del huésped, forma de pago ni datos de tarjeta, ni
     el PIN.
   - Código en `src/lib/voucher/`: `data.ts` (lee la reserva con la clave secreta; llamar
     solo tras `requireAdmin()`), `document.tsx` (`@react-pdf/renderer`, textos en
     `Voucher` de los mensajes, idioma de la reserva), `render.ts` (QR con `qrcode` y
     fuentes TTF de `fonts/`, incluidas en el despliegue con `outputFileTracingIncludes`
     de `next.config.ts`) y `guest-name.ts` (nombre de pila para los correos).
   - Descarga: `/admin/reservas/[id]/voucher` (solo reservas confirmadas).
   - Marca de agua en desarrollo (`NODE_ENV` distinto de `production`) y en reservas con
     correo `@example.com`.
   - Para moverlo a Cloudflare habría que revisar la lectura de fuentes del disco y la
     compatibilidad de `@react-pdf/renderer` con Workers.
5. **Página de verificación** (cambio pedido por el cliente el 2026-10-14, inspirado en su
   referencia): "Verificación oficial" con foto y dirección del apartamento, estado actual,
   localizador, fechas con horas, huéspedes, titular (nombre completo), valor pagado con sus
   pagos (fecha y forma), total y pendiente, bienvenida, recomendaciones de llegada y
   descargas del **voucher** y del **comprobante de pago** en PDF (`/verificar/[token]/voucher`
   y `/comprobante`, con el token como acceso). No muestra correo, teléfono ni PIN.
   "Comprobado el…" se escribe en el navegador con la hora del dispositivo
   (`LocalTime`): el cliente y muchos huéspedes están en Colombia, no en España.
   Se accede con el enlace del QR o con localizador y PIN.
   - Comprobante de pago (`src/lib/voucher/receipt-document.tsx`): informativo, **no es una
     factura** (una factura legal exige requisitos fiscales de cada país). También se descarga
     en el panel (`/admin/reservas/[id]/comprobante`).
   - El estado del pago se calcula igual en voucher y verificación
     (`src/lib/bookings/payment-summary.ts`). En el panel, una reserva confirmada sin pagos
     muestra un aviso y un botón "Pago completo" que rellena el importe pendiente.
6. **Acuse de recibo:** cada solicitud de la web (apartamento o `/solicitud`) envía al
   huésped un correo con el localizador, el PIN, los datos y el enlace de estado, sin voucher
   (`src/lib/email/request-received.ts`, con `after()` para no retrasar la respuesta; si
   falla solo se registra). Las reservas creadas desde el panel no lo envían.
7. **Correo de confirmación:** al confirmar una reserva en el panel se envía un correo al
   huésped con el PDF adjunto y el enlace de verificación. Con huéspedes reales funciona
   solo cuando el dominio esté verificado en Resend.
   - Se envía solo la primera vez que una reserva pasa a `Confirmada` (al editarla o al
     crearla ya confirmada) y anota `confirmation_email_sent_at`. Para reenviarlo, botón
     «Enviar / Reenviar por correo» en la sección «Voucher» de la ficha.
   - Si el envío falla, la reserva se guarda igual y el panel explica el motivo (sin
     configurar, Resend sin dominio verificado, etc.).
   - Código en `src/lib/email/`: `resend.ts` (API de Resend con `fetch`, sin SDK),
     `layout.ts` (diseño común), `confirmation-template.ts` (mensajes `ConfirmationEmail`) y
     `confirmation.ts` (`sendConfirmationEmail`, nunca lanza). Responder al correo llega al
     correo de la agencia (`reply_to`).
8. **Desarrollo:** los vouchers de prueba llevan la marca de agua "DOCUMENTO DE PRUEBA · SIN
   VALIDEZ" y datos `@example.com`.

## Zona horaria

- La agencia trabaja en **hora de Colombia** (`AGENCY_TIME_ZONE = "America/Bogota"` en
  `src/lib/bookings/dates.ts`, decisión del 2026-10-14): el "hoy" de las reservas
  (`todayInAgency()`), las horas del panel y la fecha de emisión del voucher y del
  comprobante. La página del QR muestra "Comprobado el…" con la hora del dispositivo.
- Las fechas de estancia son días sin hora (`YYYY-MM-DD`) y no dependen de la zona.

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

- `cities`: `slug` (PK, texto), `name`, `country` (nombre del país en español; el panel lo exige), `image_url`, `description`, `created_at`
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
- `agency_settings`: una sola fila (`id = true`) con `phone`, `email`, `whatsapp` (vacío = sin
  botones), `hero_image_url`, `check_in_time`,
  `check_out_time`, `house_rules` y `cancellation_policy`. Lectura pública; solo los
  administradores la editan (no se crean ni borran filas). Desde `..._ajustes_datos_legales`:
  `legal_name`, `tax_id` y `legal_address` (datos del titular para los textos legales).
- `private.purge_old_requests()` + tarea de `pg_cron` `borrar-solicitudes-antiguas` (día 1
  de cada mes, 04:00 UTC): borra reservas no confirmadas, sin pagos, creadas hace más de 12
  meses y con la salida ya pasada (lo que promete `/privacidad`).
- `private.rate_limit_hits` + `public.check_rate_limit(bucket, key_hash, max, ventana_s)`:
  límite de intentos por hash de IP u otra clave; solo lo ejecuta el servidor
  (`service_role`).

Gestiona el esquema con migraciones SQL en `supabase/migrations/`. Las restricciones CHECK
de la base de datos son la última barrera; la validación principal es con zod.

## Datos de ejemplo

- Creados **desde el panel y los formularios de la web** (2026-10-13), no por SQL: ya no
  hay `seed.sql`. Fotos libres de Unsplash (copias en `referencias/fotos-ejemplo/`).
  - Ciudades reales y reutilizables: Madrid, Barcelona (España), París (Francia) y Lisboa
    (Portugal), con foto. No son de ejemplo: el cliente puede añadir ahí sus apartamentos.
  - 8 apartamentos con id `ejemplo-...`, con fotos, dirección inventada ("Calle de
    Ejemplo…") y valoraciones de muestra.
  - Reservas: solicitudes web en español, en inglés y general (`@example.com`), una
    creada confirmada desde el panel con un pago, y una confirmada con correo a
    `veroyaproyecto@gmail.com` (prueba real del voucher por correo).
  - Foto de portada en `/admin/ajustes`.
- Los correos `@example.com` nunca se envían (`ExampleAddressError` en
  `src/lib/email/resend.ts`).
- **Antes del lanzamiento:** borrar los apartamentos `ejemplo-...` desde el panel (así se
  borran también sus fotos de Storage) y sus reservas; o con
  `npx supabase db query --linked -f supabase/cleanup-seed.sql`, que no borra fotos.

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
  - Accesos rápidos: "Ver la web" en la cabecera del panel y "Panel" en la cabecera de la
    web, este último solo en el navegador con sesión (cookie `sb-…-auth-token`, se comprueba en
    el cliente para no romper la caché). Es solo un enlace: el control sigue en el servidor.
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
- Corre `npm run build`, `npm run lint` y `npm test` antes de decir que algo está listo.
- `npm audit` marca vulnerabilidades altas solo en dependencias de desarrollo (`braces`
  vía `eslint-config-next`); producción tiene 0. Revisar al actualizar Next.
- Pregunta antes de instalar dependencias que no estén en el stack de arriba.
- Diseño limpio, moderno y responsive (primero móvil).

## Diseño

- Colores **definitivos** (2026-10-15; el cliente no tenía marca y los aceptó): arena
  (fondos), terracota (acento) y oliva (secundario), definidos en `@theme` de
  `src/app/globals.css`.
- Solo tema claro.
- Logotipo (elegido el 2026-10-15): arco mediterráneo con puerta en terracota + "Euronest" en
  Fraunces y "APARTAMENTOS". Formas en `src/lib/brand.ts`; lo usan `logo.tsx` (cabecera y
  pie), el voucher y el comprobante (`src/lib/voucher/brand-mark.tsx`). Los iconos
  (`src/app/icon.svg`, `favicon.ico`, `apple-icon.png`) y el PNG de los correos
  (`public/brand/euronest-arco.png`) se generan con `node scripts/brand-assets.mjs`: si
  cambian las formas, actualizar el script y volver a ejecutarlo.
- Sin fotos se muestra un marcador (`PhotoPlaceholder`); las páginas deben verse bien así.
- Las tarjetas marcan "Estancia larga" a partir de 28 noches mínimas
  (`LONG_STAY_MIN_NIGHTS` en `src/lib/format.ts`).
- Las páginas de contenido usan `ContentPage` (botones internos o externos en la llamada
  final). Ya no muestran aviso de texto provisional.
