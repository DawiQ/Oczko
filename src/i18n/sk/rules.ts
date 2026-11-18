// Slovak: texts of the "rules" area — house-rule options (editor), the rules
// in words (summaries, preview) and the "Pravidlá" screen.
import type { PresetId } from "../../engine/presets";
import type { DeckSize } from "../../engine/cards";
import type { Rules, TwoAces } from "../../engine/rules";
import type { pl } from "../pl";
import { common } from "./common";

type Option = { label: string; sub?: string };

export const rules: typeof pl.rules = {
  /** Game modes (segments, summaries). */
  modes: { family: "Rodinná hra", bank: "S bankárom" } as Record<Rules["mode"], string>,

  editor: {
    mode: "Režim",
    modeA11y: "Režim hry",
    modeSubs: { family: "všetci proti všetkým", bank: "každý proti banku" } as Record<Rules["mode"], string>,
    faces: "Figúry",
    facesA11y: "Hodnoty figúr",
    /** Under the face presets: which cards they are. */
    facesSub: "J · Q · K",
    custom: "Vlastné",
    customSub: "ľubovoľné",
    /** Face names by rank 11..13. */
    faceNames: { 11: "Chlapec", 12: "Dáma", 13: "Kráľ" } as Record<11 | 12 | 13, string>,
    deck: "Balíček",
    deckOptions: {
      52: { label: common.cards(52) },
      32: { label: common.cards(32), sub: "od sedmičky" },
      36: { label: common.cards(36), sub: "od šestky" },
      24: { label: common.cards(24), sub: "od deviatky" },
    } as Record<DeckSize, Option>,
    twoAces: "Dve esá",
    twoAcesOptions: { wins: "Vyhrávajú", is21: "Rátajú 21", off: "Bez pravidla" } as Record<TwoAces, string>,
    /** Regional rule sets (PLAN.md §13): name and where it is played. */
    preset: "Súbor pravidiel",
    presetCustom: "Vlastné",
    presets: {
      oczko: { name: "Oczko", sub: "Poľsko" },
      siebzehnUndVier: { name: "17 und 4", sub: "Nemecko, Rakúsko" },
      okoBere: { name: "Oko berie", sub: "Česko, Slovensko" },
      ajnc: { name: "Ajnc", sub: "Balkán" },
      ochko: { name: "Očko", sub: "Ukrajina, Kazachstan" },
      pontoon: { name: "Pontoon", sub: "Británia, Írsko, Austrália" },
    } as Record<PresetId, { name: string; sub: string }>,
    ace: "Eso",
    aceA11y: "Hodnota esa",
    aceOptions: { eleven: "11", oneOrEleven: "1 alebo 11" } as Record<Rules["ace"], string>,
    startCards: "Karty na začiatok",
    startCardsOptions: { 1: common.cards(1), 2: common.cards(2) } as Record<Rules["startCards"], string>,
    maxCards: "Limit kariet v ruke",
    noLimit: "Žiadny",
    familyTie: "Remíza",
    familyTieA11y: "Remíza v rodinnej hre",
    familyTieOptions: { allScore: "Bod pre každého", noneScore: "Nikto nezíska bod" } as Record<Rules["familyTie"], string>,
    bankTie: "Remíza s bankom",
    bankTieOptions: { bankWins: "Vyhráva bank", nobody: "Nikto" } as Record<Rules["bankTie"], string>,
    bankScoring: "Body banku",
    bankScoringOptions: {
      majority: { label: "Za väčšinu", sub: "1 bod za kolo" },
      perDuel: { label: "Za súboj", sub: "1 bod za každý" },
    } as Record<Rules["bankScoring"], Option>,
    bankRotation: "Bank prechádza",
    bankRotationA11y: "Kedy bank prechádza ďalej",
    bankRotationOptions: { everyRound: "Každé kolo", onPersian: "Po dvoch esách", fixed: "Nikdy" } as Record<Rules["bankRotation"], string>,
    playerBustLoses: "Kto má cez, vždy prehráva",
    playerBustLosesSub: "Aj keď má cez aj bank",
    bustRevealed: "Cez vidno hneď",
    bustRevealedSub: "Ruka, ktorá má cez, sa hneď odkryje",
    bankTo17: "Bank berie do 17",
    bankTo17Sub: "Pod 17 musí brať, od 17 stojí",
    pontoon: "Pontoon (eso + 10)",
    pontoonSub: "Eso a karta za 10 v dvoch kartách porazí každú 21",
    fiveCardTrick: "Päť kariet",
    fiveCardTrickSub: "Päť kariet bez prekročenia porazí každý súčet (okrem pontoonu)",
  },

  /** The lobby's / settings' short lines. */
  summary: {
    faces: (w: number, d: number, k: number) => `J ${w}, Q ${d}, K ${k}`,
    deck: (n: DeckSize) => common.cards(n),
    persian: "Dve esá vyhrávajú",
    noPersian: "Bez pravidla dvoch es",
    is21: "Dve esá = 21",
    ace: { eleven: "Eso za 11", oneOrEleven: "Eso za 1 alebo 11" } as Record<Rules["ace"], string>,
  },

  /** The rules in one or two sentences ("Stručne"). */
  preview: {
    bank: (bankWinsTies: boolean) =>
      `Každý hrá proti banku: berie karty a povie „Stačí“, bank odpovedá na konci${bankWinsTies ? " a vyhráva remízy" : ""}.`,
    family: "Každý berie karty a povie „Stačí“, keď chce. Bod získa súčet najbližšie k 21 — ale nie vyšší.",
    persian: " Dve esá porazia všetko.",
    is21: " Dve esá sa rátajú ako 21.",
    bankTo17: " Bank berie do 17.",
    oneOrEleven: " Eso platí za 1 alebo 11.",
  },

  /** The "Pravidlá" screen. */
  screen: {
    /** The fonts' licences (the texts themselves stay in English). */
    licenses: "Licencie písiem",
    title: "Pravidlá",
    topic: "Téma",
    variants: "Varianty",
    goal: "Cieľ",
    goalText:
      "Oczko je poľská hra 21, blízka príbuzná našej hry Oko berie. Získaj súčet čo najbližšie k 21, ale nie viac. Každý postupne hovorí „Ešte“ (berie kartu) alebo „Stačí“ (končí).",
    flow: "Priebeh",
    flowTexts: [
      "Každý dostane kartu na začiatok. Hrá sa postupne, začína sa naľavo od toho, kto rozdáva. Na konci kola všetci odkryjú karty.",
      "Bod získa súčet najbližšie k 21 — ale nie vyšší; dve esá porazia všetko. Pri remíze podľa nastavení: bod pre každého alebo pre nikoho.",
    ],
    banker: "Bankár",
    bankerTexts: [
      "Jedna osoba je bank. Všetci ostatní hrajú súboj iba s bankom; bank ide posledný a vidí, kto má cez.",
      "Vyšší súčet vyhráva súboj (+1). Kto má cez, vždy prehráva; keď má cez bank, prehrá s každým, kto cez nemá. Remíza zvyčajne patrí banku.",
      "Bank získa bod, keď vyhrá viac súbojov, ako prehrá (alebo — podľa nastavení — bod za každý vyhraný súboj). Bank prechádza každé kolo na ďalšiu osobu.",
    ],
    houseVariants: "Domáce varianty",
    houseVariantsTexts: [
      "Hodnoty figúr (J, Q, K), balíček s 52, 32 alebo 24 kartami, eso za 11 alebo za 1 či 11, dve esá áno alebo nie, jedna alebo dve karty na začiatok, limit kariet v ruke, pravidlá remíz a banku.",
      "Všetko nastavíš v časti „Tvoje domáce pravidlá“ a pri každej novej hre.",
    ],
    examples: {
      persian: { title: "Dve esá", text: "Porazia všetko." },
      oczko: { title: "Oczko", text: "Presne 21." },
      fura: { title: "Cez", text: "Viac ako 21 — ruka prehráva." },
      aces21: { title: "Dve esá", text: "Rátajú sa ako 21." },
    } as Record<"persian" | "oczko" | "fura" | "aces21", { title: string; text: string }>,
    /** An example hand for screen readers. */
    exampleA11y: (title: string, text: string) => `${title}: ${text}`,
    cardValues: "Hodnoty kariet",
    pipRanks: "2–10",
    byPips: "podľa čísla",
    aceShort: { eleven: "11", oneOrEleven: "1/11" } as Record<Rules["ace"], string>,
    valueA11y: (card: string, value: string) => `${card}: ${value}`,
    yourSettings: "Tvoje nastavenia — zmeníš ich v časti „Tvoje domáce pravidlá“.",
    showExample: "Ukáž mi príklad",
  },
};
