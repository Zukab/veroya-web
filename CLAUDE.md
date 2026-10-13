# Veroya Apartments — página web

Página web de Veroya Apartments, negocio de alquiler de apartamentos en España.
Proyecto nuevo y limpio: no se reutiliza código, datos ni infraestructura de ninguna
versión anterior.

**Plazo: la parte básica debe quedar en producción en 1–2 días.** Prioriza que funcione,
sea segura y sea simple. No agregues funciones fuera del alcance sin preguntar.

## Stack

- Next.js (App Router) + TypeScript estricto + Tailwind CSS
- Supabase: PostgreSQL, Auth (solo para el panel de administración) y Storage (fotos)
- Despliegue en el plan gratuito de Vercel por ahora.
- El código debe poder moverse a Cloudflare sin rehacerlo: no usar servicios exclusivos de
  Vercel (Blob, KV, Edge Config, Analytics) y servir las imágenes desde Supabase Storage sin
  depender de la optimización de imágenes de Vercel (`images.unoptimized: true`).
- Supabase en plan gratuito por ahora.
- Idiomas: español (por defecto) e inglés, con `next-intl` y rutas con prefijo (`/en/...`).
- Validación de formularios y entradas del servidor con `zod`.

## Cuentas e infraestructura

- Repositorio: GitHub personal de Sebastián (privado, `veroya-web`).
- Despliegue: cuenta personal de Vercel de Sebastián (plan gratuito), conectada a ese GitHub.
- Supabase: proyecto `veroya` en región de América, creado con la cuenta del proyecto
  `veroyaproyecto@gmail.com`.
- Dominio: uno nuevo, por definir. Mientras tanto se usa la dirección de prueba de Vercel.
- Sebastián administra todas las cuentas. Nunca escribas claves, contraseñas ni tokens en el
  código, en commits ni en archivos versionados; todo va en `.env.local`.

## Comandos

- `npm run dev` — servidor local
- `npm run build` — debe pasar sin errores antes de dar una tarea por terminada
- `npm run lint`

Variables de entorno en `.env.local` (nunca se suben al repo):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

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
al usuario el código y el PIN.

Panel de administración (`/admin`):
- `/admin/login` con Supabase Auth (correo y contraseña). Sin registro público:
  los usuarios administradores se crean desde el panel de Supabase.
- `/admin/apartamentos` y `/admin/apartamentos/[id]`: crear, editar, borrar, subir fotos.
- `/admin/ciudades` y `/admin/ciudades/[slug]`: crear, editar, borrar, subir foto.
- `/admin/reservas`: listado (más recientes primero), filtro por estado, cambiar estado
  (`Pendiente`, `Confirmada`, `Cancelada`) y borrar.

Los contenidos (ciudades, apartamentos, fotos) los carga el cliente desde el panel.
Incluye un script de datos de ejemplo (`supabase/seed.sql`) solo para desarrollo local.

Fuera de alcance por ahora: pagos, calendarios de disponibilidad, sincronización con
Airbnb/Booking, correos automáticos.

**No bloquees reservas por cruce de fechas.** El cliente registra reservas que pueden
coincidir en el mismo apartamento; el sistema solo registra y el equipo gestiona.

## Modelo de datos (Supabase)

- `cities`: `slug` (PK, texto), `name`, `image_url`, `description`, `created_at`
- `apartments`: `id` (PK, texto, slug legible), `city_slug` (FK → cities), `name`,
  `price` (entero, euros por noche), `rooms`, `baths`, `size` (m²), `max_guests`,
  `rating` (numeric 3,2), `reviews`, `min_nights`, `neighborhood`, `description`,
  `images` (text[] con URLs de Storage), `amenities` (text[]), `created_at`
- `bookings`: `id` (uuid), `booking_code` (único), `booking_pin`, `created_at`,
  `status` (enum: Pendiente, Confirmada, Cancelada), `user_name`, `user_email`,
  `user_phone`, `user_country`, `guests`, `check_in` (date), `check_out` (date),
  `city_name`, `apartment_id` (FK nullable, on delete set null), `apartment_name`, `message`

Gestiona el esquema con migraciones SQL en `supabase/migrations/`.

## Seguridad

- Row Level Security activado en todas las tablas.
  - `cities` y `apartments`: lectura pública; escritura solo usuarios autenticados.
  - `bookings`: sin acceso público de lectura. La creación se hace en una Server Action
    o Route Handler del servidor que valida con `zod`; lectura, edición y borrado solo
    para usuarios autenticados.
- La `SUPABASE_SERVICE_ROLE_KEY` solo se usa en código de servidor, nunca en el cliente.
- Ninguna contraseña ni clave escrita en el código.
- Las rutas `/admin/*` se protegen en el servidor (middleware + verificación de sesión),
  no solo ocultándolas en el cliente.
- Las imágenes van en Supabase Storage (bucket público `media`), nunca como base64 en la
  base de datos.
- Código y PIN de reserva generados con `crypto`, no con `Math.random`.
- Validar fechas: `check_out` posterior a `check_in`, años razonables.

## Forma de trabajo

- Antes de tareas grandes, propone un plan corto y espera aprobación.
- Cambios pequeños y un commit por paso lógico, con mensajes en español.
- Corre `npm run build` y `npm run lint` antes de decir que algo está listo.
- Pregunta antes de instalar dependencias que no estén en el stack de arriba.
- Diseño limpio, moderno y responsive (primero móvil).
