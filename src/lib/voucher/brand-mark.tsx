import { Path, Svg } from "@react-pdf/renderer";
import { BRAND_MARK } from "@/lib/brand";

// Puerta de BRAND_MARK alargada hasta el borde inferior para que no quede una línea
// fina del arco debajo.
const DOOR = "M11 38.5V22a6 6 0 0 1 12 0v16.5z";

// Símbolo de la marca en los PDF (voucher y comprobante). La puerta se pinta del color
// del papel, que es blanco.
export function PdfBrandMark({ height = 26 }: { height?: number }) {
  const width = (height * BRAND_MARK.width) / BRAND_MARK.height;
  return (
    <Svg viewBox={BRAND_MARK.viewBox} style={{ width, height, marginRight: 7 }}>
      <Path d={BRAND_MARK.arch} fill="#b4532a" />
      <Path d={DOOR} fill="#ffffff" />
    </Svg>
  );
}
