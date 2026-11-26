// Polish: texts of the "app" area (the root: resume, confirms, daily limits,
// the settings' extra rows).
export type LimitKind = "analysis" | "bigTable" | "hints";

export const app = {
  resume: {
    title: (round: number) => `Runda ${round}`,
    family: "Rodzinne",
    bank: "Z bankierem",
    training: "trening",
    single: "jedna runda",
    target: (points: number) => `do ${points} pkt`,
    /** "Rodzinne · do 10 pkt · Ty, Ola, Marek" */
    line: (mode: string, kind: string, names: string[]) => `${mode} · ${kind} · ${names.join(", ")}`,
  },
  replaceSaved: {
    title: "Masz niedokończoną partię",
    message: "Nowa gra zastąpi zapisaną — tamtej nie będzie już można wznowić.",
    confirm: "Zacznij nową",
  },
  /** A daily limit reached (a rewarded ad on request, or Oczko Pro). */
  limits: {
    analysis: {
      title: "Dzisiejsza analiza wykorzystana",
      text: "Bez Oczko Pro jedna analiza partii dziennie. Jutro kolejna — albo jeszcze jedna teraz, za reklamę.",
      proLabel: "Analiza bez limitu",
      adLabel: "+1 analiza dziś",
    },
    bigTable: {
      title: "Stół dla 7–8 osób",
      text: "Bez Oczko Pro jeden duży stół dziennie. Dziś już był — kolejny za reklamę albo w Oczko Pro.",
      proLabel: "Duże stoły bez limitu",
      adLabel: "+1 duży stół dziś",
    },
    hints: {
      title: "Podpowiedzi trenera",
      text: "Bez Oczko Pro trzy podpowiedzi dziennie. Kolejną dostaniesz za reklamę — oglądasz ją tylko, gdy chcesz.",
      proLabel: "Trener bez limitu",
      adLabel: "+1 podpowiedź dziś",
    },
  } as Record<LimitKind, { title: string; text: string; proLabel: string; adLabel: string }>,
  /** Settings rows of Oczko Pro, looks, ads' privacy and codes. */
  extra: {
    looks: "Wygląd",
    looksSub: "Talie, sukna i rewersy",
    hints: "Podpowiedzi trenera",
    hintsSub: (left: number) => `Dziś zostało: ${left}. Więcej za reklamę albo w Oczko Pro`,
    pro: "Oczko Pro",
    proActive: "Aktywne — zarządzaj subskrypcją",
    proSub: "Trener i analiza bez limitu, duże stoły, wygląd",
    code: "Mam kod",
    codeSub: "Kod promocyjny Oczko Pro",
    adsPrivacy: "Prywatność reklam",
    adsPrivacySub: "Zgody na reklamy (UE)",
  },
};
