// Slovak: texts of the "app" area (the root: resume, confirms, daily limits,
// the settings' extra rows).
import type { pl } from "../pl";

/** "do 1 bodu", "do 10 bodov" (genitive after "do"). */
const toPoints = (n: number) => `do ${n} ${n === 1 ? "bodu" : "bodov"}`;

export const app: typeof pl.app = {
  resume: {
    title: (round: number) => `Kolo ${round}`,
    family: "Rodinná hra",
    bank: "S bankárom",
    training: "tréning",
    single: "jedno kolo",
    target: (points: number) => toPoints(points),
    /** "Rodinná hra · do 10 bodov · Ty, Olinka, Marek" */
    line: (mode: string, kind: string, names: string[]) => `${mode} · ${kind} · ${names.join(", ")}`,
  },
  replaceSaved: {
    title: "Máš nedohranú partiu",
    message: "Nová hra nahradí uloženú — tú už potom nebude možné obnoviť.",
    confirm: "Začať novú",
  },
  /** A daily limit reached (a rewarded ad on request, or Oczko Pro). */
  limits: {
    analysis: {
      title: "Dnešná analýza je využitá",
      text: "Bez Oczko Pro je jedna analýza partie denne. Zajtra ďalšia — alebo ešte jedna hneď, za reklamu.",
      proLabel: "Analýza bez limitu",
      adLabel: "+1 analýza dnes",
    },
    bigTable: {
      title: "Stôl pre 7–8 osôb",
      text: "Bez Oczko Pro je jeden veľký stôl denne. Dnes už bol — ďalší za reklamu alebo v Oczko Pro.",
      proLabel: "Veľké stoly bez limitu",
      adLabel: "+1 veľký stôl dnes",
    },
    hints: {
      title: "Rady trénera",
      text: "Bez Oczko Pro sú tri rady denne. Ďalšiu dostaneš za reklamu — pozrieš si ju, len keď chceš.",
      proLabel: "Tréner bez limitu",
      adLabel: "+1 rada dnes",
    },
  },
  /** Settings rows of Oczko Pro, looks, ads' privacy and codes. */
  extra: {
    looks: "Vzhľad",
    looksSub: "Karty, súkna a rubové strany",
    hints: "Rady trénera",
    hintsSub: (left: number) => `Dnes zostáva: ${left}. Viac za reklamu alebo v Oczko Pro`,
    pro: "Oczko Pro",
    proActive: "Aktívne — spravovať predplatné",
    proSub: "Tréner a analýza bez limitu, veľké stoly, vzhľad",
    code: "Mám kód",
    codeSub: "Propagačný kód Oczko Pro",
    adsPrivacy: "Súkromie pri reklamách",
    adsPrivacySub: "Súhlasy s reklamami (EÚ)",
  },
};
