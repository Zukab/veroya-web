import { describe, expect, it } from "vitest";
import { adminBookingSchema } from "@/lib/admin/booking-schema";

const parseCompanions = (value: string) => adminBookingSchema.shape.companions.safeParse(value);

describe("acompañantes (panel)", () => {
  it("un nombre por línea, sin espacios ni líneas vacías", () => {
    expect(parseCompanions("  Ana López \r\n\nPedro Ruiz\n").data).toEqual(["Ana López", "Pedro Ruiz"]);
    expect(parseCompanions("").data).toEqual([]);
  });

  it("rechaza más de 20 o nombres demasiado largos", () => {
    expect(parseCompanions(Array.from({ length: 21 }, (_, i) => `Huésped ${i}`).join("\n")).success).toBe(false);
    expect(parseCompanions("a".repeat(121)).success).toBe(false);
  });
});
