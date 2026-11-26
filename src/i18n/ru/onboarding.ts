// Russian: texts of the "onboarding" area — the first run and the tutorial.
import type { pl } from "../pl";

export const onboarding: typeof pl.onboarding = {
  welcome: {
    title: "Как играют у тебя дома?",
    sub: "В каждом доме играют в Oczko по-своему. Задай правила один раз — менять их можно в любой момент.",
    inShort: "Коротко: ",
    inShortA11y: (preview: string) => `Коротко: ${preview}`,
    done: "Готово",
    tutorial: "Покажи правила на примере",
  },

  tutorial: {
    endTitle: "Вот так играют в Oczko!",
    endText:
      "Витя перебрал (перебор — больше 21), Яша остановился раньше, так что балл твой. Играете до оговорённого числа баллов, а два туза бьют всё.",
    play: "Сыграть партию",
    lobby: "В лобби",
  },

  /** The coach's lines of the scripted round (Яша and Витя are the opponents). */
  coach: {
    dealing: "Каждый получает по одной карте. Первый ход твой, потом ходят Яша и Витя.",
    firstCard: (total: number) => `У тебя ${total}. До 21 далеко — нажми «Ещё», чтобы взять карту.`,
    secondCard: (total: number) => `У тебя ${total}. Пока безопасно: возьми ещё одну.`,
    stop: (total: number) => `У тебя ${total} — это близко к 21. Следующая карта легко даст перебор (больше 21). Скажи «Хватит».`,
    rivals: "Теперь соперники: Яша останавливается уже на 14, а Витя рискует до самых 20.",
    showdown: "Ходы закончились — карты открываются по очереди.",
  },
};
