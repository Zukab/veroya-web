import { requireAdmin } from "@/lib/auth/admin";
import { loadVoucherData } from "@/lib/voucher/data";
import { pdfResponse, textResponse } from "@/lib/voucher/pdf-response";
import { receiptFileName, renderReceiptPdf } from "@/lib/voucher/render";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Descarga del comprobante de pago desde la ficha de la reserva (solo si hay pagos).
export async function GET(_request: Request, { params }: RouteContext<"/admin/reservas/[id]/comprobante">) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID.test(id)) return textResponse("Reserva no encontrada.", 404);

  const data = await loadVoucherData(id);
  if (!data) return textResponse("Reserva no encontrada.", 404);
  if (data.payments.length === 0) return textResponse("La reserva no tiene pagos registrados.", 409);

  return pdfResponse(await renderReceiptPdf(data), receiptFileName(data.code, data.locale));
}
