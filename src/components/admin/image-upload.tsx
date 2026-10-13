"use client";

import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { useId, useState } from "react";
import { ALLOWED_IMAGE_TYPES, MAX_UPLOAD_BYTES, MEDIA_BUCKET } from "@/lib/media";
import { createClient } from "@/lib/supabase/browser";

// Las fotos se sirven sin optimizar (images.unoptimized), así que se reducen en el
// navegador antes de subirlas: lado mayor de 2000 px, en WebP.
const MAX_SIDE = 2000;

async function resizeImage(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );
    if (blob && blob.size < file.size) return blob;
  } catch {
    // Si el navegador no puede procesarla, se sube el original.
  }
  return file;
}

// Selector de fotos que sube a Storage con la sesión del administrador (las
// políticas de Storage solo dejan subir a administradores) y guarda las URLs en
// campos ocultos con el nombre `name`. La primera foto es la portada.
export function ImageUpload({
  name,
  folder,
  initial,
  multiple = false,
}: {
  name: string;
  folder: string;
  initial: string[];
  multiple?: boolean;
}) {
  const inputId = useId();
  const [urls, setUrls] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    const supabase = createClient();
    const uploaded: string[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          setError(`"${file.name}" no es JPEG, PNG ni WebP.`);
          continue;
        }
        const blob = await resizeImage(file);
        if (blob.size > MAX_UPLOAD_BYTES) {
          setError(`"${file.name}" pesa más de 5 MB.`);
          continue;
        }
        const extension = blob.type === "image/webp" ? "webp" : file.name.split(".").pop()?.toLowerCase();
        const path = `${folder}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from(MEDIA_BUCKET)
          .upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
        if (uploadError) {
          setError(`No se pudo subir "${file.name}": ${uploadError.message}`);
          continue;
        }
        uploaded.push(supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl);
      }
      setUrls((current) => {
        if (multiple) return [...current, ...uploaded];
        const last = uploaded.at(-1);
        return last ? [last] : current;
      });
    } finally {
      setUploading(false);
    }
  }

  function move(index: number, offset: number) {
    setUrls((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(index + offset, 0, item);
      return next;
    });
  }

  return (
    <div>
      {urls.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {urls.map((url, index) => (
          <li key={url} className="relative overflow-hidden rounded-xl border border-sand-200 bg-sand-100">
            {/* eslint-disable-next-line @next/next/no-img-element -- vista previa en el panel */}
            <img src={url} alt="" className="aspect-4/3 w-full object-cover" />
            {multiple && index === 0 && (
              <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs text-white">
                Portada
              </span>
            )}
            <div className="absolute right-1.5 top-1.5 flex gap-1">
              {multiple && index > 0 && (
                <IconButton label="Mover a la izquierda" onClick={() => move(index, -1)}>
                  <ArrowLeft className="size-4" />
                </IconButton>
              )}
              {multiple && index < urls.length - 1 && (
                <IconButton label="Mover a la derecha" onClick={() => move(index, 1)}>
                  <ArrowRight className="size-4" />
                </IconButton>
              )}
              <IconButton
                label="Quitar foto"
                onClick={() => setUrls((current) => current.filter((item) => item !== url))}
              >
                <X className="size-4" />
              </IconButton>
            </div>
          </li>
        ))}
        {(multiple || urls.length === 0) && (
          <li>
            <label
              htmlFor={inputId}
              className="flex aspect-4/3 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-sand-300 text-sm text-stone-600 hover:border-terracotta-500 hover:text-terracotta-700"
            >
              <ImagePlus aria-hidden="true" className="size-6" />
              {uploading ? "Subiendo…" : multiple ? "Añadir fotos" : "Añadir foto"}
            </label>
            <input
              id={inputId}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              multiple={multiple}
              disabled={uploading}
              className="sr-only"
              onChange={(event) => {
                void handleFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </li>
        )}
      </ul>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
      <p className="mt-2 text-xs text-stone-500">
        JPEG, PNG o WebP. Se reducen a 2000 px y se guardan en WebP. Los cambios se aplican al
        pulsar «Guardar».
      </p>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex size-7 items-center justify-center rounded-full bg-white/90 text-ink shadow hover:bg-white"
    >
      {children}
    </button>
  );
}
