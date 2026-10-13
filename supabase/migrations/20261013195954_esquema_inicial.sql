-- Esquema inicial: ciudades, apartamentos y reservas.
-- Las restricciones CHECK son la última barrera; la validación principal se hace
-- con zod en el servidor.

-- Estados de una reserva
create type public.booking_status as enum ('Pendiente', 'Confirmada', 'Cancelada');

-- Ciudades
create table public.cities (
  slug        text primary key
              check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null
              check (char_length(name) between 1 and 100),
  image_url   text,
  description text not null default ''
              check (char_length(description) <= 5000),
  created_at  timestamptz not null default now()
);

-- Apartamentos
create table public.apartments (
  id           text primary key
               check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  -- Borrar una ciudad con apartamentos se bloquea (restrict).
  -- Cambiar el slug de una ciudad se propaga a sus apartamentos (cascade).
  city_slug    text not null
               references public.cities (slug) on update cascade on delete restrict,
  name         text not null
               check (char_length(name) between 1 and 150),
  price        integer not null check (price >= 0),          -- euros por noche
  rooms        integer not null default 1 check (rooms >= 0),
  baths        integer not null default 1 check (baths >= 0),
  size         integer check (size > 0),                      -- m²
  max_guests   integer not null default 2 check (max_guests between 1 and 50),
  rating       numeric(3, 2) check (rating between 0 and 5),  -- null = sin valoraciones
  reviews      integer not null default 0 check (reviews >= 0),
  min_nights   integer not null default 1 check (min_nights >= 1),
  neighborhood text not null default ''
               check (char_length(neighborhood) <= 150),
  description  text not null default ''
               check (char_length(description) <= 10000),
  images       text[] not null default '{}',                  -- URLs de Supabase Storage
  amenities    text[] not null default '{}',
  created_at   timestamptz not null default now()
);

create index apartments_city_slug_idx on public.apartments (city_slug);

-- Reservas
-- Sin restricción de cruce de fechas: pueden coincidir en el mismo apartamento.
create table public.bookings (
  id             uuid primary key default gen_random_uuid(),
  booking_code   text not null unique
                 check (booking_code ~ '^VRY-[A-Z0-9]{5}$'),
  booking_pin    text not null
                 check (booking_pin ~ '^[0-9]{4}$'),
  created_at     timestamptz not null default now(),
  status         public.booking_status not null default 'Pendiente',
  user_name      text not null
                 check (char_length(user_name) between 1 and 120),
  user_email     text not null
                 check (char_length(user_email) between 3 and 254 and user_email like '%_@_%'),
  user_phone     text not null
                 check (char_length(user_phone) between 5 and 40),
  user_country   text not null
                 check (char_length(user_country) between 2 and 80),
  guests         integer not null check (guests between 1 and 50),
  check_in       date not null,
  check_out      date not null,
  -- Copias del nombre de la ciudad y del apartamento en el momento de reservar,
  -- para conservar el historial aunque luego se editen o borren.
  city_name      text not null default ''
                 check (char_length(city_name) <= 100),
  apartment_id   text
                 references public.apartments (id) on update cascade on delete set null,
  apartment_name text not null default ''
                 check (char_length(apartment_name) <= 150),
  message        text
                 check (char_length(message) <= 2000),

  constraint bookings_check_out_after_check_in check (check_out > check_in),
  constraint bookings_reasonable_years check (
    check_in >= date '2020-01-01' and check_out <= date '2100-12-31'
  )
);

create index bookings_created_at_idx on public.bookings (created_at desc);
create index bookings_status_idx on public.bookings (status);
create index bookings_apartment_id_idx on public.bookings (apartment_id);
