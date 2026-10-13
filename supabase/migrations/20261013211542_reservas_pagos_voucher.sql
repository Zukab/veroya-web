-- Reservas y voucher (ver "Reservas y voucher" en CLAUDE.md):
--   - prefijo de los localizadores: VRY- (marca anterior) pasa a ENA-
--   - nuevas columnas de reserva: origen, idioma, token de verificación (QR),
--     condiciones de pago, total de la estancia y marcas de tiempo
--   - pagos registrados por los administradores (booking_payments)
--   - bloqueo de cruces de fechas entre reservas confirmadas del mismo apartamento
--   - permisos: los administradores crean y editan reservas desde el panel

-- ---------------------------------------------------------------------------
-- Prefijo de los localizadores: ENA- (Euronest Apartamentos)
-- Al aplicar esto solo existen las reservas de ejemplo (VRY-EJ001...), que se
-- renombran a ENA-EJ001...; no se ha emitido ningún código real con VRY-.
-- ---------------------------------------------------------------------------

alter table public.bookings
  drop constraint bookings_booking_code_check;

update public.bookings
set booking_code = 'ENA-' || substr(booking_code, 5)
where booking_code like 'VRY-%';

alter table public.bookings
  add constraint bookings_booking_code_check
  check (booking_code ~ '^ENA-[A-Z0-9]{5}$');

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------

-- Desde dónde se creó la reserva.
create type public.booking_source as enum ('web', 'panel');

-- Qué dice el voucher mientras no haya pagos: "Pendiente de pago" o "Pago al llegar".
create type public.payment_terms as enum ('pendiente', 'al_llegar');

create type public.payment_method as enum ('efectivo', 'transferencia', 'tarjeta', 'bizum', 'otro');

-- ---------------------------------------------------------------------------
-- Columnas nuevas de bookings
-- ---------------------------------------------------------------------------

alter table public.bookings
  -- source, created_by y created_at los fija el trigger: no se pueden falsear.
  add column source public.booking_source not null default 'web',
  -- Administrador que creó la reserva desde el panel; null si llegó por la web.
  add column created_by uuid
    references auth.users (id) on delete set null,
  -- Idioma del huésped, para el correo y el voucher.
  add column locale text not null default 'es'
    check (locale in ('es', 'en')),
  -- Secreto de 128 bits para el enlace del QR (/verificar/<token>). El localizador
  -- solo no sirve: es corto y se podría adivinar.
  add column verification_token text not null unique
    default encode(extensions.gen_random_bytes(16), 'hex')
    check (verification_token ~ '^[0-9a-f]{32}$'),
  add column payment_terms public.payment_terms not null default 'pendiente',
  -- Precio total de la estancia en euros. Se propone precio × noches y el
  -- administrador puede ajustarlo. null = sin definir.
  add column total_amount numeric(10, 2)
    check (total_amount >= 0),
  -- Lo mantiene el trigger: fecha de la última confirmación; null si no está confirmada.
  add column confirmed_at timestamptz,
  -- Solo la escribe el servidor (clave secreta) al enviar el correo de confirmación.
  add column confirmation_email_sent_at timestamptz,
  add column updated_at timestamptz not null default now();

-- Una reserva confirmada tiene que estar asociada a un apartamento. Consecuencia:
-- borrar un apartamento con reservas confirmadas falla (el "on delete set null"
-- de apartment_id incumpliría esta regla, error 23514); el panel debe explicarlo.
alter table public.bookings
  add constraint bookings_confirmed_requires_apartment
  check (status <> 'Confirmada' or apartment_id is not null);

-- Total propuesto para las reservas que ya existen (solo datos de ejemplo).
update public.bookings b
set total_amount = a.price * (b.check_out - b.check_in)
from public.apartments a
where a.id = b.apartment_id
  and b.total_amount is null;

-- Campos que calcula la base de datos para que no dependan del código ni se
-- puedan falsear:
--   - al crear: created_at = ahora, created_by = usuario de la sesión y
--     source = 'panel' si hay sesión o 'web' si no (formulario público, que
--     inserta con la clave secreta y sin sesión)
--   - al editar: created_at, created_by y source no cambian
--   - siempre: updated_at y confirmed_at
create function private.bookings_before_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.created_by := auth.uid();
    new.source := case when auth.uid() is null then 'web' else 'panel' end;
  else
    new.created_at := old.created_at;
    new.created_by := old.created_by;
    new.source := old.source;
  end if;

  new.updated_at := now();

  if new.status = 'Confirmada' then
    if tg_op = 'INSERT' or old.status is distinct from 'Confirmada' then
      new.confirmed_at := now();
    end if;
  else
    new.confirmed_at := null;
  end if;

  return new;
end;
$$;

create trigger bookings_before_write
  before insert or update on public.bookings
  for each row execute function private.bookings_before_write();

-- ---------------------------------------------------------------------------
-- Disponibilidad: no puede haber dos reservas confirmadas del mismo apartamento
-- con fechas que se crucen. Las fechas son [entrada, salida): salir y entrar el
-- mismo día no es un cruce. Las solicitudes Pendiente/Cancelada no bloquean.
-- Si se incumple, Postgres devuelve el error 23P01 (exclusion_violation).
-- ---------------------------------------------------------------------------

create extension if not exists btree_gist with schema extensions;

alter table public.bookings
  add constraint bookings_no_overlap_confirmed
  exclude using gist (
    apartment_id with =,
    daterange(check_in, check_out, '[)') with &&
  )
  where (status = 'Confirmada');

-- ---------------------------------------------------------------------------
-- Pagos: solo se registran o se borran; no se editan. Para corregir uno, se
-- borra y se registra de nuevo.
-- ---------------------------------------------------------------------------

create table public.booking_payments (
  id          uuid primary key default gen_random_uuid(),
  booking_id  uuid not null
              references public.bookings (id) on delete cascade,
  amount      numeric(10, 2) not null check (amount > 0),        -- euros
  paid_on     date not null
              check (paid_on between date '2020-01-01' and date '2100-12-31'),
  method      public.payment_method not null,
  note        text check (char_length(note) <= 500),
  -- Los fija el trigger: administrador que lo registró y momento del registro.
  created_by  uuid
              references auth.users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index booking_payments_booking_id_idx on public.booking_payments (booking_id);

create function private.booking_payments_before_insert()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.created_by := auth.uid();
  new.created_at := now();
  return new;
end;
$$;

create trigger booking_payments_before_insert
  before insert on public.booking_payments
  for each row execute function private.booking_payments_before_insert();

alter table public.booking_payments enable row level security;

revoke all on public.booking_payments from anon, authenticated;
grant select, insert, delete on public.booking_payments to authenticated;

create policy "Admins leen pagos"
  on public.booking_payments for select
  to authenticated
  using ((select private.is_admin()));

create policy "Admins registran pagos"
  on public.booking_payments for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "Admins borran pagos"
  on public.booking_payments for delete
  to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Permisos de bookings para el panel
-- Antes los administradores solo podían cambiar el estado. Ahora también crean
-- reservas y corrigen datos del huésped, fechas, apartamento y condiciones de pago.
-- No pueden tocar: id, booking_code, booking_pin, verification_token, source,
-- created_at, created_by, confirmed_at, updated_at ni confirmation_email_sent_at
-- (esta última la escribe solo el servidor con la clave secreta).
-- ---------------------------------------------------------------------------

grant insert on public.bookings to authenticated;

create policy "Admins crean reservas"
  on public.bookings for insert
  to authenticated
  with check ((select private.is_admin()));

revoke update on public.bookings from authenticated;
grant update (
  status,
  user_name, user_email, user_phone, user_country, guests, message, locale,
  check_in, check_out,
  apartment_id, apartment_name, city_name,
  payment_terms, total_amount
) on public.bookings to authenticated;

-- La política de update existente ("Admins cambian el estado de reservas") ya
-- limita las filas a los administradores; solo cambia su nombre.
alter policy "Admins cambian el estado de reservas"
  on public.bookings
  rename to "Admins editan reservas";
