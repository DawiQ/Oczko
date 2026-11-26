// The Bosnian-Croatian-Serbian (Latin, ijekavian) dictionary: the same shape as Polish (`Strings`).
import type { Strings } from "../pl";
import { app } from "./app";
import { cards, common, ui } from "./common";
import { history } from "./history";
import { home } from "./home";
import { lan } from "./lan";
import { newgame } from "./newgame";
import { onboarding } from "./onboarding";
import { personas } from "./personas";
import { premium } from "./premium";
import { profile } from "./profile";
import { rules } from "./rules";
import { table } from "./table";

export const sh: Strings = {
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
