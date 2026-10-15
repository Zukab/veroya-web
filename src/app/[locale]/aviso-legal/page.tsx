import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/components/content/legal-page";
import { legalNotice } from "@/lib/legal/content";
import { getLegalOwner } from "@/lib/legal/owner";
import { localeAlternates } from "@/lib/seo";

async function load() {
  const lang = (await getLocale()) === "en" ? "en" : "es";
  return legalNotice(lang, await getLegalOwner());
}

export async function generateMetadata(): Promise<Metadata> {
  const document = await load();
  return { title: document.title, alternates: await localeAlternates("/aviso-legal") };
}

export default async function Page() {
  return <LegalPage document={await load()} />;
}
