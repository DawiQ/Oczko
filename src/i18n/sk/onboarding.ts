// Slovak: texts of the "onboarding" area — the first run and the tutorial.
import type { pl } from "../pl";

export const onboarding: typeof pl.onboarding = {
  welcome: {
    title: "Ako hráš doma?",
    sub: "Každá domácnosť má svoje Oczko. Nastav pravidlá raz — zmeniť ich môžeš kedykoľvek.",
    inShort: "Stručne: ",
    inShortA11y: (preview: string) => `Stručne: ${preview}`,
    done: "Hotovo",
    tutorial: "Ukáž mi pravidlá na príklade",
  },

  tutorial: {
    endTitle: "Takto sa hrá Oczko!",
    endText:
      "Vitko to prehnal (cez — viac ako 21), Kubo zastal nižšie, takže bod je tvoj. Hráte do dohodnutého počtu bodov; a dve esá porazia všetko.",
    play: "Zahrať partiu",
    lobby: "Do lobby",
  },

  /** The coach's lines of the scripted round (Kubo and Vitko are the opponents). */
  coach: {
    dealing: "Každý dostane jednu kartu. Začínaš ty, potom Kubo a Vitko.",
    firstCard: (total: number) => `Máš ${total}. Do 21 je ešte ďaleko — ťukni na „Ešte“ a vezmi si kartu.`,
    secondCard: (total: number) => `Máš ${total}. Stále bezpečne: vezmi si ešte jednu.`,
    stop: (total: number) => `Máš ${total} — blízko 21. Ďalšia karta ťa ľahko dostane cez 21. Povedz „Stačí“.`,
    rivals: "Teraz súperi: Kubo končí už pri 14, Vitko riskuje až do 20.",
    showdown: "Ťahy sa skončili — karty sa odkrývajú jedna po druhej.",
  },
};
