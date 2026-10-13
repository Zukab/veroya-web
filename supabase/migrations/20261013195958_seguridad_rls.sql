-- Seguridad: lista de administradores y Row Level Security.
--
-- Roles de Supabase:
--   anon          -> visitantes (clave publishable sin sesión)
--   authenticated -> cualquier usuario con sesión iniciada
--   service_role  -> clave secreta, solo en el servidor; ignora RLS
--
-- Estar autenticado no basta para escribir: además hay que estar en public.admins.

-- ---------------------------------------------------------------------------
-- Administradores
-- ---------------------------------------------------------------------------

-- Se gestiona desde el SQL Editor de Supabase, por ejemplo:
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'admin@ejemplo.com';
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;

-- Cada usuario solo puede ver su propia fila (para que la app compruebe si es admin).
create policy "Un usuario ve su propia fila de admin"
  on public.admins for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Esquema no expuesto por la API para funciones auxiliares de seguridad.
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- true si el usuario de la sesión está en public.admins.
-- security definer: consulta admins con los permisos del propietario de la función.
create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = (select auth.uid())
  );
$$;

revoke execute on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Ciudades: lectura pública, escritura solo administradores
-- ---------------------------------------------------------------------------

alter table public.cities enable row level security;

revoke all on public.cities from anon, authenticated;
grant select on public.cities to anon, authenticated;
grant insert, update, delete on public.cities to authenticated;

create policy "Lectura pública de ciudades"
  on public.cities for select
  to anon, authenticated
  using (true);

create policy "Admins crean ciudades"
  on public.cities for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "Admins editan ciudades"
  on public.cities for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins borran ciudades"
  on public.cities for delete
  to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Apartamentos: lectura pública, escritura solo administradores
-- ---------------------------------------------------------------------------

alter table public.apartments enable row level security;

revoke all on public.apartments from anon, authenticated;
grant select on public.apartments to anon, authenticated;
grant insert, update, delete on public.apartments to authenticated;

create policy "Lectura pública de apartamentos"
  on public.apartments for select
  to anon, authenticated
  using (true);

create policy "Admins crean apartamentos"
  on public.apartments for insert
  to authenticated
  with check ((select private.is_admin()));

create policy "Admins editan apartamentos"
  on public.apartments for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins borran apartamentos"
  on public.apartments for delete
  to authenticated
  using ((select private.is_admin()));

-- ---------------------------------------------------------------------------
-- Reservas: sin acceso público. Se crean desde el servidor con la clave
-- secreta (Server Action validada con zod). Los administradores pueden
-- leerlas, cambiar solo el estado y borrarlas.
-- ---------------------------------------------------------------------------

alter table public.bookings enable row level security;

revoke all on public.bookings from anon, authenticated;
grant select, delete on public.bookings to authenticated;
grant update (status) on public.bookings to authenticated;

create policy "Admins leen reservas"
  on public.bookings for select
  to authenticated
  using ((select private.is_admin()));

create policy "Admins cambian el estado de reservas"
  on public.bookings for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "Admins borran reservas"
  on public.bookings for delete
  to authenticated
  using ((select private.is_admin()));
