import { publicEnv } from "@/lib/env";

// Fotos en el bucket público "media" de Supabase Storage.
export const MEDIA_BUCKET = "media";

const publicPrefix = `${publicEnv.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${MEDIA_BUCKET}/`;

// Solo se aceptan URLs de nuestro bucket (nunca enlaces externos ni base64).
export function isMediaUrl(url: string) {
  return url.startsWith(publicPrefix) && url.length > publicPrefix.length;
}

// Ruta dentro del bucket a partir de la URL pública.
export function mediaPathFromUrl(url: string) {
  return isMediaUrl(url) ? decodeURIComponent(url.slice(publicPrefix.length)) : null;
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
