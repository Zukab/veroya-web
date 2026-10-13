import { Star } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";

// Estrella con la valoración media; "Nuevo" si aún no tiene valoraciones.
export async function Rating({
  rating,
  reviews,
  showReviews = true,
}: {
  rating: number | null;
  reviews: number;
  showReviews?: boolean;
}) {
  const t = await getTranslations("Apartment");

  if (rating === null) {
    return (
      <span className="shrink-0 rounded-full bg-terracotta-50 px-2 py-0.5 text-xs font-medium text-terracotta-700">
        {t("new")}
      </span>
    );
  }

  const format = await getFormatter();
  const value = format.number(rating, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <span className="flex shrink-0 items-center gap-1 text-sm">
      <Star aria-hidden="true" className="size-4 fill-terracotta-600 text-terracotta-600" />
      <span className="sr-only">{t("ratingLabel", { rating: value })}</span>
      <span aria-hidden="true" className="font-medium">
        {value}
      </span>
      {showReviews && (
        <span className="text-stone-500">
          ({format.number(reviews)})
          <span className="sr-only"> {t("reviews", { count: reviews })}</span>
        </span>
      )}
    </span>
  );
}
