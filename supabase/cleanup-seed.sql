-- Borra los datos de ejemplo. Ejecutar antes del lanzamiento:
--   npx supabase db query --linked -f supabase/cleanup-seed.sql
--
-- Los ejemplos se crearon desde el panel (ver "Datos de ejemplo" en CLAUDE.md).
-- Mejor borrar los apartamentos de ejemplo desde el panel: así se borran también
-- sus fotos de Storage. Este script es la alternativa rápida y NO borra fotos (se
-- quedan huérfanas en Storage → media/apartamentos; no afectan a la web).
--
-- Borra:
--   - reservas con correo @example.com y cualquier reserva de un apartamento de
--     ejemplo (incluida la de prueba con veroyaproyecto@gmail.com)
--   - apartamentos cuyo id empieza por "ejemplo-"
--   - ciudades cuyo slug empieza por "ejemplo-" (las actuales —Madrid, Barcelona,
--     París y Lisboa— son reales y no se borran)
--
-- Todo va en una transacción: si algo falla, no se borra nada.

begin;

delete from public.bookings
where user_email ilike '%@example.com'
   or apartment_id like 'ejemplo-%';

delete from public.apartments
where id like 'ejemplo-%';

delete from public.cities
where slug like 'ejemplo-%';

commit;

-- Comprobación: todo debe ser 0.
select
  (select count(*) from public.apartments where id like 'ejemplo-%')            as apartamentos_ejemplo,
  (select count(*) from public.bookings where user_email ilike '%@example.com') as reservas_ejemplo;
