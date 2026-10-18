-- ---------------------------------------------------------------------------
-- Acompañantes de la reserva (pedido del cliente, 2026-10-18): nombres del resto
-- de huéspedes, además del titular. Los añade el equipo desde el panel y salen
-- en el voucher y en la página de verificación. Sin documentos de identidad.
-- ---------------------------------------------------------------------------

alter table public.bookings
  add column companions text[] not null default '{}'
    constraint bookings_companions_check
    check (cardinality(companions) <= 20 and length(array_to_string(companions, '')) <= 2400);

grant update (companions) on public.bookings to authenticated;
