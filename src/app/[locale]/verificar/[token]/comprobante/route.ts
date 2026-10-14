import { bookingIdByToken, loadVoucherData } from "@/lib/voucher/data";
import { pdfResponse, textResponse } from "@/lib/voucher/pdf-response";
import { receiptFileName, renderReceiptPdf } from "@/lib/voucher/render";

// Descarga pública del comprobante de pago desde la página del QR (con el token).
// Solo si hay pagos registrados.
export async function GET(_request: Request, { params }: RouteContext<"/[locale]/verificar/[token]/comprobante">) {
  const { locale, token } = await params;
  const id = await bookingIdByToken(token);
  const data = id ? await loadVoucherData(id) : null;
  if (!data) return textResponse("Not found", 404);
  if (data.payments.length === 0) return textResponse("No payments", 409);

  data.locale = locale === "en" ? "en" : "es";
  return pdfResponse(await renderReceiptPdf(data), receiptFileName(data.code, data.locale));
}
