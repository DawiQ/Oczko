// Polish: texts of the "rules" area — house-rule options (editor), the rules
// in words (summaries, preview) and the "Zasady" screen.
import type { PresetId } from "../../engine/presets";
import type { DeckSize } from "../../engine/cards";
import type { Rules, TwoAces } from "../../engine/rules";
import { common } from "./common";

type Option = { label: string; sub?: string };

export const rules = {
  /** Game modes (segments, summaries). */
  modes: { family: "Rodzinne", bank: "Z bankierem" } as Record<Rules["mode"], string>,

  editor: {
    mode: "Tryb",
    modeA11y: "Tryb gry",
    modeSubs: { family: "wszyscy na wszystkich", bank: "każdy gra z bankiem" } as Record<Rules["mode"], string>,
    faces: "Figury",
    facesA11y: "Wartości figur",
    /** Under the face presets: which cards they are. */
    facesSub: "W · D · K",
    custom: "Własne",
    customSub: "dowolne",
    /** Face names by rank 11..13. */
    faceNames: { 11: "Walet", 12: "Dama", 13: "Król" } as Record<11 | 12 | 13, string>,
    deck: "Talia",
    deckOptions: {
      52: { label: common.cards(52) },
      32: { label: common.cards(32), sub: "od siódemki" },
      36: { label: common.cards(36), sub: "od szóstki" },
      24: { label: common.cards(24), sub: "od dziewiątki" },
    } as Record<DeckSize, Option>,
    twoAces: "Dwa asy",
    twoAcesOptions: { wins: "Wygrywają", is21: "Liczą 21", off: "Bez reguły" } as Record<TwoAces, string>,
    /** Regional rule sets (PLAN.md §13): name and where it is played. */
    preset: "Zestaw zasad",
    presetCustom: "Własne",
    presets: {
      oczko: { name: "Oczko", sub: "Polska" },
      siebzehnUndVier: { name: "17 und 4", sub: "Niemcy, Austria" },
      okoBere: { name: "Oko bere", sub: "Czechy, Słowacja" },
      ajnc: { name: "Ajnc", sub: "Bałkany" },
      ochko: { name: "Очко", sub: "Ukraina, Kazachstan" },
      pontoon: { name: "Pontoon", sub: "Wielka Brytania, Irlandia, Australia" },
    } as Record<PresetId, { name: string; sub: string }>,
    ace: "As",
    aceA11y: "Wartość asa",
    aceOptions: { eleven: "11", oneOrEleven: "1 lub 11" } as Record<Rules["ace"], string>,
    startCards: "Karty na start",
    startCardsOptions: { 1: common.cards(1), 2: common.cards(2) } as Record<Rules["startCards"], string>,
    maxCards: "Limit kart w ręce",
    noLimit: "Bez",
    familyTie: "Remis",
    familyTieA11y: "Remis w trybie rodzinnym",
    familyTieOptions: { allScore: "Punkt dla każdego", noneScore: "Nikt nie punktuje" } as Record<Rules["familyTie"], string>,
    bankTie: "Remis z bankiem",
    bankTieOptions: { bankWins: "Wygrywa bank", nobody: "Nikt" } as Record<Rules["bankTie"], string>,
    bankScoring: "Punkty banku",
    bankScoringOptions: {
      majority: { label: "Za większość", sub: "1 pkt za rundę" },
      perDuel: { label: "Za pojedynek", sub: "1 pkt za każdy" },
    } as Record<Rules["bankScoring"], Option>,
    bankRotation: "Bank przechodzi",
    bankRotationA11y: "Kiedy bank przechodzi",
    bankRotationOptions: { everyRound: "Co rundę", onPersian: "Po perskim", fixed: "Stały" } as Record<Rules["bankRotation"], string>,
    playerBustLoses: "Fura gracza przegrywa zawsze",
    playerBustLosesSub: "Także gdy bank też ma furę",
    bustRevealed: "Furę widać od razu",
    bustRevealedSub: "Karty z furą odkrywane natychmiast",
    bankTo17: "Bank dobiera do 17",
    bankTo17Sub: "Poniżej 17 musi dobierać, od 17 staje",
    pontoon: "Pontoon (as + 10)",
    pontoonSub: "As z kartą za 10 w dwóch kartach bije każde 21",
    fiveCardTrick: "Pięć kart",
    fiveCardTrickSub: "Pięć kart bez fury bije każdą sumę (poza pontoonem)",
  },

  /** The lobby's / settings' short lines. */
  summary: {
    faces: (w: number, d: number, k: number) => `W ${w}, D ${d}, K ${k}`,
    deck: (n: DeckSize) => common.cards(n),
    persian: "Perskie oczko",
    noPersian: "Bez perskiego oczka",
    is21: "Dwa asy = 21",
    ace: { eleven: "As za 11", oneOrEleven: "As za 1 lub 11" } as Record<Rules["ace"], string>,
  },

  /** The rules in one or two sentences ("W skrócie"). */
  preview: {
    bank: (bankWinsTies: boolean) =>
      `Każdy gra z bankiem: dobiera karty i mówi „Starczy”, bank odpowiada na końcu${bankWinsTies ? " i wygrywa remisy" : ""}.`,
    family: "Każdy dobiera karty i mówi „Starczy”, gdy chce. Punkt dostaje wynik najbliżej 21 bez fury.",
    persian: " Dwa asy to perskie oczko — wygrywa wszystko.",
    is21: " Dwa asy liczą się jak 21.",
    bankTo17: " Bank dobiera do 17.",
    oneOrEleven: " As liczy się za 1 albo 11.",
  },

  /** The "Zasady" screen. */
  screen: {
    /** The fonts' licences (the texts themselves stay in English). */
    licenses: "Licencje czcionek",
    title: "Zasady",
    topic: "Temat",
    variants: "Warianty",
    goal: "Cel",
    goalText: "Zbierz jak najbliżej 21 oczek, ale nie więcej. Każdy po kolei mówi „Dobieram” (bierze kartę) albo „Starczy” (kończy).",
    flow: "Przebieg",
    flowTexts: [
      "Każdy dostaje kartę na start. Gracie po kolei od lewej strony rozdającego. Na końcu rundy wszyscy odkrywają karty.",
      "Punkt dostaje wynik najbliżej 21 bez fury; perskie oczko wygrywa ze wszystkim. Przy remisie — wg ustawień: punkt dla każdego albo dla nikogo.",
    ],
    banker: "Bankier",
    bankerTexts: [
      "Jedna osoba jest bankiem. Każdy gracz rozgrywa pojedynek tylko z bankiem; bank rusza się ostatni i widzi, kto ma furę.",
      "Gracz z wyższym wynikiem wygrywa pojedynek (+1). Fura gracza przegrywa zawsze; fura banku przegrywa z każdym, kto jej nie ma. Remis — zwykle dla banku.",
      "Bank dostaje punkt, gdy wygra więcej pojedynków, niż przegra (albo — w ustawieniach — punkt za każdy wygrany pojedynek). Bank przechodzi co rundę na kolejną osobę.",
    ],
    houseVariants: "Warianty domowe",
    houseVariantsTexts: [
      "Wartości figur (W, D, K), talia 52, 32 albo 24 karty, as za 11 albo za 1 lub 11, perskie oczko tak albo nie, jedna lub dwie karty na start, limit kart w ręce, zasady remisów i banku.",
      "Wszystko ustawisz w „Jak grasz u siebie” i przy każdej nowej grze.",
    ],
    examples: {
      persian: { title: "Perskie oczko", text: "Dwa asy — wygrywa ze wszystkim." },
      oczko: { title: "Oczko", text: "Równe 21." },
      fura: { title: "Fura", text: "Więcej niż 21 — ręka przegrywa." },
      aces21: { title: "Dwa asy", text: "Liczą się jak 21." },
    } as Record<"persian" | "oczko" | "fura" | "aces21", { title: string; text: string }>,
    /** An example hand for screen readers. */
    exampleA11y: (title: string, text: string) => `${title}: ${text}`,
    cardValues: "Wartości kart",
    pipRanks: "2–10",
    byPips: "wg oczek",
    aceShort: { eleven: "11", oneOrEleven: "1/11" } as Record<Rules["ace"], string>,
    valueA11y: (card: string, value: string) => `${card}: ${value}`,
    yourSettings: "Twoje ustawienia — zmienisz je w „Jak grasz u siebie”.",
    showExample: "Pokaż na przykładzie",
  },
};
