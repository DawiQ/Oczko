// German: texts of the "rules" area — house-rule options (editor), the rules
// in words (summaries, preview) and the "Regeln" screen.
import type { PresetId } from "../../engine/presets";
import type { DeckSize } from "../../engine/cards";
import type { Rules, TwoAces } from "../../engine/rules";
import type { pl } from "../pl";
import { common } from "./common";

type Option = { label: string; sub?: string };

export const rules: typeof pl.rules = {
  /** Game modes (segments, summaries). */
  modes: { family: "Familienspiel", bank: "Mit Bankhalter" } as Record<Rules["mode"], string>,

  editor: {
    mode: "Modus",
    modeA11y: "Spielmodus",
    modeSubs: { family: "alle gegen alle", bank: "alle gegen die Bank" } as Record<Rules["mode"], string>,
    faces: "Bilder",
    facesA11y: "Werte der Bildkarten",
    /** Under the face presets: which cards they are. */
    facesSub: "B · D · K",
    custom: "Eigene",
    customSub: "beliebig",
    /** Face names by rank 11..13. */
    faceNames: { 11: "Bube", 12: "Dame", 13: "König" } as Record<11 | 12 | 13, string>,
    deck: "Stapel",
    deckOptions: {
      52: { label: common.cards(52) },
      32: { label: common.cards(32), sub: "ab der Sieben" },
      36: { label: common.cards(36), sub: "ab der Sechs" },
      24: { label: common.cards(24), sub: "ab der Neun" },
    } as Record<DeckSize, Option>,
    twoAces: "Zwei Asse",
    twoAcesOptions: { wins: "Gewinnen", is21: "Zählen 21", off: "Keine Regel" } as Record<TwoAces, string>,
    /** Regional rule sets (PLAN.md §13): name and where it is played. */
    preset: "Regelsatz",
    presetCustom: "Eigene",
    presets: {
      oczko: { name: "Oczko", sub: "Polen" },
      siebzehnUndVier: { name: "17 und 4", sub: "Deutschland, Österreich" },
      okoBere: { name: "Oko bere", sub: "Tschechien, Slowakei" },
      ajnc: { name: "Ajnc", sub: "Balkan" },
      ochko: { name: "Ochko", sub: "Ukraine, Kasachstan" },
    } as Record<PresetId, { name: string; sub: string }>,
    ace: "Ass",
    aceA11y: "Wert des Asses",
    aceOptions: { eleven: "11", oneOrEleven: "1 oder 11" } as Record<Rules["ace"], string>,
    startCards: "Startkarten",
    startCardsOptions: { 1: common.cards(1), 2: common.cards(2) } as Record<Rules["startCards"], string>,
    maxCards: "Karten pro Hand",
    noLimit: "Kein Limit",
    familyTie: "Unentschieden",
    familyTieA11y: "Unentschieden im Familienspiel",
    familyTieOptions: { allScore: "Punkt für alle", noneScore: "Kein Punkt" } as Record<Rules["familyTie"], string>,
    bankTie: "Unentschieden mit der Bank",
    bankTieOptions: { bankWins: "Bank gewinnt", nobody: "Niemand" } as Record<Rules["bankTie"], string>,
    bankScoring: "Punkte der Bank",
    bankScoringOptions: {
      majority: { label: "Mehrheit", sub: "1 Pkt. pro Runde" },
      perDuel: { label: "Pro Duell", sub: "1 Pkt. je Sieg" },
    } as Record<Rules["bankScoring"], Option>,
    bankRotation: "Bank wechselt",
    bankRotationA11y: "Wann die Bank wechselt",
    bankRotationOptions: { everyRound: "Jede Runde", onPersian: "Nach Feuer", fixed: "Nie" } as Record<Rules["bankRotation"], string>,
    playerBustLoses: "Wer sich überkauft, verliert immer",
    playerBustLosesSub: "Auch wenn sich die Bank ebenfalls überkauft",
    bustRevealed: "Überkaufen sofort sichtbar",
    bustRevealedSub: "Überkaufte Hände werden gleich aufgedeckt",
    bankTo17: "Bank zieht bis 17",
    bankTo17Sub: "Unter 17 muss sie ziehen, ab 17 hört sie auf",
  },

  /** The lobby's / settings' short lines. */
  summary: {
    faces: (w: number, d: number, k: number) => `B ${w}, D ${d}, K ${k}`,
    deck: (n: DeckSize) => common.cards(n),
    persian: "Feuer",
    noPersian: "Ohne Feuer",
    is21: "Zwei Asse = 21",
    ace: { eleven: "Ass = 11", oneOrEleven: "Ass = 1 oder 11" } as Record<Rules["ace"], string>,
  },

  /** The rules in one or two sentences ("Kurz gesagt"). */
  preview: {
    bank: (bankWinsTies: boolean) =>
      `Alle spielen gegen die Bank: Karten ziehen, dann „Genug“ sagen. Die Bank ist zuletzt dran${bankWinsTies ? " und gewinnt bei Unentschieden" : ""}.`,
    family: "Alle ziehen Karten und sagen „Genug“, wann sie wollen. Den Punkt bekommt, wer am nächsten an 21 liegt, ohne sich zu überkaufen.",
    persian: " Zwei Asse („Feuer“) schlagen alles.",
    is21: " Zwei Asse zählen als 21.",
    bankTo17: " Die Bank zieht bis 17.",
    oneOrEleven: " Das Ass zählt 1 oder 11.",
  },

  /** The "Regeln" screen. */
  screen: {
    /** The fonts' licences (the texts themselves stay in English). */
    licenses: "Schriftlizenzen",
    title: "Regeln",
    topic: "Thema",
    variants: "Varianten",
    goal: "Ziel",
    goalText: "Komm so nah wie möglich an 21, aber nicht darüber. Reihum sagt jede Person „Noch eine“ (Karte ziehen) oder „Genug“ (aufhören).",
    flow: "Ablauf",
    flowTexts: [
      "Alle bekommen eine Startkarte. Gespielt wird reihum, beginnend links von der Person, die austeilt. Am Ende der Runde decken alle ihre Karten auf.",
      "Den Punkt bekommt, wer am nächsten an 21 liegt, ohne sich zu überkaufen; zwei Asse („Feuer“) schlagen alles. Bei Unentschieden gilt die Einstellung: Punkt für alle oder für niemanden.",
    ],
    banker: "Bankhalter",
    bankerTexts: [
      "Eine Person hält die Bank. Alle anderen spielen je ein Duell nur gegen die Bank; die Bank ist zuletzt dran und sieht, wer sich überkauft hat.",
      "Der höhere Wert gewinnt das Duell (+1). Wer sich überkauft, verliert immer; überkauft sich die Bank, verliert sie gegen alle, die sich nicht überkauft haben. Ein Unentschieden geht meist an die Bank.",
      "Die Bank bekommt einen Punkt, wenn sie mehr Duelle gewinnt als verliert (oder — je nach Einstellung — einen Punkt pro gewonnenem Duell). Jede Runde wandert die Bank zur nächsten Person.",
    ],
    houseVariants: "Hausvarianten",
    houseVariantsTexts: [
      "Werte der Bilder (B, D, K), ein Stapel mit 52, 32 oder 24 Karten, das Ass als 11 oder als 1 oder 11, Feuer ja oder nein, eine oder zwei Startkarten, ein Kartenlimit, Regeln für Unentschieden und Bank.",
      "All das stellst du unter „Deine Hausregeln“ ein — und bei jedem neuen Spiel.",
    ],
    examples: {
      persian: { title: "Feuer", text: "Zwei Asse — schlagen alles." },
      oczko: { title: "Oczko", text: "Genau 21." },
      fura: { title: "Überkauft", text: "Mehr als 21 — die Hand verliert." },
      aces21: { title: "Zwei Asse", text: "Zählen als 21." },
    } as Record<"persian" | "oczko" | "fura" | "aces21", { title: string; text: string }>,
    /** An example hand for screen readers. */
    exampleA11y: (title: string, text: string) => `${title}: ${text}`,
    cardValues: "Kartenwerte",
    pipRanks: "2–10",
    byPips: "Augenwert",
    aceShort: { eleven: "11", oneOrEleven: "1/11" } as Record<Rules["ace"], string>,
    valueA11y: (card: string, value: string) => `${card}: ${value}`,
    yourSettings: "Deine Einstellungen — ändern kannst du sie unter „Deine Hausregeln“.",
    showExample: "Am Beispiel zeigen",
  },
};
