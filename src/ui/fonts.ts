// Display typeface: Fraunces ExtraBold for Latin scripts and Literata
// ExtraBold for Cyrillic (Fraunces has no Cyrillic) — both SIL Open Font
// License, bundled with the app. One family name (`DISPLAY`) for every
// stylesheet; the face behind it is chosen once at startup from the language
// (App.tsx). After a change between scripts at runtime the missing letters are
// drawn by the system font until the next start. Only one weight is shipped;
// set fontWeight "normal" with it so Android does not synthesise a bolder face.
import { Fraunces_800ExtraBold } from "@expo-google-fonts/fraunces/800ExtraBold";
import { Literata_800ExtraBold } from "@expo-google-fonts/literata/800ExtraBold";

export const DISPLAY = "Oczko_Display";

/** The display face for a script. */
export const displayFont = (cyrillic: boolean) => ({ [DISPLAY]: cyrillic ? Literata_800ExtraBold : Fraunces_800ExtraBold });
