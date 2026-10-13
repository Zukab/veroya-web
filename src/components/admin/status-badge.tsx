import type { Database } from "@/types/database";

type Status = Database["public"]["Enums"]["booking_status"];

const styles: Record<Status, string> = {
  Pendiente: "bg-amber-50 text-amber-800 ring-amber-200",
  Confirmada: "bg-olive-50 text-olive-700 ring-olive-600/30",
  Cancelada: "bg-stone-100 text-stone-600 ring-stone-300",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${styles[status]}`}>
      {status}
    </span>
  );
}
