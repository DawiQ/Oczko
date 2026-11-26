// A QR code as a grid of dark / light modules (drawn with plain Views, no
// native SVG needed).
// eslint-disable-next-line import/no-named-as-default
import qrcode from "qrcode-generator";

export function qrMatrix(text: string): boolean[][] {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => qr.isDark(r, c)));
}
