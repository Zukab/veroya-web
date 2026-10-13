import {
  AirVent,
  ArrowUpDown,
  Baby,
  CookingPot,
  Fence,
  Flame,
  Laptop,
  type LucideIcon,
  PawPrint,
  SquareParking,
  Sun,
  Tv,
  Utensils,
  WashingMachine,
  Waves,
  WavesLadder,
  Wifi,
} from "lucide-react";
import type { AmenityKey } from "@/lib/amenities";

const icons: Record<AmenityKey, LucideIcon> = {
  wifi: Wifi,
  air_conditioning: AirVent,
  heating: Flame,
  kitchen: CookingPot,
  washer: WashingMachine,
  dishwasher: Utensils,
  tv: Tv,
  elevator: ArrowUpDown,
  crib: Baby,
  balcony: Fence,
  terrace: Sun,
  sea_view: Waves,
  pool: WavesLadder,
  parking: SquareParking,
  workspace: Laptop,
  pets_allowed: PawPrint,
};

export function AmenityIcon({
  amenity,
  className = "size-5",
}: {
  amenity: AmenityKey;
  className?: string;
}) {
  const Icon = icons[amenity];
  return <Icon aria-hidden="true" className={className} strokeWidth={1.5} />;
}
