import { requireAdmin } from "@/lib/auth/admin";
import { loadVoucherData } from "@/lib/voucher/data";
import { renderVoucherPdf, voucherFileName } from "@/lib/voucher/render";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Descarga del voucher en PDF desde la ficha de la reserva (solo administradores
// y solo reservas confirmadas).
export async function GET(_request: Request, { params }: RouteContext<"/admin/reservas/[id]/voucher">) {
  await requireAdmin();
  const { id } = await params;
  if (!UUID.test(id)) return text("Reserva no encontrada.", 404);

  const data = await loadVoucherData(id);
  if (!data) return text("Reserva no encontrada.", 404);
  if (data.status !== "Confirmada") {
    return text("Solo se puede descargar el voucher de una reserva confirmada.", 409);
  }

  const pdf = await renderVoucherPdf(data);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${voucherFileName(data.code)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

function text(message: string, status: number) {
  return new Response(message, { status, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
