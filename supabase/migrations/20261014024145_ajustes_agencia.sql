-- Ajustes de la agencia: datos que salen en el voucher y en el correo de
-- confirmación y que el cliente cambia desde el panel (/admin/ajustes).
--
-- Una sola fila (id = true). Lectura pública (son datos de contacto y normas que
-- se publican en el voucher); solo los administradores la editan. No se pueden
-- crear ni borrar filas desde la aplicación.

create table public.agency_settings (
  id                  boolean primary key default true check (id),
  phone               text not null default ''
                      check (char_length(phone) <= 40),
  email               text not null default ''
                      check (char_length(email) <= 254),
  check_in_time       time not null default '15:00',
  check_out_time      time not null default '11:00',
  -- Normas de la estancia: una por línea (el voucher las muestra como lista).
  house_rules         text not null default ''
                      check (char_length(house_rules) <= 2000),
  cancellation_policy text not null default ''
                      check (char_length(cancellation_policy) <= 2000)
);

alter table public.agency_settings enable row level security;

revoke all on public.agency_settings from anon, authenticated;
grant select on public.agency_settings to anon, authenticated;
grant update (
  phone, email, check_in_time, check_out_time, house_rules, cancellation_policy
) on public.agency_settings to authenticated;

create policy "Lectura pública de ajustes"
  on public.agency_settings for select
  to anon, authenticated
  using (true);

create policy "Admins editan ajustes"
  on public.agency_settings for update
  to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Datos iniciales que dio el cliente (2026-10-13). Las horas, las normas y la
-- cancelación son un punto de partida que el cliente ajusta desde el panel.
insert into public.agency_settings
  (id, phone, email, check_in_time, check_out_time, house_rules, cancellation_policy)
values (
  true,
  '+34 602 701 946',
  'reservaseuronest@gmail.com',
  '15:00',
  '11:00',
  E'Avísanos de tu hora de llegada; si llegas de noche, confírmanos antes el acceso.\n'
  'Respeta las normas de la comunidad y el descanso de los vecinos.\n'
  'No se permiten fiestas ni eventos.\n'
  'Cuida las instalaciones y el mobiliario.',
  'Si necesitas cancelar o cambiar tu reserva, escríbenos o llámanos lo antes posible. '
  'Te indicaremos las condiciones según la antelación con la que nos avises.'
)
on conflict (id) do nothing;
