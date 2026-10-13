import type { CityWithCount } from "@/lib/data/catalog";
import { CityCard } from "./city-card";

export function CityGrid({ cities }: { cities: CityWithCount[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
      {cities.map((city) => (
        <li key={city.slug}>
          <CityCard city={city} />
        </li>
      ))}
    </ul>
  );
}
