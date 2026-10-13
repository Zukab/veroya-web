import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("HomePage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-24 text-center">
      <h1 className="font-serif text-4xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-stone-600">{t("subtitle")}</p>
    </main>
  );
}
