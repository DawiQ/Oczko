// Ukrainian: texts of the "onboarding" area — the first run and the tutorial.
import type { pl } from "../pl";

export const onboarding: typeof pl.onboarding = {
  welcome: {
    title: "Як ти граєш удома?",
    sub: "У кожному домі — своє Oczko. Налаштуй правила один раз — змінити їх можна будь-коли.",
    inShort: "Коротко: ",
    inShortA11y: (preview: string) => `Коротко: ${preview}`,
    done: "Готово",
    tutorial: "Покажи правила на прикладі",
  },

  tutorial: {
    endTitle: "Ось так грають в Oczko!",
    endText:
      "Вітько перебрав (перебір — понад 21), Яків зупинився нижче, тож бал твій. Грають до домовленої кількості балів, а два тузи виграють у будь-якої руки.",
    play: "Зіграти партію",
    lobby: "У лобі",
  },

  /** The coach's lines of the scripted round (Яків and Вітько are the rivals). */
  coach: {
    dealing: "Кожен отримує одну карту. Перший хід твій, далі Яків і Вітько.",
    firstCard: (total: number) => `У тебе ${total}. До 21 ще далеко — торкнися «Ще», щоб узяти карту.`,
    secondCard: (total: number) => `У тебе ${total}. Досі безпечно: візьми ще одну.`,
    stop: (total: number) => `У тебе ${total} — близько до 21. Наступна карта — чималий ризик перебору (понад 21). Скажи «Досить».`,
    rivals: "Тепер суперники: Яків зупиняється вже на 14, Вітько ризикує аж до 20.",
    showdown: "Ходи закінчено — карти відкриваються по черзі.",
  },
};
