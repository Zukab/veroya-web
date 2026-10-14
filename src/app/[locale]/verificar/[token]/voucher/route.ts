import { bookingIdByToken, loadVoucherData } from "@/lib/voucher/data";
import { pdfResponse, textResponse } from "@/lib/voucher/pdf-response";
import { renderVoucherPdf, voucherFileName } from "@/lib/voucher/render";

// Descarga pública del voucher desde la página del QR. El token (128 bits) da
// acceso, como a la propia página. Solo reservas confirmadas.
export async function GET(_request: Request, { params }: RouteContext<"/[locale]/verificar/[token]/voucher">) {
  const { locale, token } = await params;
  const id = await bookingIdByToken(token);
  const data = id ? await loadVoucherData(id) : null;
  if (!data) return textResponse("Not found", 404);
  if (data.status !== "Confirmada") return textResponse("Not confirmed", 409);

  data.locale = locale === "en" ? "en" : "es";
  return pdfResponse(await renderVoucherPdf(data), voucherFileName(data.code));
}
