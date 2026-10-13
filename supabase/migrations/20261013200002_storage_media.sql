-- Bucket público "media" para las fotos de ciudades y apartamentos.
-- Al ser público, cualquiera puede ver las fotos por su URL; subir, reemplazar
-- y borrar queda limitado a los administradores.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
);

-- Listar y leer metadatos de objetos (necesario para reemplazar archivos).
create policy "Admins ven archivos de media"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'media' and (select private.is_admin()));

create policy "Admins suben archivos a media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and (select private.is_admin()));

create policy "Admins reemplazan archivos de media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and (select private.is_admin()))
  with check (bucket_id = 'media' and (select private.is_admin()));

create policy "Admins borran archivos de media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and (select private.is_admin()));
