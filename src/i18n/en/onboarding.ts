// English: texts of the "onboarding" area — the first run and the tutorial.
import type { pl } from "../pl";

export const onboarding: typeof pl.onboarding = {
  welcome: {
    title: "How do you play at home?",
    sub: "Every home has its own Oczko. Set your rules once — you can change them any time.",
    inShort: "In short: ",
    inShortA11y: (preview: string) => `In short: ${preview}`,
    done: "Done",
    tutorial: "Show me how to play",
  },

  tutorial: {
    endTitle: "That's how you play Oczko!",
    endText:
      "Vince went too far (bust — over 21) and Jake stopped lower, so the point is yours. You play to an agreed number of points — and two aces (perskie oczko) beat everything.",
    play: "Play a match",
    lobby: "To the lobby",
  },

  /** The coach's lines of the scripted round (Jake and Vince are the opponents). */
  coach: {
    dealing: "Everyone gets one card. You go first, then Jake and Vince.",
    firstCard: (total: number) => `You have ${total}. That's far from 21 — tap “Draw” to take a card.`,
    secondCard: (total: number) => `You have ${total}. Still safe: draw one more.`,
    stop: (total: number) => `You have ${total} — close to 21. Another card could easily make you bust (over 21). Say “Stay”.`,
    rivals: "Now the opponents: Jake stops as early as 14, Vince keeps going all the way to 20.",
    showdown: "No more moves — the cards are turned over one by one.",
  },
};
