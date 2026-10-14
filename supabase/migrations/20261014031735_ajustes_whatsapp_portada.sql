-- Ajustes de la agencia: número de WhatsApp (botón para escribir a la agencia en
-- la web) y foto de portada del inicio (fondo del buscador).
--   - whatsapp: con prefijo de país; vacío = no se muestran los botones.
--   - hero_image_url: URL del bucket media (carpeta portada/); null = sin foto.

alter table public.agency_settings
  add column whatsapp       text not null default ''
                            check (char_length(whatsapp) <= 40),
  add column hero_image_url text
                            check (char_length(hero_image_url) <= 500);

grant update (whatsapp, hero_image_url) on public.agency_settings to authenticated;

-- El cliente atiende por WhatsApp en el mismo teléfono de contacto.
update public.agency_settings
set whatsapp = phone
where whatsapp = '';
