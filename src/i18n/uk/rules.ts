// Ukrainian: texts of the "rules" area — house-rule options (editor), the
// rules in words (summaries, preview) and the "Правила" screen.
import type { PresetId } from "../../engine/presets";
import type { DeckSize } from "../../engine/cards";
import type { Rules, TwoAces } from "../../engine/rules";
import type { pl } from "../pl";
import { common } from "./common";

type Option = { label: string; sub?: string };

export const rules: typeof pl.rules = {
  /** Game modes (segments, summaries). */
  modes: { family: "Сімейна гра", bank: "З банкіром" } as Record<Rules["mode"], string>,

  editor: {
    mode: "Режим",
    modeA11y: "Режим гри",
    modeSubs: { family: "усі проти всіх", bank: "кожен грає з банком" } as Record<Rules["mode"], string>,
    faces: "Фігури",
    facesA11y: "Значення фігур",
    /** Under the face presets: which cards they are. */
    facesSub: "В · Д · К",
    custom: "Свої",
    customSub: "будь-які",
    /** Face names by rank 11..13. */
    faceNames: { 11: "Валет", 12: "Дама", 13: "Король" } as Record<11 | 12 | 13, string>,
    deck: "Колода",
    deckOptions: {
      52: { label: common.cards(52) },
      32: { label: common.cards(32), sub: "від сімки" },
      24: { label: common.cards(24), sub: "від дев'ятки" },
    } as Record<DeckSize, Option>,
    twoAces: "Два тузи",
    twoAcesOptions: { wins: "Виграють", is21: "Це 21", off: "Без правила" } as Record<TwoAces, string>,
    /** Regional rule sets (PLAN.md §13): name and where it is played. */
    preset: "Набір правил",
    presetCustom: "Власні",
    presets: {
      oczko: { name: "Oczko", sub: "Польща" },
      siebzehnUndVier: { name: "17 und 4", sub: "Німеччина, Австрія" },
      okoBere: { name: "Oko bere", sub: "Чехія, Словаччина" },
      ajnc: { name: "Ajnc", sub: "Балкани" },
    } as Record<PresetId, { name: string; sub: string }>,
    ace: "Туз",
    aceA11y: "Значення туза",
    aceOptions: { eleven: "11", oneOrEleven: "1 або 11" } as Record<Rules["ace"], string>,
    startCards: "Карти на початку",
    startCardsOptions: { 1: common.cards(1), 2: common.cards(2) } as Record<Rules["startCards"], string>,
    maxCards: "Ліміт карт у руці",
    noLimit: "Без",
    familyTie: "Нічия",
    familyTieA11y: "Нічия в сімейній грі",
    familyTieOptions: { allScore: "Бал кожному", noneScore: "Без балів" } as Record<Rules["familyTie"], string>,
    bankTie: "Нічия з банком",
    bankTieOptions: { bankWins: "Виграє банк", nobody: "Ніхто" } as Record<Rules["bankTie"], string>,
    bankScoring: "Бали банку",
    bankScoringOptions: {
      majority: { label: "За більшість", sub: "1 бал за раунд" },
      perDuel: { label: "За поєдинок", sub: "1 бал за кожен" },
    } as Record<Rules["bankScoring"], Option>,
    bankRotation: "Банк переходить",
    bankRotationA11y: "Коли переходить банк",
    bankRotationOptions: { everyRound: "Щораунду", onPersian: "Після тузів", fixed: "Постійний" } as Record<Rules["bankRotation"], string>,
    playerBustLoses: "Перебір гравця програє завжди",
    playerBustLosesSub: "Навіть коли в банку теж перебір",
    bustRevealed: "Перебір видно відразу",
    bustRevealedSub: "Карти з перебором відкриваються одразу",
  },

  /** The lobby's / settings' short lines. */
  summary: {
    faces: (w: number, d: number, k: number) => `В ${w}, Д ${d}, К ${k}`,
    deck: (n: DeckSize) => common.cards(n),
    persian: "Два тузи",
    noPersian: "Без двох тузів",
    is21: "Два тузи = 21",
    ace: { eleven: "Туз — 11", oneOrEleven: "Туз — 1 або 11" } as Record<Rules["ace"], string>,
  },

  /** The rules in one or two sentences ("Коротко"). */
  preview: {
    bank: (bankWinsTies: boolean) =>
      `Кожен грає з банком: бере карти й каже «Досить», банк відповідає наприкінці${bankWinsTies ? " і виграє нічиї" : ""}.`,
    family: "Кожен бере карти й каже «Досить», коли хоче. Бал отримує результат, найближчий до 21 без перебору.",
    persian: " Два тузи виграють у будь-якої руки.",
    is21: " Два тузи рахуються як 21.",
    oneOrEleven: " Туз рахується як 1 або 11.",
  },

  /** The "Правила" screen. */
  screen: {
    /** The fonts' licences (the texts themselves stay in English). */
    licenses: "Ліцензії шрифтів",
    title: "Правила",
    topic: "Тема",
    variants: "Варіанти",
    goal: "Мета",
    goalText:
      "Набери якомога ближче до 21 очка, але не більше — як у знайомій грі «двадцять одне». Кожен по черзі каже «Ще» (бере карту) або «Досить» (зупиняється).",
    flow: "Перебіг",
    flowTexts: [
      "На початку кожен отримує карту. Ходять по черзі, починаючи ліворуч від того, хто роздає. Наприкінці раунду всі відкривають карти.",
      "Бал отримує результат, найближчий до 21 без перебору; два тузи (золоте очко) виграють у будь-якої руки. Нічия — за налаштуваннями: бал кожному або нікому.",
    ],
    banker: "Банкір",
    bankerTexts: [
      "Одна особа тримає банк. Кожен гравець грає поєдинок лише з банком; банк ходить останнім і бачить, у кого перебір.",
      "Вищий результат виграє поєдинок (+1). Перебір гравця програє завжди; перебір банку програє кожному, у кого перебору немає. Нічия — зазвичай на користь банку.",
      "Банк отримує бал, коли виграє більше поєдинків, ніж програє (або — за налаштуваннями — бал за кожен виграний поєдинок). Щораунду банк переходить до наступної особи.",
    ],
    houseVariants: "Домашні варіанти",
    houseVariantsTexts: [
      "Значення фігур (В, Д, К), колода на 52, 32 або 24 карти, туз за 11 або за 1 чи 11, два тузи — так чи ні, одна або дві карти на початку, ліміт карт у руці, правила нічиєї та банку.",
      "Усе це налаштуєш у розділі «Твої домашні правила» і перед кожною новою грою.",
    ],
    examples: {
      persian: { title: "Два тузи", text: "Виграють у будь-якої руки." },
      oczko: { title: "Очко", text: "Рівно 21." },
      fura: { title: "Перебір", text: "Більше ніж 21 — рука програє." },
    } as Record<"persian" | "oczko" | "fura", { title: string; text: string }>,
    /** An example hand for screen readers. */
    exampleA11y: (title: string, text: string) => `${title}: ${text}`,
    cardValues: "Значення карт",
    pipRanks: "2–10",
    byPips: "за номіналом",
    aceShort: { eleven: "11", oneOrEleven: "1/11" } as Record<Rules["ace"], string>,
    valueA11y: (card: string, value: string) => `${card}: ${value}`,
    yourSettings: "Твої налаштування — змінити їх можна в розділі «Твої домашні правила».",
    showExample: "Показати на прикладі",
  },
};
