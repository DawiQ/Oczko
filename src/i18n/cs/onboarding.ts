// Czech: texts of the "onboarding" area — the first run and the tutorial.
import type { pl } from "../pl";

export const onboarding: typeof pl.onboarding = {
  welcome: {
    title: "Jak hraješ doma?",
    sub: "Každá rodina má své Oczko. Nastav pravidla jednou — změnit je můžeš kdykoli.",
    inShort: "Ve zkratce: ",
    inShortA11y: (preview: string) => `Ve zkratce: ${preview}`,
    done: "Hotovo",
    tutorial: "Ukaž mi pravidla na příkladu",
  },

  tutorial: {
    endTitle: "Takhle se hraje Oczko!",
    endText:
      "Vítek přetáhl (víc než 21 — má přes), Kuba skončil níž, takže bod je tvůj. Hraje se do domluveného počtu bodů; a dvě esa vyhrávají nad vším.",
    play: "Hrát partii",
    lobby: "Do lobby",
  },

  /** The coach's lines of the scripted round (Kuba and Vítek are the opponents). */
  coach: {
    dealing: "Každý dostane jednu kartu. Hraješ první, pak Kuba a Vítek.",
    firstCard: (total: number) => `Máš ${total}. K 21 je daleko — klepni na „Ještě“ a vezmi si kartu.`,
    secondCard: (total: number) => `Máš ${total}. Pořád v bezpečí: ber ještě jednou.`,
    stop: (total: number) => `Máš ${total} — blízko 21. S další kartou snadno přetáhneš (přes 21). Řekni „Stačí“.`,
    rivals: "Teď soupeři: Kuba končí už na 14, Vítek riskuje až do 20.",
    showdown: "Konec tahů — karty se odkrývají jedna po druhé.",
  },
};
