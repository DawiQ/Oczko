// The Polish dictionary: the base language. Its shape is `Strings`; every
// other language must have the same keys and the same function signatures.
// One section per area of the app (each in its own file).
import { cards, common, ui } from "./common";
import { personas } from "./personas";
import { app } from "./app";
import { home } from "./home";
import { newgame } from "./newgame";
import { rules } from "./rules";
import { onboarding } from "./onboarding";
import { table } from "./table";
import { history } from "./history";
import { profile } from "./profile";
import { lan } from "./lan";
import { premium } from "./premium";

export const pl = {
  common,
  cards,
  ui,
  personas,
  app,
  home,
  newgame,
  rules,
  onboarding,
  table,
  history,
  profile,
  lan,
  premium,
};

export type Strings = typeof pl;
