// A QR code drawn with plain views. Modules are whole device pixels and each
// row's dark run is one view, so no hairline seams break the pattern up.
import { useMemo } from "react";
import { PixelRatio, View } from "react-native";

import { qrMatrix } from "./qr";

/** Dark runs of a row: [start, length] pairs. */
function runs(row: boolean[]): [number, number][] {
  const out: [number, number][] = [];
  for (let c = 0; c < row.length; c++) {
    if (!row[c]) continue;
    const start = c;
    while (c + 1 < row.length && row[c + 1]) c++;
    out.push([start, c - start + 1]);
  }
  return out;
}

export function QrView({ text, size, label }: { text: string; size: number; label: string }) {
  const m = useMemo(() => qrMatrix(text), [text]);
  const quiet = 3; // the light margin scanners need, in modules
  const n = m.length + quiet * 2;
  // A whole number of device pixels per module.
  const px = Math.max(1, Math.floor(PixelRatio.getPixelSizeForLayoutSize(size) / n));
  const cell = px / PixelRatio.get();
  const box = cell * n;
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
      style={{ width: box, height: box, backgroundColor: "#FFFFFF", borderRadius: 12, overflow: "hidden" }}
    >
      {m.map((row, r) =>
        runs(row).map(([c, len]) => (
          <View
            key={`${r}-${c}`}
            style={{
              position: "absolute",
              left: (c + quiet) * cell,
              top: (r + quiet) * cell,
              width: len * cell,
              height: cell,
              backgroundColor: "#000000",
            }}
          />
        ))
      )}
    </View>
  );
}
