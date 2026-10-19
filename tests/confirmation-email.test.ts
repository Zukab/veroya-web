import { describe, expect, it } from "vitest";
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
