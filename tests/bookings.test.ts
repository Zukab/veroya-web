import { describe, expect, it } from "vitest";
import { generateBookingCode, generateBookingPin, normalizeBookingCode } from "@/lib/bookings/codes";
import { addDays, nightsBetween, todayInAgency } from "@/lib/bookings/dates";
import { generalRequestSchema, publicBookingSchema, publicStayErrors } from "@/lib/bookings/schema";

const TODAY = "2026-10-13";

const guest = {
  user_name: "Laura Martín",
  user_email: "laura@example.com",
  user_phone: "+34 600 000 001",
  user_country: "España",
  guests: "2",
  check_in: "2026-11-20",
  check_out: "2026-11-23",
  message: "",
  locale: "es",
};

describe("localizador y PIN", () => {
  it("genera localizadores ENA-XXXXX y PIN de 4 cifras", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateBookingCode()).toMatch(/^ENA-[A-Z0-9]{5}$/);
      expect(generateBookingPin()).toMatch(/^\d{4}$/);
    }
  });

  it("entiende el localizador escrito de varias formas", () => {
    expect(normalizeBookingCode("ENA-7K2QM")).toBe("ENA-7K2QM");
    expect(normalizeBookingCode("ena-7k2qm")).toBe("ENA-7K2QM");
    expect(normalizeBookingCode(" ena 7k2qm ")).toBe("ENA-7K2QM");
    expect(normalizeBookingCode("7K2QM")).toBe("ENA-7K2QM");
    expect(normalizeBookingCode("ENA-7K2")).toBeNull();
    expect(normalizeBookingCode("")).toBeNull();
  });
});

describe("fechas", () => {
  it("el día de hoy es el de Colombia (zona de la agencia)", () => {
    // 22:47 del 14 de octubre en Bogotá = 03:47 del 15 en UTC (05:47 en España).
    expect(todayInAgency(new Date("2026-10-15T03:47:00Z"))).toBe("2026-10-14");
    expect(todayInAgency(new Date("2026-10-15T12:00:00Z"))).toBe("2026-10-15");
  });

  it("cuenta noches y suma días, también cambiando de año", () => {
    expect(nightsBetween("2026-12-27", "2027-01-02")).toBe(6);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("formularios públicos", () => {
  it("exige aceptar la política de privacidad", () => {
    const sin = publicBookingSchema.safeParse({ ...guest, apartment_id: "ejemplo-madrid" });
    expect(sin.success).toBe(false);
    expect(sin.error?.issues.some((issue) => issue.path[0] === "privacy")).toBe(true);

    const con = publicBookingSchema.safeParse({ ...guest, apartment_id: "ejemplo-madrid", privacy: "yes" });
    expect(con.success).toBe(true);
  });

  it("la solicitud general pide ciudad y privacidad", () => {
    expect(generalRequestSchema.safeParse({ ...guest, city: "", privacy: "yes" }).success).toBe(false);
    expect(generalRequestSchema.safeParse({ ...guest, city: "lisboa", privacy: "yes" }).success).toBe(true);
  });

  it("rechaza correos y teléfonos no válidos", () => {
    const bad = publicBookingSchema.safeParse({
      ...guest,
      apartment_id: "x",
      privacy: "yes",
      user_email: "no-es-un-correo",
      user_phone: "abc",
    });
    const fields = bad.error?.issues.map((issue) => issue.path[0]);
    expect(fields).toContain("user_email");
    expect(fields).toContain("user_phone");
  });
});

describe("reglas del apartamento (publicStayErrors)", () => {
  const apartment = { min_nights: 3, max_guests: 2 };
  const stay = (checkIn: string, checkOut: string, guests = 2) =>
    publicStayErrors({ check_in: checkIn, check_out: checkOut, guests }, apartment, TODAY);

  it("acepta una estancia que cumple las reglas", () => {
    expect(stay("2026-11-20", "2026-11-23")).toEqual({});
  });

  it("rechaza menos noches de las mínimas y más huéspedes de los permitidos", () => {
    expect(stay("2026-11-20", "2026-11-22").check_out?.key).toBe("minNights");
    expect(stay("2026-11-20", "2026-11-23", 3).guests?.key).toBe("maxGuests");
  });

  it("rechaza entradas pasadas o salidas antes de la entrada", () => {
    expect(stay("2026-10-01", "2026-10-05").check_in?.key).toBe("checkInPast");
    expect(stay("2026-11-23", "2026-11-20").check_out?.key).toBe("checkOutBeforeCheckIn");
  });
});
