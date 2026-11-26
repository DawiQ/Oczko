// Hungarian: texts of the "onboarding" area — the first run and the tutorial.
import type { pl } from "../pl";

export const onboarding: typeof pl.onboarding = {
  welcome: {
    title: "Hogyan játszol otthon?",
    sub: "Minden családnak megvannak a saját szabályai. Állítsd be őket egyszer — bármikor módosíthatod.",
    inShort: "Röviden: ",
    inShortA11y: (preview: string) => `Röviden: ${preview}`,
    done: "Kész",
    tutorial: "Mutasd meg a szabályokat egy példán",
  },

  tutorial: {
    endTitle: "Így megy az Oczko!",
    endText:
      "Vilinek túl sok lett (21 fölött), Jakab alacsonyabban megállt, így a pont a tiéd. Egy megbeszélt pontszámig játszotok, a két ász pedig mindent üt.",
    play: "Játssz egy partit",
    lobby: "A lobbiba",
  },

  /** The coach's lines of the scripted round (Jakab and Vili are the opponents). */
  coach: {
    dealing: "Mindenki kap egy lapot. Te kezdesz, utána Jakab és Vili jön.",
    firstCard: (total: number) => `Összesen ${total}. Messze még a 21 — koppints a „Kérek” gombra, és kapsz egy lapot.`,
    secondCard: (total: number) => `Összesen ${total}. Még mindig biztonságos: kérj még egyet.`,
    stop: (total: number) => `Összesen ${total} — közel a 21. A következő lappal könnyen túl sok lesz (21 fölött). Mondd azt: „Elég”.`,
    rivals: "Most az ellenfelek jönnek: Jakab már 14-nél megáll, Vili egészen 20-ig kér.",
    showdown: "Nincs több lépés — a lapok sorban felfordulnak.",
  },
};
