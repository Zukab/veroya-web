// Genera los iconos y la imagen de la marca: node scripts/brand-assets.mjs
// - src/app/icon.svg, src/app/favicon.ico y src/app/apple-icon.png (pestaña y móvil)
// - public/brand/euronest-arco.png (cabecera de los correos; Gmail no muestra SVG)
// Las formas son las de src/lib/brand.ts: si cambian allí, cámbialas aquí y vuelve a
// ejecutarlo.
import { mkdirSync, writeFileSync } from "node:fs";
import { ImageResponse } from "next/og.js";
import { createElement } from "react";

const TERRACOTTA = "#b4532a";
const SAND = "#faf7f2";

// Símbolo sobre fondo transparente (la puerta es un hueco).
const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 34 38"><path fill="${TERRACOTTA}" fill-rule="evenodd" d="M3 37V17a14 14 0 0 1 28 0v20zM11 37V22a6 6 0 0 1 12 0v15z"/></svg>`;

// Icono: cuadrado terracota con el arco en arena. `radius` 0 para el icono del móvil
// (iOS ya redondea las esquinas).
const icon = (radius) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="${radius}" fill="${TERRACOTTA}"/><path fill="${SAND}" fill-rule="evenodd" d="M8 27V15a8 8 0 0 1 16 0v12zM12.5 27v-9a3.5 3.5 0 0 1 7 0v9z"/></svg>`;

async function png(svg, width, height) {
  const src = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  const image = createElement("img", { src, width, height });
  const response = new ImageResponse(
    createElement("div", { style: { display: "flex", width, height } }, image),
    { width, height },
  );
  return Buffer.from(await response.arrayBuffer());
}

// .ico con imágenes PNG dentro (lo admiten todos los navegadores actuales).
function ico(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, index) => {
    const entry = 6 + 16 * index;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map(({ data }) => data)]);
}

writeFileSync("src/app/icon.svg", `${icon(7)}\n`);
writeFileSync("src/app/apple-icon.png", await png(icon(0), 180, 180));
const sizes = [16, 32, 48];
const icons = await Promise.all(sizes.map(async (size) => ({ size, data: await png(icon(7), size, size) })));
writeFileSync("src/app/favicon.ico", ico(icons));
mkdirSync("public/brand", { recursive: true });
writeFileSync("public/brand/euronest-arco.png", await png(mark, 102, 114));
console.log("Iconos y símbolo generados.");
