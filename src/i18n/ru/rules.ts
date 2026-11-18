// Russian: texts of the "rules" area — house-rule options (editor), the rules
// in words (summaries, preview) and the "Правила" screen.
import type { PresetId } from "../../engine/presets";
import type { DeckSize } from "../../engine/cards";
import type { Rules, TwoAces } from "../../engine/rules";
import type { pl } from "../pl";
import { common } from "./common";

type Option = { label: string; sub?: string };

export const rules: typeof pl.rules = {
  /** Game modes (segments, summaries). */
  modes: { family: "Семейная игра", bank: "С банкиром" } as Record<Rules["mode"], string>,

  editor: {
    mode: "Режим",
    modeA11y: "Режим игры",
    modeSubs: { family: "все против всех", bank: "каждый против банка" } as Record<Rules["mode"], string>,
    faces: "Фигуры",
    facesA11y: "Стоимость фигур",
    /** Under the face presets: which cards they are. */
    facesSub: "В · Д · К",
    custom: "Свои",
    customSub: "любые",
    /** Face names by rank 11..13. */
    faceNames: { 11: "Валет", 12: "Дама", 13: "Король" } as Record<11 | 12 | 13, string>,
    deck: "Колода",
    deckOptions: {
      52: { label: common.cards(52) },
      32: { label: common.cards(32), sub: "от семёрки" },
      36: { label: common.cards(36), sub: "от шестёрки" },
      24: { label: common.cards(24), sub: "от девятки" },
    } as Record<DeckSize, Option>,
    twoAces: "Два туза",
    twoAcesOptions: { wins: "Выигрывают", is21: "Это 21", off: "Без правила" } as Record<TwoAces, string>,
    /** Regional rule sets (PLAN.md §13): name and where it is played. */
    preset: "Набор правил",
    presetCustom: "Свои",
    presets: {
      oczko: { name: "Oczko", sub: "Польша" },
      siebzehnUndVier: { name: "17 und 4", sub: "Германия, Австрия" },
      okoBere: { name: "Oko bere", sub: "Чехия, Словакия" },
      ajnc: { name: "Ajnc", sub: "Балканы" },
      ochko: { name: "Двадцать одно", sub: "Украина, Казахстан" },
    } as Record<PresetId, { name: string; sub: string }>,
    ace: "Туз",
    aceA11y: "Стоимость туза",
    aceOptions: { eleven: "11", oneOrEleven: "1 или 11" } as Record<Rules["ace"], string>,
    startCards: "Карты на старте",
    startCardsOptions: { 1: common.cards(1), 2: common.cards(2) } as Record<Rules["startCards"], string>,
    maxCards: "Лимит карт в руке",
    noLimit: "Нет",
    familyTie: "Ничья",
    familyTieA11y: "Ничья в семейной игре",
    familyTieOptions: { allScore: "Балл каждому", noneScore: "Без баллов" } as Record<Rules["familyTie"], string>,
    bankTie: "Ничья с банком",
    bankTieOptions: { bankWins: "Выигрывает банк", nobody: "Никто" } as Record<Rules["bankTie"], string>,
    bankScoring: "Баллы банка",
    bankScoringOptions: {
      majority: { label: "За большинство", sub: "1 балл за раунд" },
      perDuel: { label: "За поединок", sub: "1 балл за каждый" },
    } as Record<Rules["bankScoring"], Option>,
    bankRotation: "Банк переходит",
    bankRotationA11y: "Когда переходит банк",
    bankRotationOptions: { everyRound: "Каждый раунд", onPersian: "После двух тузов", fixed: "Никогда" } as Record<Rules["bankRotation"], string>,
    playerBustLoses: "Перебор игрока проигрывает всегда",
    playerBustLosesSub: "Даже если у банка тоже перебор",
    bustRevealed: "Перебор виден сразу",
    bustRevealedSub: "Карты с перебором открываются сразу",
    bankTo17: "Банк берёт до 17",
    bankTo17Sub: "Ниже 17 обязан брать, с 17 останавливается",
  },

  /** The lobby's / settings' short lines. */
  summary: {
    faces: (w: number, d: number, k: number) => `В ${w}, Д ${d}, К ${k}`,
    deck: (n: DeckSize) => common.cards(n),
    persian: "Два туза",
    noPersian: "Без правила двух тузов",
    is21: "Два туза = 21",
    ace: { eleven: "Туз = 11", oneOrEleven: "Туз = 1 или 11" } as Record<Rules["ace"], string>,
  },

  /** The rules in one or two sentences ("Коротко"). */
  preview: {
    bank: (bankWinsTies: boolean) =>
      `Каждый играет против банка: берёт карты и говорит «Хватит», банк отвечает последним${bankWinsTies ? " и выигрывает ничьи" : ""}.`,
    family: "Каждый берёт карты и говорит «Хватит», когда захочет. Балл получает сумма, ближайшая к 21 без перебора.",
    persian: " Два туза бьют всё.",
    is21: " Два туза считаются как 21.",
    bankTo17: " Банк берёт до 17.",
    oneOrEleven: " Туз считается за 1 или 11.",
  },

  /** The "Правила" screen. */
  screen: {
    /** The fonts' licences (the texts themselves stay in English). */
    licenses: "Лицензии шрифтов",
    title: "Правила",
    topic: "Тема",
    variants: "Варианты",
    goal: "Цель",
    goalText: "Набери сумму как можно ближе к 21, но не больше. Каждый по очереди говорит «Ещё» (берёт карту) или «Хватит» (заканчивает).",
    flow: "Ход раунда",
    flowTexts: [
      "Каждый получает карту на старте. Ходят по очереди, начиная слева от того, кто раздаёт. В конце раунда все открывают карты.",
      "Балл получает сумма, ближайшая к 21 без перебора; два туза (золотое очко) бьют всё. При ничьей — по настройкам: балл каждому или никому.",
    ],
    banker: "Банкир",
    bankerTexts: [
      "Один человек — банк. Каждый игрок играет поединок только с банком; банк ходит последним и видит, у кого перебор.",
      "Поединок выигрывает тот, у кого сумма больше (+1). Перебор игрока проигрывает всегда; перебор банка проигрывает каждому, у кого перебора нет. Ничья — обычно в пользу банка.",
      "Банк получает балл, если выигрывает больше поединков, чем проигрывает (или — по настройкам — балл за каждый выигранный поединок). Каждый раунд банк переходит к следующему человеку.",
    ],
    houseVariants: "Домашние варианты",
    houseVariantsTexts: [
      "Стоимость фигур (В, Д, К), колода из 52, 32 или 24 карт, туз за 11 либо за 1 или 11, два туза — да или нет, одна или две карты на старте, лимит карт в руке, правила ничьих и банка.",
      "Всё это настраивается в разделе «Твои домашние правила» и перед каждой новой игрой.",
    ],
    examples: {
      persian: { title: "Два туза", text: "Бьют всё." },
      oczko: { title: "Двадцать одно", text: "Ровно 21." },
      fura: { title: "Перебор", text: "Больше 21 — рука проигрывает." },
      aces21: { title: "Два туза", text: "Считаются как 21." },
    } as Record<"persian" | "oczko" | "fura" | "aces21", { title: string; text: string }>,
    /** An example hand for screen readers. */
    exampleA11y: (title: string, text: string) => `${title}: ${text}`,
    cardValues: "Стоимость карт",
    pipRanks: "2–10",
    byPips: "по номиналу",
    aceShort: { eleven: "11", oneOrEleven: "1/11" } as Record<Rules["ace"], string>,
    valueA11y: (card: string, value: string) => `${card}: ${value}`,
    yourSettings: "Твои настройки — изменить их можно в разделе «Твои домашние правила».",
    showExample: "Показать на примере",
  },
};
