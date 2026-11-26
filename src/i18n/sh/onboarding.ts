// Bosnian-Croatian-Serbian: texts of the "onboarding" area — the first run and
// the tutorial.
import type { pl } from "../pl";

export const onboarding: typeof pl.onboarding = {
  welcome: {
    title: "Kako igraš kod kuće?",
    sub: "Svaka kuća igra po svom. Postavi pravila jednom — možeš ih promijeniti kad god hoćeš.",
    inShort: "Ukratko: ",
    inShortA11y: (preview: string) => `Ukratko: ${preview}`,
    done: "Gotovo",
    tutorial: "Pokaži mi pravila na primjeru",
  },

  tutorial: {
    endTitle: "Tako se igra Oczko!",
    endText:
      "Vito je pretjerao (tropa — preko 21), Jakov je stao niže, pa je bod tvoj. Igrate do dogovorenog broja bodova, a dva asa pobjeđuju sve.",
    play: "Odigraj partiju",
    lobby: "Na početak",
  },

  /** The coach's lines of the scripted round (Jakov and Vito are the opponents). */
  coach: {
    dealing: "Svi dobiju po jednu kartu. Prvo igraš ti, zatim Jakov i Vito.",
    firstCard: (total: number) => `Imaš ${total}. Do 21 je daleko — dodirni „Još“ da uzmeš kartu.`,
    secondCard: (total: number) => `Imaš ${total}. I dalje je sigurno: uzmi još jednu.`,
    stop: (total: number) => `Imaš ${total} — blizu 21. Sljedeća karta lako donosi tropu (preko 21). Reci „Dosta“.`,
    rivals: "Sada protivnici: Jakov staje već na 14, a Vito ide čak do 20.",
    showdown: "Nema više poteza — karte se otkrivaju redom.",
  },
};
