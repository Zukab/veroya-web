import { describe, expect, it } from "vitest";
import { accessEmail } from "@/lib/email/access-template";
import { confirmationEmail } from "@/lib/email/confirmation-template";
import type { VoucherData } from "@/lib/voucher/data";

// Solo los campos que usa el correo.
const data = {
  locale: "es",
  code: "ENA-AB12C",
  pin: "4821",
  guest: { fullName: "Ana López García", email: "ana@example.com", count: 2, companions: [] },
  checkIn: "2026-11-20",
  checkOut: "2026-11-23",
  apartment: { name: "Loft en Gràcia", city: "Barcelona", country: "España", address: "Carrer de Verdi 10" },
  verificationUrl: "https://euronestapartamentos.com/verificar/0123456789abcdef0123456789abcdef",
  settings: { check_in_time: "15:00", check_out_time: "11:00", phone: "+34 600 000 000", email: "hola@example.com" },
} as unknown as VoucherData;

describe("correo de confirmación", () => {
  it("incluye el localizador y el PIN", () => {
    const { html, text } = confirmationEmail(data);
    for (const body of [html, text]) {
      expect(body).toContain("ENA-AB12C");
      expect(body).toContain("4821");
    }
  });
});

describe("correo de datos de acceso", () => {
  const access = {
    locale: "es",
    code: "ENA-AB12C",
    pin: "4821",
    status: "Pendiente",
    guestName: "Ana López García",
    apartment: "",
    city: "Barcelona",
    checkIn: "2026-11-20",
    checkOut: "2026-11-23",
    verificationUrl: "https://euronestapartamentos.com/verificar/0123456789abcdef0123456789abcdef",
    settings: { phone: "+34 600 000 000", email: "hola@example.com", whatsapp: "" },
  } as const;

  it("incluye el localizador, el PIN y el estado en cualquier estado", () => {
    for (const status of ["Pendiente", "Confirmada", "Cancelada"] as const) {
      const { text } = accessEmail({ ...access, status });
      expect(text).toContain("ENA-AB12C");
      expect(text).toContain("4821");
    }
    expect(accessEmail(access).text).toContain("Pendiente de confirmar");
    expect(accessEmail({ ...access, locale: "en", status: "Cancelada" }).text).toContain("Cancelled");
  });
});
