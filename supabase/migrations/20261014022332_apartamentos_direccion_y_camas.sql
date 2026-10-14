-- Apartamentos: dirección y camas.
--
-- - address: dirección completa (calle, número, piso y código postal). Se muestra
--   en la web, con enlace a Google Maps, y en el voucher. Vacía en los apartamentos
--   que ya existían; el panel la exige al guardar.
-- - beds_double, beds_single, sofa_beds: número de camas de cada tipo, para la
--   ficha pública y el voucher.
--
-- Las comodidades nuevas (cafetera, ropa de cama, secador, caja fuerte, check-in
-- autónomo) no necesitan cambios aquí: son claves de src/lib/amenities.ts.

alter table public.apartments
  add column address     text not null default ''
                         check (char_length(address) <= 300),
  add column beds_double integer not null default 0
                         check (beds_double between 0 and 50),
  add column beds_single integer not null default 0
                         check (beds_single between 0 and 50),
  add column sofa_beds   integer not null default 0
                         check (sofa_beds between 0 and 50);
