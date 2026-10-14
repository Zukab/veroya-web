import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Pruebas automáticas de la lógica que no necesita base de datos ni navegador
// (npm test). "server-only" se sustituye por un módulo vacío: fuera de Next lanza
// un error al importarse.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./tests/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
