-- ---------------------------------------------------------------------------
-- Coordenadas de cada apartamento para el mapa de la web y del voucher (pedido
-- del cliente, 2026-10-18). El panel las calcula a partir de la dirección al
-- guardar o las toma pegadas desde Google Maps. null = sin mapa.
-- ---------------------------------------------------------------------------

alter table public.apartments
  add column latitude double precision
    check (latitude between -90 and 90),
  add column longitude double precision
    check (longitude between -180 and 180),
  add constraint apartments_coordinates_pair
    check ((latitude is null) = (longitude is null));
