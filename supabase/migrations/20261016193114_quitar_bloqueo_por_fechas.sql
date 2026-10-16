-- ---------------------------------------------------------------------------
-- Disponibilidad sin bloqueo (decisión del cliente, 2026-10-16): un apartamento
-- puede tener varias reservas confirmadas con fechas cruzadas (por ejemplo, si
-- tiene varias unidades iguales). El equipo lo organiza; el panel solo lo avisa.
-- Sustituye a la restricción bookings_no_overlap_confirmed de
-- 20261013211542_reservas_pagos_voucher.sql. La extensión btree_gist se queda.
-- ---------------------------------------------------------------------------

alter table public.bookings drop constraint bookings_no_overlap_confirmed;
