import {
  AirVent,
  ArrowUpDown,
  Baby,
  Bed,
  Coffee,
  CookingPot,
  Fence,
  Flame,
  KeyRound,
  Laptop,
  type LucideIcon,
  PawPrint,
  SquareParking,
  Sun,
  Tv,
  Utensils,
  Vault,
  WashingMachine,
  Waves,
  WavesLadder,
  Wifi,
  Wind,
} from "lucide-react";
import type { AmenityKey } from "@/lib/amenities";

const icons: Record<AmenityKey, LucideIcon> = {
  wifi: Wifi,
  air_conditioning: AirVent,
  heating: Flame,
  kitchen: CookingPot,
  coffee_maker: Coffee,
  washer: WashingMachine,
  dishwasher: Utensils,
  tv: Tv,
  bed_linen: Bed,
  hair_dryer: Wind,
  safe: Vault,
  self_check_in: KeyRound,
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
