"use client";

import { Images, X } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef } from "react";
import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";

// Tamaño de cada foto en el mosaico de escritorio (cuadrícula de 4 × 2) según
// cuántas fotos haya.
function mosaicSpan(index: number, total: number) {
  if (total === 1) return "col-span-4 row-span-2";
  if (index === 0 || total === 2) return "col-span-2 row-span-2";
  if (total === 3 || (total === 4 && index === 1)) return "col-span-2";
  return "";
}

const MOSAIC_MAX = 5;

// Galería del apartamento: carrusel deslizable en móvil, mosaico en escritorio y
// visor a pantalla completa (<dialog>) con todas las fotos.
export function ApartmentGallery({ images, name }: { images: string[]; name: string }) {
  const t = useTranslations("ApartmentPage");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const total = images.length;

  if (total === 0) {
    return (
      <div className="aspect-4/3 overflow-hidden rounded-2xl sm:aspect-21/9 sm:rounded-3xl">
        <PhotoPlaceholder />
      </div>
    );
  }

  const alt = (index: number) => t("photoAlt", { name, index: index + 1, total });

  function openViewer(index: number) {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    dialog.querySelector(`[data-photo="${index}"]`)?.scrollIntoView({ block: "start" });
  }

  return (
    <>
      {/* Móvil: carrusel a todo el ancho */}
      <div className="relative -mx-4 sm:-mx-6 md:hidden">
        <ul className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, index) => (
            <li key={`${index}-${src}`} className="relative aspect-4/3 w-full shrink-0 snap-center bg-sand-100">
              <button
                type="button"
                onClick={() => openViewer(index)}
                className="absolute inset-0"
              >
                <Image
                  src={src}
                  alt={alt(index)}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
        {total > 1 && (
          <span className="pointer-events-none absolute bottom-3 right-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
            <Images aria-hidden="true" className="size-3.5" />
            {t("photosCount", { count: total })}
          </span>
        )}
      </div>

      {/* Escritorio: mosaico */}
      <div className="relative hidden h-[28rem] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-3xl md:grid">
        {images.slice(0, MOSAIC_MAX).map((src, index) => (
          <button
            key={`${index}-${src}`}
            type="button"
            onClick={() => openViewer(index)}
            className={`group relative overflow-hidden bg-sand-100 ${mosaicSpan(index, total)}`}
          >
            <Image
              src={src}
              alt={alt(index)}
              fill
              priority={index === 0}
              sizes={index === 0 ? "50vw" : "25vw"}
              className="object-cover transition duration-300 group-hover:brightness-90"
            />
          </button>
        ))}
        {total > 1 && (
          <button
            type="button"
            onClick={() => openViewer(0)}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-sand-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-sand-100"
          >
            <Images aria-hidden="true" className="size-4" />
            {t("showAllPhotos", { count: total })}
          </button>
        )}
      </div>

      {/* Visor con todas las fotos */}
      <dialog
        ref={dialogRef}
        aria-label={t("gallery", { name })}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-sand-50 p-0 backdrop:bg-black/60"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-sand-200 bg-sand-50/95 px-4 py-3 backdrop-blur sm:px-6">
          <p className="truncate pr-4 font-medium">{name}</p>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label={t("closeGallery")}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-sand-100"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <ul className="mx-auto flex max-w-4xl flex-col gap-3 p-3 sm:gap-4 sm:p-6">
          {images.map((src, index) => (
            <li key={`${index}-${src}`} data-photo={index} className="scroll-mt-20">
              <Image
                src={src}
                alt={alt(index)}
                width={1600}
                height={1067}
                sizes="(min-width: 896px) 896px, 100vw"
                className="h-auto w-full rounded-xl bg-sand-100"
              />
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
