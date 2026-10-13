import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Link } from "@/i18n/navigation";
import type { CityWithCount } from "@/lib/data/catalog";

export async function CityCard({ city }: { city: CityWithCount }) {
  const t = await getTranslations("Cities");

  return (
    <Link
      href={`/ciudades/${city.slug}`}
      className="group relative block aspect-3/4 overflow-hidden rounded-2xl bg-sand-100"
    >
      {city.image_url ? (
        <Image
          src={city.image_url}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <PhotoPlaceholder label={city.name} className="pb-16" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 via-black/30 to-transparent p-4 pt-16 text-white sm:p-5">
        <h3 className="font-serif text-xl font-semibold sm:text-2xl">{city.name}</h3>
        <p className="text-xs text-white/85 sm:text-sm">
          {t("apartmentsCount", { count: city.apartmentCount })}
        </p>
      </div>
    </Link>
  );
}
