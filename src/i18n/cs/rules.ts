// Czech: texts of the "rules" area — house-rule options (editor), the rules
// in words (summaries, preview) and the "Pravidla" screen.
import type { PresetId } from "../../engine/presets";
import type { DeckSize } from "../../engine/cards";
import type { Rules, TwoAces } from "../../engine/rules";
import type { pl } from "../pl";
import { common } from "./common";

type Option = { label: string; sub?: string };

export const rules: typeof pl.rules = {
  /** Game modes (segments, summaries). */
  modes: { family: "Rodinná hra", bank: "S bankéřem" } as Record<Rules["mode"], string>,

  editor: {
    mode: "Režim",
    modeA11y: "Režim hry",
    modeSubs: { family: "všichni proti všem", bank: "každý hraje s bankem" } as Record<Rules["mode"], string>,
    faces: "Figury",
    facesA11y: "Hodnoty figur",
    /** Under the face presets: which cards they are. */
    facesSub: "J · Q · K",
    custom: "Vlastní",
    customSub: "libovolné",
    /** Face names by rank 11..13. */
    faceNames: { 11: "Kluk", 12: "Dáma", 13: "Král" } as Record<11 | 12 | 13, string>,
    deck: "Balíček",
    deckOptions: {
      52: { label: common.cards(52) },
      32: { label: common.cards(32), sub: "od sedmiček" },
      36: { label: common.cards(36), sub: "od šestek" },
      24: { label: common.cards(24), sub: "od devítek" },
    } as Record<DeckSize, Option>,
    twoAces: "Dvě esa",
    twoAcesOptions: { wins: "Vyhrávají", is21: "Počítají 21", off: "Bez pravidla" } as Record<TwoAces, string>,
    /** Regional rule sets (PLAN.md §13): name and where it is played. */
    preset: "Sada pravidel",
    presetCustom: "Vlastní",
    presets: {
      oczko: { name: "Oczko", sub: "Polsko" },
      siebzehnUndVier: { name: "17 und 4", sub: "Německo, Rakousko" },
      okoBere: { name: "Oko bere", sub: "Česko, Slovensko" },
      ajnc: { name: "Ajnc", sub: "Balkán" },
      ochko: { name: "Očko", sub: "Ukrajina, Kazachstán" },
      pontoon: { name: "Pontoon", sub: "Británie, Irsko, Austrálie" },
    } as Record<PresetId, { name: string; sub: string }>,
    ace: "Eso",
    aceA11y: "Hodnota esa",
    aceOptions: { eleven: "11", oneOrEleven: "1 nebo 11" } as Record<Rules["ace"], string>,
    startCards: "Karty na začátek",
    startCardsOptions: { 1: common.cards(1), 2: common.cards(2) } as Record<Rules["startCards"], string>,
    maxCards: "Limit karet v ruce",
    noLimit: "Bez",
    familyTie: "Remíza",
    familyTieA11y: "Remíza v rodinné hře",
    familyTieOptions: { allScore: "Bod pro každého", noneScore: "Bod pro nikoho" } as Record<Rules["familyTie"], string>,
    bankTie: "Remíza s bankem",
    bankTieOptions: { bankWins: "Vyhrává bank", nobody: "Nikdo" } as Record<Rules["bankTie"], string>,
    bankScoring: "Body banku",
    bankScoringOptions: {
      majority: { label: "Za většinu", sub: "1 bod za kolo" },
      perDuel: { label: "Za souboj", sub: "1 bod za každý" },
    } as Record<Rules["bankScoring"], Option>,
    bankRotation: "Bank přechází",
    bankRotationA11y: "Kdy bank přechází",
    bankRotationOptions: { everyRound: "Každé kolo", onPersian: "Po dvou esech", fixed: "Stálý" } as Record<Rules["bankRotation"], string>,
    playerBustLoses: "Kdo přetáhne, prohrává vždy",
    playerBustLosesSub: "I když má přes i bank",
    bustRevealed: "Přes je vidět hned",
    bustRevealedSub: "Přetažené ruce se odkryjí okamžitě",
    bankTo17: "Bank bere do 17",
    bankTo17Sub: "Pod 17 musí brát, od 17 stojí",
    pontoon: "Pontoon (eso + 10)",
    pontoonSub: "Eso a karta za 10 ve dvou kartách porazí každou 21",
    fiveCardTrick: "Pět karet",
    fiveCardTrickSub: "Pět karet bez přetažení porazí každý součet (kromě pontoonu)",
  },

  /** The lobby's / settings' short lines. */
  summary: {
    faces: (w: number, d: number, k: number) => `J ${w}, Q ${d}, K ${k}`,
    deck: (n: DeckSize) => common.cards(n),
    persian: "Dvě esa",
    noPersian: "Bez dvou es",
    is21: "Dvě esa = 21",
    ace: { eleven: "Eso za 11", oneOrEleven: "Eso za 1 nebo 11" } as Record<Rules["ace"], string>,
  },

  /** The rules in one or two sentences ("Ve zkratce"). */
  preview: {
    bank: (bankWinsTies: boolean) =>
      `Každý hraje s bankem: bere karty, dokud neřekne „Stačí“; bank hraje poslední${bankWinsTies ? " a vyhrává remízy" : ""}.`,
    family: "Každý bere karty, dokud neřekne „Stačí“. Bod dostane, kdo je nejblíž 21 a nepřetáhne.",
    persian: " Dvě esa vyhrávají nad vším.",
    is21: " Dvě esa se počítají jako 21.",
    bankTo17: " Bank bere do 17.",
    oneOrEleven: " Eso platí 1 nebo 11.",
  },

  /** The "Pravidla" screen. */
  screen: {
    /** The fonts' licences (the texts themselves stay in English). */
    licenses: "Licence písem",
    title: "Pravidla",
    topic: "Téma",
    variants: "Varianty",
    goal: "Cíl",
    goalText:
      "Dostaň se co nejblíž k 21, ale ne výš — podobně jako při hře Oko bere neboli Jednadvacet. Každý postupně říká „Ještě“ (bere kartu), nebo „Stačí“ (končí).",
    flow: "Průběh",
    flowTexts: [
      "Každý dostane kartu na začátek. Hraje se postupně, zleva od toho, kdo rozdává. Na konci kola všichni odkryjí karty.",
      "Bod dostane, kdo je nejblíž 21 a nepřetáhne; dvě esa (fojer) vyhrávají nad vším. Při remíze rozhoduje nastavení: bod pro každého, nebo pro nikoho.",
    ],
    banker: "Bankéř",
    bankerTexts: [
      "Jeden člověk drží bank. Každý další hraje souboj jen s bankem; bank hraje poslední a vidí, kdo má přes.",
      "Vyšší součet vyhrává souboj (+1). Kdo přetáhne, prohrává vždy; když přetáhne bank, prohrává s každým, kdo přes nemá. Remíza obvykle patří banku.",
      "Bank dostane bod, když vyhraje víc soubojů, než prohraje (nebo — podle nastavení — bod za každý vyhraný souboj). Každé kolo přechází bank na dalšího v pořadí.",
    ],
    houseVariants: "Domácí varianty",
    houseVariantsTexts: [
      "Hodnoty figur (J, Q, K), balíček 52, 32 nebo 24 karet, eso za 11 nebo za 1 či 11, dvě esa ano nebo ne, jedna nebo dvě karty na začátek, limit karet v ruce, pravidla remíz a banku.",
      "Všechno nastavíš v části „Tvoje domácí pravidla“ a u každé nové hry.",
    ],
    examples: {
      persian: { title: "Dvě esa", text: "Eso a eso — vyhrávají nad vším." },
      oczko: { title: "Oczko", text: "Přesně 21." },
      fura: { title: "Přes", text: "Víc než 21 — ruka prohrává." },
      aces21: { title: "Dvě esa", text: "Počítají se jako 21." },
    } as Record<"persian" | "oczko" | "fura" | "aces21", { title: string; text: string }>,
    /** An example hand for screen readers. */
    exampleA11y: (title: string, text: string) => `${title}: ${text}`,
    cardValues: "Hodnoty karet",
    pipRanks: "2–10",
    byPips: "podle čísla",
    aceShort: { eleven: "11", oneOrEleven: "1/11" } as Record<Rules["ace"], string>,
    valueA11y: (card: string, value: string) => `${card}: ${value}`,
    yourSettings: "Tvoje nastavení — změníš ho v části „Tvoje domácí pravidla“.",
    showExample: "Ukázat na příkladu",
  },
};
