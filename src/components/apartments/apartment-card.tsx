import Image from "next/image";
import { getFormatter, getTranslations } from "next-intl/server";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Link } from "@/i18n/navigation";
import type { ApartmentCardData } from "@/lib/data/catalog";
import { LONG_STAY_MIN_NIGHTS, priceFormat } from "@/lib/format";
import { Rating } from "./rating";

export async function ApartmentCard({
  apartment,
  showCity = true,
}: {
  apartment: ApartmentCardData;
  showCity?: boolean;
}) {
  const t = await getTranslations("Apartment");
  const format = await getFormatter();
  const cover = apartment.images[0];
  const location = [apartment.neighborhood, showCity ? apartment.city.name : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link href={`/apartamento/${apartment.id}`} className="group block">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-sand-100">
        {cover ? (
          <Image
            src={cover}
            alt={apartment.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PhotoPlaceholder />
        )}
        {apartment.min_nights >= LONG_STAY_MIN_NIGHTS && (
          <span className="absolute left-3 top-3 rounded-full bg-olive-600 px-2.5 py-1 text-xs font-medium text-white">
            {t("longStay")}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-start justify-between gap-3">
        <h3 className="font-medium leading-snug text-ink transition-colors group-hover:text-terracotta-700">
          {apartment.name}
        </h3>
        <Rating rating={apartment.rating} reviews={apartment.reviews} />
      </div>
      {location && <p className="mt-0.5 text-sm text-stone-600">{location}</p>}
      <p className="text-sm text-stone-600">
        {t("rooms", { count: apartment.rooms })} · {t("guests", { count: apartment.max_guests })}
      </p>
      <p className="mt-1.5">
        <span className="font-semibold">{format.number(apartment.price, priceFormat)}</span>{" "}
        <span className="text-sm text-stone-600">{t("perNight")}</span>
      </p>
    </Link>
  );
}
