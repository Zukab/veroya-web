-- Comodidades: pasar de texto en español ("Wifi", "Aire acondicionado"...) a las
-- claves fijas definidas en src/lib/amenities.ts ("wifi", "air_conditioning"...).
-- La web traduce las claves con next-intl.
--
-- Solo cambia los textos que reconoce (sin distinguir mayúsculas ni espacios
-- sobrantes); cualquier otro valor se deja tal cual. Conserva el orden y quita
-- duplicados. Se puede ejecutar varias veces sin efecto adicional.

with map (label, key) as (
  values
    ('wifi', 'wifi'),
    ('aire acondicionado', 'air_conditioning'),
    ('calefacción', 'heating'),
    ('cocina equipada', 'kitchen'),
    ('lavadora', 'washer'),
    ('lavavajillas', 'dishwasher'),
    ('televisión', 'tv'),
    ('ascensor', 'elevator'),
    ('cuna', 'crib'),
    ('balcón', 'balcony'),
    ('terraza', 'terrace'),
    ('vistas al mar', 'sea_view'),
    ('piscina', 'pool'),
    ('parking', 'parking'),
    ('escritorio para trabajar', 'workspace'),
    ('se admiten mascotas', 'pets_allowed')
),
converted as (
  select a.id,
         coalesce(
           array_agg(t.value order by t.first_ord) filter (where t.value is not null),
           '{}'
         ) as amenities
  from public.apartments a
  left join lateral (
    select coalesce(m.key, x.label) as value, min(x.ord) as first_ord
    from unnest(a.amenities) with ordinality as x (label, ord)
    left join map m on m.label = lower(btrim(x.label))
    group by coalesce(m.key, x.label)
  ) t on true
  group by a.id
)
update public.apartments a
set amenities = c.amenities
from converted c
where a.id = c.id
  and a.amenities is distinct from c.amenities;
