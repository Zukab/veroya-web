-- Borra los datos de ejemplo de supabase/seed.sql. Ejecutar antes del lanzamiento:
--   npx supabase db query --linked -f supabase/cleanup-seed.sql
--
-- Borra:
--   - reservas con correo @example.com (incluidas las de prueba hechas a mano)
--     y cualquier reserva hecha sobre un apartamento de ejemplo
--   - apartamentos cuyo id empieza por "ejemplo-"
--   - ciudades cuyo slug empieza por "ejemplo-"
--
-- Todo va en una transacción: si algo falla, no se borra nada. Por ejemplo, si
-- el cliente creó un apartamento real dentro de una ciudad de ejemplo, el borrado
-- de esa ciudad se bloquea y hay que mover antes el apartamento a otra ciudad.
--
-- No toca Storage: los apartamentos de ejemplo no tienen fotos. Si se les
-- subieron fotos durante las pruebas, se borran a mano en Storage → media.

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
  (select count(*) from public.cities where slug like 'ejemplo-%')        as ciudades_ejemplo,
  (select count(*) from public.apartments where id like 'ejemplo-%')      as apartamentos_ejemplo,
  (select count(*) from public.bookings where user_email ilike '%@example.com') as reservas_ejemplo;
