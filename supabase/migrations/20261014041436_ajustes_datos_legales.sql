-- Datos del titular de la web para el aviso legal y la política de privacidad
-- (/aviso-legal, /privacidad). Los rellena el cliente en /admin/ajustes; mientras
-- estén vacíos, esas páginas muestran solo el nombre comercial y el contacto.
--   - legal_name: nombre completo o razón social
--   - tax_id: identificación fiscal (NIF en España, NIT/cédula en Colombia…)
--   - legal_address: domicilio del titular

alter table public.agency_settings
  add column legal_name    text not null default ''
                           check (char_length(legal_name) <= 150),
  add column tax_id        text not null default ''
                           check (char_length(tax_id) <= 40),
  add column legal_address text not null default ''
                           check (char_length(legal_address) <= 300);

grant update (legal_name, tax_id, legal_address) on public.agency_settings to authenticated;
