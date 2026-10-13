import { House } from "lucide-react";

// Se muestra en lugar de la foto mientras el cliente no haya subido imágenes.
export function PhotoPlaceholder({
  label,
  className = "",
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-linear-to-br from-sand-200 via-sand-100 to-terracotta-100 text-terracotta-600/70 ${className}`}
    >
      {label ? (
        <span className="font-serif text-5xl text-terracotta-600/60">
          {label.charAt(0)}
        </span>
      ) : (
        <House className="size-10" strokeWidth={1.25} />
      )}
    </div>
  );
}
