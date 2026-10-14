import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { LegalPage } from "@/components/content/legal-page";
import { cookiesPolicy } from "@/lib/legal/content";

async function load() {
  const lang = (await getLocale()) === "en" ? "en" : "es";
  return cookiesPolicy(lang);
}

export async function generateMetadata(): Promise<Metadata> {
  const document = await load();
  return { title: document.title };
}

export default async function Page() {
  return <LegalPage document={await load()} />;
}
