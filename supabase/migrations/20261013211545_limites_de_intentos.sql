-- Límites de intentos por clave (por ejemplo, hash de la IP) sin servicios
-- exclusivos de Vercel, para que funcione igual en Cloudflare.
-- Usos previstos:
--   - formulario de reserva público: 30 envíos por hora y por IP
--   - consulta de reserva por localizador y PIN: por IP y por localizador
--
-- Solo el servidor (clave secreta, rol service_role) puede llamar a la función.
-- Nunca se guarda la IP en claro: el código guarda un hash.

create table private.rate_limit_hits (
  id         bigint generated always as identity primary key,
  bucket     text not null check (char_length(bucket) between 1 and 50),
  key_hash   text not null check (char_length(key_hash) between 1 and 128),
  created_at timestamptz not null default now()
);

create index rate_limit_hits_lookup_idx
  on private.rate_limit_hits (bucket, key_hash, created_at desc);
create index rate_limit_hits_created_at_idx
  on private.rate_limit_hits (created_at);

-- Defensa extra: aunque el esquema private no está expuesto por la API, sin
-- políticas nadie puede leer ni escribir la tabla salvo su propietario.
alter table private.rate_limit_hits enable row level security;
revoke all on private.rate_limit_hits from public, anon, authenticated;

-- Registra un intento y devuelve true si está dentro del límite (p_max intentos
-- en los últimos p_window_seconds) o false si lo supera. Los intentos rechazados
-- no se registran. Borra de paso los registros de más de un día.
create function public.check_rate_limit(
  p_bucket text,
  p_key_hash text,
  p_max integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_max < 1 or p_window_seconds not between 1 and 86400 then
    raise exception 'Parámetros de límite no válidos';
  end if;

  -- Serializa las peticiones simultáneas de la misma clave para que no puedan
  -- superar el límite a la vez.
  perform pg_advisory_xact_lock(hashtextextended(p_bucket || ':' || p_key_hash, 0));

  delete from private.rate_limit_hits
  where created_at < now() - interval '1 day';

  select count(*) into v_count
  from private.rate_limit_hits
  where bucket = p_bucket
    and key_hash = p_key_hash
    and created_at > now() - make_interval(secs => p_window_seconds);

  if v_count >= p_max then
    return false;
  end if;

  insert into private.rate_limit_hits (bucket, key_hash)
  values (p_bucket, p_key_hash);

  return true;
end;
$$;

revoke execute on function public.check_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, text, integer, integer)
  to service_role;
