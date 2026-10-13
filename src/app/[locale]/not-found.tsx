import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function NotFoundPage() {
  const t = useTranslations("NotFound");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="font-serif text-6xl text-terracotta-600">404</p>
      <h1 className="font-serif text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-stone-600">{t("description")}</p>
      <Link href="/" className={buttonClasses({ className: "mt-2" })}>
        {t("backHome")}
      </Link>
    </main>
  );
}
