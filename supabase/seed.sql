-- Datos de ejemplo SOLO para desarrollo y pruebas.
-- Se identifican por:
--   - ciudades y apartamentos con slug/id que empieza por "ejemplo-"
--   - reservas con correos @example.com y códigos VRY-EJ...
-- Se borran con supabase/cleanup-seed.sql antes del lanzamiento.
--
-- Cargar en el proyecto enlazado:
--   npx supabase db query --linked -f supabase/seed.sql
-- Se puede ejecutar varias veces: lo que ya existe no se duplica.

begin;

-- ---------------------------------------------------------------------------
-- Ciudades
-- ---------------------------------------------------------------------------
insert into public.cities (slug, name, image_url, description) values
  ('ejemplo-madrid', 'Madrid', null,
   '[Ejemplo] Texto provisional sobre Madrid: museos, parques y barrios con mucha vida.'),
  ('ejemplo-barcelona', 'Barcelona', null,
   '[Ejemplo] Texto provisional sobre Barcelona: playa, arquitectura y gastronomía.'),
  ('ejemplo-valencia', 'Valencia', null,
   '[Ejemplo] Texto provisional sobre Valencia: el Turia, la Ciudad de las Artes y la Malvarrosa.'),
  ('ejemplo-malaga', 'Málaga', null,
   '[Ejemplo] Texto provisional sobre Málaga: sol todo el año, centro histórico y costa.')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Apartamentos (sin fotos: la web muestra un marcador hasta que se suban)
-- ---------------------------------------------------------------------------
insert into public.apartments
  (id, city_slug, name, price, rooms, baths, size, max_guests, rating, reviews,
   min_nights, neighborhood, description, images, amenities)
values
  ('ejemplo-madrid-loft-malasana', 'ejemplo-madrid',
   'Loft luminoso en Malasaña', 120, 1, 1, 55, 2, 4.86, 74, 2, 'Malasaña',
   '[Ejemplo] Loft reformado con techos altos, cerca de cafés y tiendas independientes.',
   '{}', array['wifi', 'air_conditioning', 'heating', 'kitchen', 'washer']),

  ('ejemplo-madrid-familiar-retiro', 'ejemplo-madrid',
   'Piso familiar junto al Retiro', 165, 3, 2, 110, 6, 4.72, 41, 3, 'Retiro',
   '[Ejemplo] Piso amplio para familias, a cinco minutos andando del parque del Retiro.',
   '{}', array['wifi', 'air_conditioning', 'heating', 'kitchen', 'washer', 'elevator', 'crib']),

  ('ejemplo-barcelona-gracia', 'ejemplo-barcelona',
   'Apartamento con balcón en Gràcia', 140, 2, 1, 70, 4, 4.91, 128, 3, 'Gràcia',
   '[Ejemplo] Apartamento con balcón a una calle tranquila, junto a las plazas de Gràcia.',
   '{}', array['wifi', 'air_conditioning', 'kitchen', 'balcony', 'washer']),

  ('ejemplo-barcelona-barceloneta', 'ejemplo-barcelona',
   'Estudio a un paso de la playa', 110, 1, 1, 38, 2, 4.65, 56, 2, 'Barceloneta',
   '[Ejemplo] Estudio compacto y práctico a dos minutos de la playa.',
   '{}', array['wifi', 'air_conditioning', 'kitchen']),

  ('ejemplo-valencia-ruzafa', 'ejemplo-valencia',
   'Piso de diseño en Ruzafa', 95, 2, 1, 80, 4, 4.80, 63, 2, 'Ruzafa',
   '[Ejemplo] Piso decorado con estilo en el barrio más animado de Valencia.',
   '{}', array['wifi', 'air_conditioning', 'heating', 'kitchen', 'workspace']),

  -- Apartamento nuevo, todavía sin valoraciones (rating null)
  ('ejemplo-valencia-malvarrosa', 'ejemplo-valencia',
   'Ático con terraza en la Malvarrosa', 130, 2, 2, 90, 5, null, 0, 3, 'Malvarrosa',
   '[Ejemplo] Ático con gran terraza y vistas al mar, recién incorporado.',
   '{}', array['wifi', 'air_conditioning', 'terrace', 'sea_view', 'elevator', 'parking']),

  ('ejemplo-malaga-centro', 'ejemplo-malaga',
   'Apartamento en el centro histórico', 100, 1, 1, 50, 3, 4.77, 92, 2, 'Centro histórico',
   '[Ejemplo] Apartamento en una calle peatonal, cerca de la catedral y del puerto.',
   '{}', array['wifi', 'air_conditioning', 'kitchen', 'washer']),

  -- Pensado para estancias largas (mínimo 30 noches)
  ('ejemplo-malaga-estancia-larga', 'ejemplo-malaga',
   'Apartamento para estancias largas en El Limonar', 70, 2, 1, 75, 3, 4.90, 18, 30, 'El Limonar',
   '[Ejemplo] Apartamento tranquilo con espacio de trabajo, ideal para meses de estancia.',
   '{}', array['wifi', 'air_conditioning', 'heating', 'kitchen', 'washer', 'workspace', 'terrace'])
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Reservas: los tres estados, dos que se solapan en el mismo apartamento y
-- una de un apartamento que ya no existe (apartment_id null).
-- ---------------------------------------------------------------------------
insert into public.bookings
  (booking_code, booking_pin, created_at, status, user_name, user_email, user_phone,
   user_country, guests, check_in, check_out, city_name, apartment_id, apartment_name, message)
values
  ('VRY-EJ001', '4821', now() - interval '1 hour', 'Pendiente',
   'Ana García', 'ana.garcia@example.com', '+34 600 000 001', 'España', 2,
   '2026-11-20', '2026-11-23', 'Madrid', 'ejemplo-madrid-loft-malasana', 'Loft luminoso en Malasaña',
   '¿Se puede hacer el check-in a partir de las 22:00?'),

  -- Se solapa con VRY-EJ001 en el mismo apartamento (permitido a propósito)
  ('VRY-EJ002', '1937', now() - interval '3 hours', 'Pendiente',
   'John Smith', 'john.smith@example.com', '+44 7700 900001', 'Reino Unido', 2,
   '2026-11-21', '2026-11-24', 'Madrid', 'ejemplo-madrid-loft-malasana', 'Loft luminoso en Malasaña',
   null),

  ('VRY-EJ003', '5502', now() - interval '2 days', 'Confirmada',
   'Lena Müller', 'lena.mueller@example.com', '+49 151 00000001', 'Alemania', 4,
   '2026-12-27', '2027-01-02', 'Barcelona', 'ejemplo-barcelona-gracia', 'Apartamento con balcón en Gràcia',
   'Viajamos con un bebé, ¿hay cuna disponible?'),

  ('VRY-EJ004', '7710', now() - interval '5 days', 'Confirmada',
   'Marie Dubois', 'marie.dubois@example.com', '+33 6 00 00 00 01', 'Francia', 3,
   '2027-02-01', '2027-03-01', 'Málaga', 'ejemplo-malaga-estancia-larga', 'Apartamento para estancias largas en El Limonar',
   'Estancia de un mes por trabajo.'),

  ('VRY-EJ005', '2468', now() - interval '8 days', 'Cancelada',
   'Carlos Pérez', 'carlos.perez@example.com', '+34 600 000 005', 'España', 2,
   '2026-11-14', '2026-11-16', 'Valencia', 'ejemplo-valencia-ruzafa', 'Piso de diseño en Ruzafa',
   null),

  ('VRY-EJ006', '3090', now() - interval '12 days', 'Cancelada',
   'Laura Martín', 'laura.martin@example.com', '+34 600 000 006', 'España', 1,
   '2026-10-30', '2026-11-02', 'Valencia', null, 'Apartamento retirado (ejemplo)',
   'Reserva de un apartamento que ya no existe.')
on conflict (booking_code) do nothing;

commit;
