// English: texts of the "rules" area — house-rule options (editor), the rules
// in words (summaries, preview) and the "Rules" screen.
import type { DeckSize } from "../../engine/cards";
import type { Rules } from "../../engine/rules";
import type { pl } from "../pl";
import { common } from "./common";

type Option = { label: string; sub?: string };

export const rules: typeof pl.rules = {
  /** Game modes (segments, summaries). */
  modes: { family: "Family game", bank: "With a banker" } as Record<Rules["mode"], string>,

  editor: {
    mode: "Mode",
    modeA11y: "Game mode",
    modeSubs: { family: "everyone vs everyone", bank: "everyone vs the bank" } as Record<Rules["mode"], string>,
    faces: "Face cards",
    facesA11y: "Face card values",
    /** Under the face presets: which cards they are. */
    facesSub: "J · Q · K",
    custom: "Custom",
    customSub: "any values",
    /** Face names by rank 11..13. */
    faceNames: { 11: "Jack", 12: "Queen", 13: "King" } as Record<11 | 12 | 13, string>,
    deck: "Deck",
    deckOptions: {
      52: { label: common.cards(52) },
      32: { label: common.cards(32), sub: "sevens up" },
      24: { label: common.cards(24), sub: "nines up" },
    } as Record<DeckSize, Option>,
    persian: "Two aces win",
    yes: "Yes",
    no: "No",
    ace: "Ace",
    aceA11y: "Ace value",
    aceOptions: { eleven: "11", oneOrEleven: "1 or 11" } as Record<Rules["ace"], string>,
    startCards: "Starting cards",
    startCardsOptions: { 1: common.cards(1), 2: common.cards(2) } as Record<Rules["startCards"], string>,
    maxCards: "Cards per hand",
    noLimit: "No limit",
    familyTie: "Tie",
    familyTieA11y: "Tie in the family game",
    familyTieOptions: { allScore: "A point each", noneScore: "Nobody scores" } as Record<Rules["familyTie"], string>,
    bankTie: "Tie with the bank",
    bankTieOptions: { bankWins: "Bank wins", nobody: "Nobody" } as Record<Rules["bankTie"], string>,
    bankScoring: "Bank's points",
    bankScoringOptions: {
      majority: { label: "By majority", sub: "1 pt per round" },
      perDuel: { label: "Per duel", sub: "1 pt per duel won" },
    } as Record<Rules["bankScoring"], Option>,
    bankRotation: "Bank passes",
    bankRotationA11y: "When the bank passes on",
    bankRotationOptions: { everyRound: "Every round", onPersian: "After two aces", fixed: "Never" } as Record<Rules["bankRotation"], string>,
    playerBustLoses: "A player's bust always loses",
    playerBustLosesSub: "Even when the bank is bust too",
    bustRevealed: "Busts are shown at once",
    bustRevealedSub: "A bust hand is turned face up right away",
  },

  /** The lobby's / settings' short lines. */
  summary: {
    faces: (w: number, d: number, k: number) => `J ${w}, Q ${d}, K ${k}`,
    deck: (n: DeckSize) => common.cards(n),
    persian: "Two aces win",
    noPersian: "No two-aces rule",
    ace: { eleven: "Ace = 11", oneOrEleven: "Ace = 1 or 11" } as Record<Rules["ace"], string>,
  },

  /** The rules in one or two sentences ("In short"). */
  preview: {
    bank: (bankWinsTies: boolean) =>
      `Everyone plays against the bank: draw cards, then say “Stay”. The bank answers last${bankWinsTies ? " and wins ties" : ""}.`,
    family: "Everyone draws cards and says “Stay” whenever they like. The total closest to 21 without going bust gets the point.",
    persian: " Two aces beat everything.",
    oneOrEleven: " An ace counts as 1 or 11.",
  },

  /** The "Rules" screen. */
  screen: {
    /** The fonts' licences (the texts themselves stay in English). */
    licenses: "Font licences",
    title: "Rules",
    topic: "Topic",
    variants: "Variants",
    goal: "Goal",
    goalText: "Get as close to 21 as you can, but not over. Take turns saying “Draw” (take a card) or “Stay” (stop there).",
    flow: "A round",
    flowTexts: [
      "Everyone gets a starting card. Turns go round the table, starting left of whoever deals. At the end of the round, everyone shows their cards.",
      "The total closest to 21 without going bust gets a point; two aces (perskie oczko) beat everything. A tie depends on your settings: a point for each, or for nobody.",
    ],
    banker: "The banker",
    bankerTexts: [
      "One person is the bank. Every other player plays a duel against the bank only; the bank moves last and can see who is bust.",
      "The higher total wins the duel (+1). A bust player always loses; a bust bank loses to everyone who isn't bust. A tie usually goes to the bank.",
      "The bank scores a point when it wins more duels than it loses (or, if you set it so, a point for every duel won). Each round, the bank passes to the next person.",
    ],
    houseVariants: "House variants",
    houseVariantsTexts: [
      "Face card values (J, Q, K), a deck of 52, 32 or 24 cards, the ace as 11 or as 1 or 11, two aces on or off, one or two starting cards, a hand limit, tie and bank rules.",
      "You can set all of this in “Your house rules” and for each new game.",
    ],
    examples: {
      persian: { title: "Two aces", text: "Beats everything." },
      oczko: { title: "Oczko", text: "Exactly 21." },
      fura: { title: "Bust", text: "Over 21 — the hand loses." },
    } as Record<"persian" | "oczko" | "fura", { title: string; text: string }>,
    /** An example hand for screen readers. */
    exampleA11y: (title: string, text: string) => `${title}: ${text}`,
    cardValues: "Card values",
    pipRanks: "2–10",
    byPips: "as marked",
    aceShort: { eleven: "11", oneOrEleven: "1/11" } as Record<Rules["ace"], string>,
    valueA11y: (card: string, value: string) => `${card}: ${value}`,
    yourSettings: "Your settings — change them in “Your house rules”.",
    showExample: "Show me an example",
  },
};
