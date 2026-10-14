-- Ciudades de cualquier país: el cliente puede tener apartamentos fuera de España.
-- country: nombre del país en español (p. ej. "Francia"). El panel lo exige; las
-- ciudades que ya existían son todas de España.

alter table public.cities
  add column country text not null default ''
                     check (char_length(country) <= 80);

update public.cities
set country = 'España'
where country = '';
