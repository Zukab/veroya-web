-- Conservación de datos (ver /privacidad): las solicitudes que no llegan a
-- confirmarse se borran automáticamente a los 12 meses.
--
-- Se borra una reserva si se cumple todo:
--   - no está Confirmada (Pendiente o Cancelada)
--   - se creó hace más de 12 meses
--   - su fecha de salida ya pasó
--   - no tiene pagos registrados (las que tienen pagos se conservan por las
--     obligaciones contables, aunque estén canceladas)
--
-- La ejecuta pg_cron el día 1 de cada mes a las 04:00 UTC.

create extension if not exists pg_cron with schema pg_catalog;

create function private.purge_old_requests()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted integer;
begin
  delete from public.bookings b
  where b.status <> 'Confirmada'
    and b.created_at < now() - interval '12 months'
    and b.check_out < current_date
    and not exists (
      select 1 from public.booking_payments p where p.booking_id = b.id
    );
  get diagnostics deleted = row_count;
  return deleted;
end;
$$;

revoke all on function private.purge_old_requests() from public, anon, authenticated;

select cron.schedule(
  'borrar-solicitudes-antiguas',
  '0 4 1 * *',
  $$select private.purge_old_requests()$$
);
