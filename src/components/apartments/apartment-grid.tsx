import type { ApartmentCardData } from "@/lib/data/catalog";
import { ApartmentCard } from "./apartment-card";

const gridClasses = "grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3";

export function ApartmentGrid({
  apartments,
  showCity = true,
  query,
  nights,
}: {
  apartments: ApartmentCardData[];
  showCity?: boolean;
  query?: string;
  nights?: number | null;
}) {
  return (
    <ul className={gridClasses}>
      {apartments.map((apartment) => (
        <li key={apartment.id}>
          <ApartmentCard apartment={apartment} showCity={showCity} query={query} nights={nights} />
        </li>
      ))}
    </ul>
  );
}

// Marcador de carga con la misma forma que la cuadrícula.
export function ApartmentGridSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul aria-hidden="true" className={gridClasses}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="animate-pulse">
          <div className="aspect-4/3 rounded-2xl bg-sand-200" />
          <div className="mt-3 h-5 w-3/4 rounded bg-sand-200" />
          <div className="mt-2 h-4 w-1/2 rounded bg-sand-200" />
          <div className="mt-2 h-4 w-1/3 rounded bg-sand-200" />
        </li>
      ))}
    </ul>
  );
}
