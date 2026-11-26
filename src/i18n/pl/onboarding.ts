// Polish: texts of the "onboarding" area — the first run and the tutorial.
export const onboarding = {
  welcome: {
    title: "Jak grasz u siebie?",
    sub: "Każdy dom ma swoje Oczko. Ustaw zasady raz — można je zmienić w każdej chwili.",
    inShort: "W skrócie: ",
    inShortA11y: (preview: string) => `W skrócie: ${preview}`,
    done: "Gotowe",
    tutorial: "Pokaż mi zasady na przykładzie",
  },

  tutorial: {
    endTitle: "Tak się gra w Oczko!",
    endText:
      "Witek przesadził (fura — ponad 21), Kuba zatrzymał się niżej, więc punkt jest Twój. Gracie do ustalonej liczby punktów; a dwa asy to perskie oczko, które wygrywa wszystko.",
    play: "Zagraj partię",
    lobby: "Do lobby",
  },

  /** The coach's lines of the scripted round (Kuba and Witek are the rivals). */
  coach: {
    dealing: "Każdy dostaje jedną kartę. Ty grasz pierwszy, potem Kuba i Witek.",
    firstCard: (total: number) => `Masz ${total}. Daleko do 21 — stuknij „Dobieram”, żeby wziąć kartę.`,
    secondCard: (total: number) => `Masz ${total}. Wciąż bezpiecznie: dobierz jeszcze raz.`,
    stop: (total: number) => `Masz ${total} — blisko 21. Kolejna karta to spora szansa na furę (ponad 21). Powiedz „Starczy”.`,
    rivals: "Teraz rywale: Kuba staje już przy 14, Witek ryzykuje aż do 20.",
    showdown: "Koniec ruchów — karty odkrywane są po kolei.",
  },
};
