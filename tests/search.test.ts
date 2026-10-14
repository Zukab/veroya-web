import { describe, expect, it } from "vitest";
import { parseSearchParams, searchNights, searchQueryString } from "@/lib/search";

const TODAY = "2026-10-13";
const parse = (params: Record<string, string>) => parseSearchParams((name) => params[name], TODAY);

describe("parseSearchParams (buscador)", () => {
  it("lee una búsqueda completa y válida", () => {
    expect(parse({ ciudad: "madrid", entrada: "2026-11-20", salida: "2026-11-23", huespedes: "2" })).toEqual({
      city: "madrid",
      checkIn: "2026-11-20",
      checkOut: "2026-11-23",
      guests: 2,
    });
  });

  it("ignora las fechas si la salida no es posterior a la entrada", () => {
    const search = parse({ entrada: "2026-11-23", salida: "2026-11-20" });
    expect(search.checkIn).toBeNull();
    expect(search.checkOut).toBeNull();
  });

  it("ignora las fechas pasadas y las de más de dos años", () => {
    expect(parse({ entrada: "2026-10-01", salida: "2026-10-05" }).checkIn).toBeNull();
    expect(parse({ entrada: "2029-01-01", salida: "2029-01-05" }).checkIn).toBeNull();
  });

  it("ignora fechas que no existen o mal escritas", () => {
    expect(parse({ entrada: "2026-02-30", salida: "2026-03-02" }).checkIn).toBeNull();
    expect(parse({ entrada: "20/11/2026", salida: "23/11/2026" }).checkIn).toBeNull();
  });

  it("solo acepta un número de huéspedes razonable", () => {
    expect(parse({ huespedes: "0" }).guests).toBeNull();
    expect(parse({ huespedes: "17" }).guests).toBeNull();
    expect(parse({ huespedes: "2.5" }).guests).toBeNull();
    expect(parse({ huespedes: "16" }).guests).toBe(16);
  });

  it("solo acepta identificadores de ciudad válidos", () => {
    expect(parse({ ciudad: "Madrid!" }).city).toBeNull();
    expect(parse({ ciudad: "san-sebastian" }).city).toBe("san-sebastian");
  });
});

describe("searchNights y searchQueryString", () => {
  it("cuenta las noches", () => {
    expect(searchNights(parse({ entrada: "2026-12-27", salida: "2027-01-02" }))).toBe(6);
    expect(searchNights(parse({}))).toBeNull();
  });

  it("conserva la búsqueda en los enlaces", () => {
    const search = parse({ ciudad: "lisboa", entrada: "2027-01-15", salida: "2027-01-22", huespedes: "2" });
    expect(searchQueryString(search)).toBe("?entrada=2027-01-15&salida=2027-01-22&huespedes=2");
    expect(searchQueryString(search, { withCity: true })).toBe(
      "?ciudad=lisboa&entrada=2027-01-15&salida=2027-01-22&huespedes=2",
    );
    expect(searchQueryString(parse({}))).toBe("");
  });
});
