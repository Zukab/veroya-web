"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { adminBookingSchema, paymentSchema, spanishFieldErrors } from "@/lib/admin/booking-schema";
import { type AdminFormState, adminFieldErrors, errorState } from "@/lib/admin/form";
import { formatDate } from "@/lib/admin/format";
import { requireAdmin } from "@/lib/auth/admin";
import {
  MAX_CODE_ATTEMPTS,
  generateBookingCode,
  generateBookingPin,
  isDuplicateBookingCode,
} from "@/lib/bookings/codes";
import { nightsBetween } from "@/lib/bookings/dates";
import { stayDateErrors } from "@/lib/bookings/schema";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

const GENERIC_ERROR = "No se pudo guardar. Inténtalo de nuevo en unos minutos.";
const CHECK_FIELDS_ERROR = "Revisa los campos marcados.";

function bookingFromForm(formData: FormData) {
  const field = (name: string) => formData.get(name) ?? "";
  return adminBookingSchema.safeParse({
    user_name: field("user_name"),
    user_email: field("user_email"),
    user_phone: field("user_phone"),
    user_country: field("user_country"),
    guests: field("guests"),
    check_in: field("check_in"),
    check_out: field("check_out"),
    message: field("message"),
    apartment_id: field("apartment_id"),
    status: field("status"),
    payment_terms: field("payment_terms"),
    locale: field("locale"),
    total_amount: field("total_amount"),
  });
}

// Mensaje claro cuando la base de datos rechaza el cruce de fechas (23P01).
async function overlapMessage(
  supabase: Client,
  booking: { apartment_id: string | null; check_in: string; check_out: string },
  excludeId?: string,
) {
  let query = supabase
    .from("bookings")
    .select("booking_code, check_in, check_out")
    .eq("status", "Confirmada")
    .eq("apartment_id", booking.apartment_id ?? "")
    .lt("check_in", booking.check_out)
    .gt("check_out", booking.check_in)
    .limit(1);
  if (excludeId) query = query.neq("id", excludeId);
  const { data } = await query;
  const other = data?.[0];

  return other
    ? `No se puede confirmar: las fechas se cruzan con la reserva confirmada ${other.booking_code} (${formatDate(other.check_in)} – ${formatDate(other.check_out)}) del mismo apartamento.`
    : "No se puede confirmar: las fechas se cruzan con otra reserva confirmada del mismo apartamento.";
}

// Errores de la base de datos que el panel explica.
async function databaseErrorState(
  supabase: Client,
  error: { code?: string; message?: string },
  booking: { apartment_id: string | null; check_in: string; check_out: string },
  excludeId?: string,
) {
  if (error.code === "23P01") return errorState(await overlapMessage(supabase, booking, excludeId));
  if (error.code === "23514" && error.message?.includes("bookings_confirmed_requires_apartment")) {
    return errorState(CHECK_FIELDS_ERROR, { apartment_id: "Una reserva confirmada necesita un apartamento." });
  }
  console.error("Panel: error al guardar reserva", error);
  return errorState(GENERIC_ERROR);
}

async function readApartment(supabase: Client, id: string) {
  const { data } = await supabase
    .from("apartments")
    .select("id, name, price, city:cities(name)")
    .eq("id", id)
    .maybeSingle();
  return data;
}

// Validación común de crear y editar.
function validate(formData: FormData) {
  const parsed = bookingFromForm(formData);
  if (!parsed.success) {
    return { error: errorState(CHECK_FIELDS_ERROR, adminFieldErrors(parsed.error)) } as const;
  }
  const booking = parsed.data;

  const dateErrors = stayDateErrors(booking.check_in, booking.check_out);
  if (Object.keys(dateErrors).length > 0) {
    return { error: errorState(CHECK_FIELDS_ERROR, spanishFieldErrors(dateErrors)) } as const;
  }
  if (booking.status === "Confirmada" && !booking.apartment_id) {
    return {
      error: errorState(CHECK_FIELDS_ERROR, { apartment_id: "Una reserva confirmada necesita un apartamento." }),
    } as const;
  }
  return { booking } as const;
}

export async function createBooking(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const result = validate(formData);
  if (result.error) return result.error;
  const booking = result.booking;

  const apartment = booking.apartment_id ? await readApartment(supabase, booking.apartment_id) : null;
  if (booking.apartment_id && !apartment) {
    return errorState(CHECK_FIELDS_ERROR, { apartment_id: "Ese apartamento ya no existe." });
  }

  for (let attempt = 1; attempt <= MAX_CODE_ATTEMPTS; attempt++) {
    // source, created_by y created_at los fija la base de datos (trigger).
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        ...booking,
        booking_code: generateBookingCode(),
        booking_pin: generateBookingPin(),
        apartment_name: apartment?.name ?? "",
        city_name: apartment?.city.name ?? "",
        total_amount:
          booking.total_amount ??
          (apartment ? apartment.price * nightsBetween(booking.check_in, booking.check_out) : null),
      })
      .select("id")
      .single();

    if (!error) redirect(`/admin/reservas/${data.id}?creada=1`);
    if (!isDuplicateBookingCode(error)) return databaseErrorState(supabase, error, booking);
  }

  console.error(`Panel: ${MAX_CODE_ATTEMPTS} localizadores repetidos seguidos`);
  return errorState(GENERIC_ERROR);
}

export async function updateBooking(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("booking_id") ?? "");
  const result = validate(formData);
  if (result.error) return result.error;
  const booking = result.booking;

  const { data: current, error: readError } = await supabase
    .from("bookings")
    .select("apartment_id")
    .eq("id", id)
    .maybeSingle();
  if (readError) return databaseErrorState(supabase, readError, booking, id);
  if (!current) return errorState("La reserva ya no existe.");

  // Al cambiar de apartamento se copian su nombre y su ciudad; si no, se conservan
  // los guardados (también si el apartamento se borró).
  let names = {};
  if (booking.apartment_id && booking.apartment_id !== current.apartment_id) {
    const apartment = await readApartment(supabase, booking.apartment_id);
    if (!apartment) return errorState(CHECK_FIELDS_ERROR, { apartment_id: "Ese apartamento ya no existe." });
    names = { apartment_name: apartment.name, city_name: apartment.city.name };
  }

  const { data: updated, error } = await supabase
    .from("bookings")
    .update({ ...booking, ...names })
    .eq("id", id)
    .select("id");
  if (error) return databaseErrorState(supabase, error, booking, id);
  if (!updated?.length) return errorState("La reserva ya no existe.");

  refresh();
  return { status: "success", message: "Cambios guardados." };
}

export async function deleteBooking(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("booking_id") ?? "");

  const { data, error } = await supabase.from("bookings").delete().eq("id", id).select("id");
  if (error) {
    console.error("Panel: error al borrar reserva", error);
    return errorState("No se pudo borrar. Inténtalo de nuevo en unos minutos.");
  }
  if (!data?.length) return errorState("La reserva ya no existe.");
  redirect("/admin/reservas?borrada=1");
}

// Pagos: solo se registran o se borran (la base de datos no permite editarlos).
export async function addPayment(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const parsed = paymentSchema.safeParse({
    booking_id: formData.get("booking_id"),
    amount: formData.get("amount") ?? "",
    paid_on: formData.get("paid_on") ?? "",
    method: formData.get("method") ?? "",
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return errorState(CHECK_FIELDS_ERROR, adminFieldErrors(parsed.error));

  const { error } = await supabase.from("booking_payments").insert(parsed.data);
  if (error) {
    console.error("Panel: error al registrar pago", error);
    return errorState(GENERIC_ERROR);
  }
  refresh();
  return { status: "success", message: "Pago registrado." };
}

export async function deletePayment(_previous: AdminFormState, formData: FormData): Promise<AdminFormState> {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("payment_id") ?? "");

  const { data, error } = await supabase.from("booking_payments").delete().eq("id", id).select("id");
  if (error) {
    console.error("Panel: error al borrar pago", error);
    return errorState("No se pudo borrar el pago.");
  }
  if (!data?.length) return errorState("El pago ya no existe.");
  refresh();
  return { status: "success", message: "Pago borrado." };
}
