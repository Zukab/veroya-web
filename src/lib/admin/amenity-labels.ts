import messages from "../../../messages/es.json";
import type { AmenityKey } from "@/lib/amenities";

// Nombres en español de las comodidades para el panel (que no usa next-intl).
export const amenityLabels: Record<AmenityKey, string> = messages.Amenities;
