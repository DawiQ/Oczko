// Bosnian-Croatian-Serbian: texts of the "rules" area — house-rule options
// (editor), the rules in words (summaries, preview) and the "Pravila" screen.
import type { PresetId } from "../../engine/presets";
import type { DeckSize } from "../../engine/cards";
import type { Rules, TwoAces } from "../../engine/rules";
import type { pl } from "../pl";
import { common } from "./common";

type Option = { label: string; sub?: string };

export const rules: typeof pl.rules = {
  /** Game modes (segments, summaries). */
  modes: { family: "Svi protiv svih", bank: "S bankarom" } as Record<Rules["mode"], string>,

  editor: {
    mode: "Način",
    modeA11y: "Način igre",
    modeSubs: { family: "bez bankara", bank: "svi protiv banka" } as Record<Rules["mode"], string>,
    faces: "Figure",
    facesA11y: "Vrijednosti figura",
    /** Under the face presets: which cards they are. */
    facesSub: "J · Q · K",
    custom: "Po želji",
    customSub: "bilo koje",
    /** Face names by rank 11..13. */
    faceNames: { 11: "Dečko", 12: "Dama", 13: "Kralj" } as Record<11 | 12 | 13, string>,
    deck: "Špil",
    deckOptions: {
      52: { label: common.cards(52) },
      32: { label: common.cards(32), sub: "od sedmice" },
      36: { label: common.cards(36), sub: "od šestice" },
      24: { label: common.cards(24), sub: "od devetke" },
    } as Record<DeckSize, Option>,
    twoAces: "Dva asa",
    twoAcesOptions: { wins: "Pobjeđuju", is21: "Vrijede 21", off: "Bez pravila" } as Record<TwoAces, string>,
    /** Regional rule sets (PLAN.md §13): name and where it is played. */
    preset: "Skup pravila",
    presetCustom: "Vlastita",
    presets: {
      oczko: { name: "Oczko", sub: "Poljska" },
      siebzehnUndVier: { name: "17 und 4", sub: "Njemačka, Austrija" },
      okoBere: { name: "Oko bere", sub: "Češka, Slovačka" },
      ajnc: { name: "Ajnc", sub: "Balkan" },
      ochko: { name: "Očko", sub: "Ukrajina, Kazahstan" },
    } as Record<PresetId, { name: string; sub: string }>,
    ace: "As",
    aceA11y: "Vrijednost asa",
    aceOptions: { eleven: "11", oneOrEleven: "1 ili 11" } as Record<Rules["ace"], string>,
    startCards: "Karte na početku",
    startCardsOptions: { 1: common.cards(1), 2: common.cards(2) } as Record<Rules["startCards"], string>,
    maxCards: "Najviše karata u ruci",
    noLimit: "Bez",
    familyTie: "Neriješeno",
    familyTieA11y: "Neriješeno u igri svi protiv svih",
    familyTieOptions: { allScore: "Svima po bod", noneScore: "Bez bodova" } as Record<Rules["familyTie"], string>,
    bankTie: "Neriješeno s bankom",
    bankTieOptions: { bankWins: "Bank pobjeđuje", nobody: "Bez pobjednika" } as Record<Rules["bankTie"], string>,
    bankScoring: "Bodovi banka",
    bankScoringOptions: {
      majority: { label: "Za većinu", sub: "1 bod po rundi" },
      perDuel: { label: "Po dvoboju", sub: "1 bod za svaki" },
    } as Record<Rules["bankScoring"], Option>,
    bankRotation: "Bank prelazi",
    bankRotationA11y: "Kada bank prelazi dalje",
    bankRotationOptions: { everyRound: "Svake runde", onPersian: "Nakon dva asa", fixed: "Nikad" } as Record<Rules["bankRotation"], string>,
    playerBustLoses: "Igračeva tropa uvijek gubi",
    playerBustLosesSub: "I kad i bank ima tropu",
    bustRevealed: "Tropa se vidi odmah",
    bustRevealedSub: "Karte s tropom otvaraju se odmah",
    bankTo17: "Bank vuče do 17",
    bankTo17Sub: "Ispod 17 mora vući, od 17 staje",
  },

  /** The lobby's / settings' short lines. */
  summary: {
    faces: (w: number, d: number, k: number) => `J ${w}, Q ${d}, K ${k}`,
    deck: (n: DeckSize) => common.cards(n),
    persian: "Dva asa pobjeđuju",
    noPersian: "Bez pravila dva asa",
    is21: "Dva asa = 21",
    ace: { eleven: "As = 11", oneOrEleven: "As = 1 ili 11" } as Record<Rules["ace"], string>,
  },

  /** The rules in one or two sentences ("Ukratko"). */
  preview: {
    bank: (bankWinsTies: boolean) =>
      `Svi igraju protiv banka: vuku karte i kažu „Dosta“, a bank odgovara na kraju${bankWinsTies ? " i pobjeđuje pri neriješenom" : ""}.`,
    family: "Svi vuku karte i kažu „Dosta“ kad hoće. Bod ide rezultatu najbližem 21 bez trope.",
    persian: " Dva asa pobjeđuju sve.",
    is21: " Dva asa vrijede kao 21.",
    bankTo17: " Bank vuče do 17.",
    oneOrEleven: " As vrijedi 1 ili 11.",
  },

  /** The "Pravila" screen. */
  screen: {
    /** The fonts' licences (the texts themselves stay in English). */
    licenses: "Licence fontova",
    title: "Pravila",
    topic: "Tema",
    variants: "Varijante",
    goal: "Cilj",
    goalText: "Skupi što bliže 21, ali ne više — kao u ajncu. Svi redom kažu „Još“ (uzimaju kartu) ili „Dosta“ (završavaju).",
    flow: "Tok igre",
    flowTexts: [
      "Svi dobiju kartu za početak. Igra se redom, počevši od osobe lijevo od one koja dijeli. Na kraju runde svi otkrivaju karte.",
      "Bod ide rezultatu najbližem 21 bez trope; dva asa (suvi ajnc) pobjeđuju sve. Kod neriješenog vrijedi ono što je izabrano: bod za svakoga ili ni za koga.",
    ],
    banker: "Bankar",
    bankerTexts: [
      "Jedna osoba je bank. Svaki igrač igra dvoboj samo s bankom; bank igra posljednji i vidi koji igrači imaju tropu.",
      "Veći rezultat pobjeđuje u dvoboju (+1). Igračeva tropa uvijek gubi; tropa banka gubi od svakoga bez trope. Neriješeno obično ide banku.",
      "Bank osvaja bod kad pobijedi u više dvoboja nego što izgubi (ili — po izboru u pravilima — bod za svaku pobjedu u dvoboju). Bank svake runde prelazi na sljedeću osobu.",
    ],
    houseVariants: "Kućne varijante",
    houseVariantsTexts: [
      "Vrijednosti figura (J, Q, K), špil od 52, 32 ili 24 karte, as kao 11 ili kao 1 ili 11, dva asa da ili ne, jedna ili dvije karte na početku, najviše karata u ruci, pravila za neriješeno i za bank.",
      "Sve to biraš pod „Tvoja kućna pravila“ i pri svakoj novoj igri.",
    ],
    examples: {
      persian: { title: "Dva asa", text: "Pobjeđuju sve." },
      oczko: { title: "Oczko", text: "Ravno 21." },
      fura: { title: "Tropa", text: "Više od 21 — ruka gubi." },
      aces21: { title: "Dva asa", text: "Vrijede kao 21." },
    } as Record<"persian" | "oczko" | "fura" | "aces21", { title: string; text: string }>,
    /** An example hand for screen readers. */
    exampleA11y: (title: string, text: string) => `${title}: ${text}`,
    cardValues: "Vrijednosti karata",
    pipRanks: "2–10",
    byPips: "po broju",
    aceShort: { eleven: "11", oneOrEleven: "1/11" } as Record<Rules["ace"], string>,
    valueA11y: (card: string, value: string) => `${card}: ${value}`,
    yourSettings: "Tvoj izbor — mijenjaš ga pod „Tvoja kućna pravila“.",
    showExample: "Pokaži na primjeru",
  },
};
