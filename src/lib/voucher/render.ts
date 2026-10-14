import "server-only";
import path from "node:path";
import { Font, renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { siteUrl } from "@/lib/site-url";
import type { VoucherData } from "./data";
import { VoucherDocument } from "./document";

// Fuentes de la web (Fraunces y Geist, licencia OFL en fonts/). Se leen del disco:
// next.config.ts las incluye en el despliegue de las rutas /admin/reservas.
const fontsDir = path.join(process.cwd(), "src/lib/voucher/fonts");
const font = (file: string) => path.join(fontsDir, file);

Font.register({
  family: "Geist",
  fonts: [
    { src: font("Geist-Regular.ttf"), fontWeight: 400 },
    { src: font("Geist-Medium.ttf"), fontWeight: 500 },
    { src: font("Geist-SemiBold.ttf"), fontWeight: 600 },
  ],
});
Font.register({ family: "Fraunces", fonts: [{ src: font("Fraunces-SemiBold.ttf"), fontWeight: 600 }] });
Font.register({ family: "GeistMono", fonts: [{ src: font("GeistMono-Medium.ttf"), fontWeight: 500 }] });
// Sin guiones de corte de palabra.
Font.registerHyphenationCallback((word) => [word]);

// PDF del voucher de una reserva.
export async function renderVoucherPdf(data: VoucherData) {
  const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 0,
    width: 480,
    color: { dark: "#1c1917", light: "#ffffff" },
  });
  const siteHost = new URL(siteUrl()).host;
  // VoucherDocument no usa hooks: se llama directamente para obtener el <Document>.
  return renderToBuffer(VoucherDocument({ data, qrDataUrl, siteHost }));
}

export function voucherFileName(code: string) {
  return `voucher-${code}.pdf`;
}
