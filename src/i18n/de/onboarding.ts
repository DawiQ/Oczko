// German: texts of the "onboarding" area — the first run and the tutorial.
import type { pl } from "../pl";

export const onboarding: typeof pl.onboarding = {
  welcome: {
    title: "Wie spielst du zu Hause?",
    sub: "Jedes Zuhause hat sein eigenes Oczko. Leg die Regeln einmal fest — ändern kannst du sie jederzeit.",
    inShort: "Kurz gesagt: ",
    inShortA11y: (preview: string) => `Kurz gesagt: ${preview}`,
    done: "Fertig",
    tutorial: "Zeig mir die Regeln am Beispiel",
  },

  tutorial: {
    endTitle: "So spielt man Oczko!",
    endText:
      "Willi hat sich überkauft (über 21), Jakob ist niedriger stehen geblieben — der Punkt gehört dir. Gespielt wird bis zu einer vereinbarten Punktzahl; und zwei Asse („Feuer“) schlagen alles.",
    play: "Partie spielen",
    lobby: "Zur Lobby",
  },

  /** The coach's lines of the scripted round (Jakob and Willi are the opponents). */
  coach: {
    dealing: "Alle bekommen eine Karte. Du bist zuerst dran, dann Jakob und Willi.",
    firstCard: (total: number) => `Du hast ${total}. Bis 21 ist es noch weit — tippe auf „Noch eine“, um eine Karte zu ziehen.`,
    secondCard: (total: number) => `Du hast ${total}. Immer noch sicher: Zieh noch eine.`,
    stop: (total: number) => `Du hast ${total} — knapp unter 21. Mit der nächsten Karte überkaufst du dich leicht (über 21). Sag „Genug“.`,
    rivals: "Jetzt die Gegner: Jakob hört schon bei 14 auf, Willi zieht bis 20.",
    showdown: "Keine Züge mehr — die Karten werden nacheinander aufgedeckt.",
  },
};
