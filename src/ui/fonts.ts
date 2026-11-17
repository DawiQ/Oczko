// Display typeface from the mockups: Fraunces ExtraBold (SIL Open Font
// License), bundled with the app and loaded at startup (see App.tsx). Only one
// weight is shipped; set fontWeight "normal" with it so Android does not
// synthesise a bolder face.
import { Fraunces_800ExtraBold } from "@expo-google-fonts/fraunces/800ExtraBold";

export const DISPLAY = "Fraunces_800ExtraBold";
export const FONT_SOURCES = { [DISPLAY]: Fraunces_800ExtraBold };
