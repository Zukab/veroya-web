import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Las imágenes se sirven desde Supabase Storage sin la optimización de Vercel,
  // para poder mover el proyecto a Cloudflare sin cambios.
  images: {
    unoptimized: true,
  },
  // Fuentes del voucher en PDF, que se leen del disco al generarlo (descarga y
  // correo de confirmación, ambos en /admin/reservas).
  outputFileTracingIncludes: {
    "/admin/reservas/**": ["./src/lib/voucher/fonts/*.ttf"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withNextIntl(nextConfig);
