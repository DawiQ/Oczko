// Hungarian: texts of the "rules" area — house-rule options (editor), the
// rules in words (summaries, preview) and the "Szabályok" screen.
import type { PresetId } from "../../engine/presets";
import type { DeckSize } from "../../engine/cards";
import type { Rules, TwoAces } from "../../engine/rules";
import type { pl } from "../pl";
import { common } from "./common";

type Option = { label: string; sub?: string };

export const rules: typeof pl.rules = {
  /** Game modes (segments, summaries). */
  modes: { family: "Családi játék", bank: "Bankárral" } as Record<Rules["mode"], string>,

  editor: {
    mode: "Mód",
    modeA11y: "Játékmód",
    modeSubs: { family: "mindenki mindenki ellen", bank: "mindenki a bank ellen" } as Record<Rules["mode"], string>,
    faces: "Figurák",
    facesA11y: "A figurák értéke",
    /** Under the face presets: which cards they are. */
    facesSub: "B · D · K",
    custom: "Saját",
    customSub: "tetszőleges",
    /** Face names by rank 11..13. */
    faceNames: { 11: "Bubi", 12: "Dáma", 13: "Király" } as Record<11 | 12 | 13, string>,
    deck: "Pakli",
    deckOptions: {
      52: { label: common.cards(52) },
      32: { label: common.cards(32), sub: "hetestől" },
      36: { label: common.cards(36), sub: "hatostól" },
      24: { label: common.cards(24), sub: "kilencestől" },
    } as Record<DeckSize, Option>,
    twoAces: "Két ász",
    twoAcesOptions: { wins: "Nyernek", is21: "21-et érnek", off: "Nincs szabály" } as Record<TwoAces, string>,
    /** Regional rule sets (PLAN.md §13): name and where it is played. */
    preset: "Szabálykészlet",
    presetCustom: "Saját",
    presets: {
      oczko: { name: "Oczko", sub: "Lengyelország" },
      siebzehnUndVier: { name: "17 und 4", sub: "Németország, Ausztria" },
      okoBere: { name: "Oko bere", sub: "Csehország, Szlovákia" },
      ajnc: { name: "Ajnc", sub: "Balkán" },
      ochko: { name: "Ocsko", sub: "Ukrajna, Kazahsztán" },
      pontoon: { name: "Pontoon", sub: "Egyesült Királyság, Írország, Ausztrália" },
    } as Record<PresetId, { name: string; sub: string }>,
    ace: "Ász",
    aceA11y: "Az ász értéke",
    aceOptions: { eleven: "11", oneOrEleven: "1 vagy 11" } as Record<Rules["ace"], string>,
    startCards: "Kezdő lapok",
    startCardsOptions: { 1: common.cards(1), 2: common.cards(2) } as Record<Rules["startCards"], string>,
    maxCards: "Lapkorlát a kézben",
    noLimit: "Nincs",
    familyTie: "Döntetlen",
    familyTieA11y: "Döntetlen családi játékban",
    familyTieOptions: { allScore: "Pont mindenkinek", noneScore: "Senki sem kap pontot" } as Record<Rules["familyTie"], string>,
    bankTie: "Döntetlen a bankkal",
    bankTieOptions: { bankWins: "A bank nyer", nobody: "Senki" } as Record<Rules["bankTie"], string>,
    bankScoring: "A bank pontjai",
    bankScoringOptions: {
      majority: { label: "Többségért", sub: "1 pont körönként" },
      perDuel: { label: "Párharconként", sub: "1 pont mindegyikért" },
    } as Record<Rules["bankScoring"], Option>,
    bankRotation: "A bank továbbjár",
    bankRotationA11y: "Mikor jár tovább a bank",
    bankRotationOptions: { everyRound: "Minden körben", onPersian: "Két ász után", fixed: "Állandó" } as Record<Rules["bankRotation"], string>,
    playerBustLoses: "Aki túllép, mindig veszít",
    playerBustLosesSub: "Akkor is, ha a banknak is túl sok",
    bustRevealed: "A túl sok rögtön látszik",
    bustRevealedSub: "A 21 fölötti kéz lapjai azonnal felfordulnak",
    bankTo17: "A bank 17-ig húz",
    bankTo17Sub: "17 alatt húznia kell, 17-től megáll",
    pontoon: "Pontoon (ász + 10)",
    pontoonSub: "Ász és tízes két lapból minden 21-et üt",
    fiveCardTrick: "Öt lap",
    fiveCardTrickSub: "Öt lap túllépés nélkül minden összeget üt (a pontoont nem)",
  },

  /** The lobby's / settings' short lines. */
  summary: {
    faces: (w: number, d: number, k: number) => `B ${w}, D ${d}, K ${k}`,
    deck: (n: DeckSize) => common.cards(n),
    persian: "Két ász",
    noPersian: "Két ász nélkül",
    is21: "Két ász = 21",
    ace: { eleven: "Ász = 11", oneOrEleven: "Ász = 1 vagy 11" } as Record<Rules["ace"], string>,
  },

  /** The rules in one or two sentences ("Röviden"). */
  preview: {
    bank: (bankWinsTies: boolean) =>
      `Mindenki a bank ellen játszik: lapokat kér, majd azt mondja: „Elég”. A bank lép utoljára${bankWinsTies ? ", és döntetlennél nyer" : ""}.`,
    family: "Mindenki lapokat kér, és amikor akarja, azt mondja: „Elég”. A pontot az kapja, aki túllépés nélkül a legközelebb van a 21-hez.",
    persian: " A két ász mindent üt.",
    is21: " A két ász 21-et ér.",
    bankTo17: " A bank 17-ig húz.",
    oneOrEleven: " Az ász 1-et vagy 11-et ér.",
  },

  /** The "Szabályok" screen. */
  screen: {
    /** The fonts' licences (the texts themselves stay in English). */
    licenses: "Betűtípus-licencek",
    title: "Szabályok",
    topic: "Téma",
    variants: "Változatok",
    goal: "Cél",
    goalText:
      "Az Oczko a huszonegy lengyel változata. Próbálj minél közelebb kerülni a 21-hez, de ne lépd túl. Sorban mindenki azt mondja: „Kérek” (kap egy lapot) vagy „Elég” (befejezi).",
    flow: "Menet",
    flowTexts: [
      "Mindenki kap egy kezdő lapot. Sorban játszotok, attól balra kezdve, aki oszt. A kör végén mindenki felfedi a lapjait.",
      "A pontot az kapja, aki túllépés nélkül a legközelebb van a 21-hez; a két ász mindent üt. Döntetlennél a beállítás dönt: pont mindenkinek vagy senkinek.",
    ],
    banker: "Bankár",
    bankerTexts: [
      "Egy ember a bank. A többiek csak a bankkal játszanak egy-egy párharcot; a bank lép utoljára, és látja, kinek lett túl sok.",
      "A magasabb érték nyeri a párharcot (+1). Akinek túl sok lett, az mindig veszít; ha a banknak lesz túl sok, mindenki ellen veszít, aki nem lépte túl a 21-et. A döntetlen általában a banké.",
      "A bank pontot kap, ha több párharcot nyer, mint amennyit elveszít (vagy — a beállítástól függően — minden megnyert párharcért egy pontot). A bank minden körben továbbkerül a következő emberhez.",
    ],
    houseVariants: "Házi változatok",
    houseVariantsTexts: [
      "A figurák értéke (B, D, K), 52, 32 vagy 24 lapos pakli, az ász 11-et ér, vagy tetszés szerint 1-et vagy 11-et, két ász igen vagy nem, egy vagy két kezdő lap, lapkorlát a kézben, a döntetlen és a bank szabályai.",
      "Mindezt beállíthatod a „Házi szabályaid” menüben — és minden új játéknál.",
    ],
    examples: {
      persian: { title: "Két ász", text: "Mindent üt." },
      oczko: { title: "Oczko", text: "Pontosan 21." },
      fura: { title: "Túl sok", text: "21 fölött — a kéz veszít." },
      aces21: { title: "Két ász", text: "21-et ér." },
    } as Record<"persian" | "oczko" | "fura" | "aces21", { title: string; text: string }>,
    /** An example hand for screen readers. */
    exampleA11y: (title: string, text: string) => `${title}: ${text}`,
    cardValues: "Lapértékek",
    pipRanks: "2–10",
    byPips: "névérték",
    aceShort: { eleven: "11", oneOrEleven: "1/11" } as Record<Rules["ace"], string>,
    valueA11y: (card: string, value: string) => `${card}: ${value}`,
    yourSettings: "A te beállításaid — a „Házi szabályaid” menüben módosíthatod őket.",
    showExample: "Mutasd egy példán",
  },
};
