import type { Metadata } from "next";
import { fontVariables } from "../fonts";
import "../globals.css";

// Layout raíz del panel de administración: solo en español y fuera de los
// buscadores. Está fuera de [locale], así que no usa next-intl.
export const metadata: Metadata = {
  title: {
    default: "Panel · Euronest Apartamentos",
    template: "%s · Panel Euronest",
  },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return (
    <html lang="es" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-sand-50 font-sans">{children}</body>
    </html>
  );
}
