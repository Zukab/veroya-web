import { MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getAgencySettings, whatsappUrl } from "@/lib/data/settings";

// Botón flotante para escribir a la agencia por WhatsApp (número de /admin/ajustes).
// En la ficha del apartamento se sube en móvil para no tapar la barra de reservar
// (ver .whatsapp-float en globals.css).
export async function WhatsAppFloatingButton() {
  const [settings, t] = await Promise.all([getAgencySettings(), getTranslations("WhatsApp")]);
  const href = whatsappUrl(settings.whatsapp, t("general"));
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("floating")}
      title={t("floating")}
      className="whatsapp-float fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-stone-900/20 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:right-6 sm:bottom-6"
    >
      <MessageCircle aria-hidden="true" className="size-7" strokeWidth={2} />
    </a>
  );
}
