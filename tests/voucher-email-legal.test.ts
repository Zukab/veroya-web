import { describe, expect, it } from "vitest";
import { escapeHtml, renderEmail } from "@/lib/email/layout";
import { cookiesPolicy, legalNotice, privacyPolicy } from "@/lib/legal/content";
import { fullAddress } from "@/lib/voucher/address";
import { abbreviateGuestName, firstName } from "@/lib/voucher/guest-name";

describe("nombre del titular en el voucher", () => {
  it("abrevia el nombre para no publicarlo completo", () => {
    expect(abbreviateGuestName("Laura Martín Gómez")).toBe("Laura Martín G.");
    expect(abbreviateGuestName("María José García López")).toBe("María José G. L.");
    expect(abbreviateGuestName("Juan de la Cruz")).toBe("Juan C.");
    expect(abbreviateGuestName("John Smith")).toBe("John S.");
    expect(abbreviateGuestName("  Ana  ")).toBe("Ana");
  });

  it("saca el nombre de pila para el saludo del correo", () => {
    expect(firstName("Laura Martín Gómez")).toBe("Laura");
  });
});

describe("dirección del voucher", () => {
  it("añade la ciudad y el país solo si faltan", () => {
    expect(fullAddress({ address: "Calle de Ejemplo 12, 28004 Madrid", city: "Madrid", country: "España" })).toBe(
      "Calle de Ejemplo 12, 28004 Madrid, España",
    );
    expect(fullAddress({ address: "Rua do Exemplo 15", city: "Lisboa", country: "Portugal" })).toBe(
      "Rua do Exemplo 15, Lisboa, Portugal",
    );
  });
});

describe("correos", () => {
  it("escapa el HTML de los datos que escribe el huésped", () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");

    const { html, text } = renderEmail({
      locale: "es",
      subject: "Asunto",
      preheader: "Pre",
      title: "Título",
      paragraphs: ["Hola, <b>Laura</b>"],
      detailsTitle: "Datos",
      rows: [["Localizador", "ENA-7K2QM"]],
      button: { label: "Ver", href: "https://ejemplo.test/verificar/abc" },
      note: "Nota",
      closing: ["Gracias"],
      contact: { phone: "+34 600", email: "a@b.c" },
    });
    expect(html).not.toContain("<b>Laura</b>");
    expect(html).toContain("&lt;b&gt;Laura&lt;/b&gt;");
    expect(text).toContain("Localizador: ENA-7K2QM");
  });
});

describe("textos legales", () => {
  const owner = { name: "", taxId: "", address: "", email: "reservas@example.com", phone: "+34 600" };

  it("sin datos del titular muestra solo el nombre comercial y el contacto", () => {
    const list = legalNotice("es", owner).sections[0].list ?? [];
    expect(list).toEqual(["Nombre comercial: Euronest Apartamentos", "Correo: reservas@example.com", "Teléfono: +34 600"]);
  });

  it("con datos del titular los incluye", () => {
    const list = privacyPolicy("es", { ...owner, name: "Titular S.A.S.", taxId: "900.000.000-1" }).sections[0].list;
    expect(list).toContain("Titular: Titular S.A.S.");
    expect(list).toContain("Identificación fiscal: 900.000.000-1");
  });

  it("existen en español y en inglés", () => {
    for (const locale of ["es", "en"] as const) {
      expect(legalNotice(locale, owner).sections.length).toBeGreaterThan(3);
      expect(privacyPolicy(locale, owner).sections.length).toBeGreaterThan(5);
      expect(cookiesPolicy(locale).sections.length).toBeGreaterThan(1);
    }
  });
});
