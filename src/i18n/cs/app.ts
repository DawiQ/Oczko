// Czech: texts of the "app" area (the root: resume, confirms, daily limits,
// the settings' extra rows).
import type { pl } from "../pl";
import { toPoints } from "./common";

export const app: typeof pl.app = {
  resume: {
    title: (round: number) => `Kolo ${round}`,
    family: "Rodinná hra",
    bank: "S bankéřem",
    training: "trénink",
    single: "jedno kolo",
    target: (points: number) => toPoints(points),
    /** "Rodinná hra · do 10 bodů · Ty, Olina, Marek" */
    line: (mode: string, kind: string, names: string[]) => `${mode} · ${kind} · ${names.join(", ")}`,
  },
  replaceSaved: {
    title: "Máš rozehranou partii",
    message: "Nová hra nahradí uloženou — tu pak už nepůjde obnovit.",
    confirm: "Začít novou",
  },
  /** A daily limit reached (a rewarded ad on request, or Oczko Pro). */
  limits: {
    analysis: {
      title: "Dnešní analýza je vyčerpaná",
      text: "Bez Oczko Pro je jedna analýza partie denně. Zítra další — nebo ještě jedna hned teď, za reklamu.",
      proLabel: "Analýza bez limitu",
      adLabel: "+1 analýza dnes",
    },
    bigTable: {
      title: "Stůl pro 7–8 lidí",
      text: "Bez Oczko Pro je jeden velký stůl denně. Dnes už byl — další za reklamu nebo v Oczko Pro.",
      proLabel: "Velké stoly bez limitu",
      adLabel: "+1 velký stůl dnes",
    },
    hints: {
      title: "Rady trenéra",
      text: "Bez Oczko Pro jsou tři rady denně. Další dostaneš za reklamu — pustíš si ji, jen když chceš.",
      proLabel: "Trenér bez limitu",
      adLabel: "+1 rada dnes",
    },
  },
  /** Settings rows of Oczko Pro, looks, ads' privacy and codes. */
  extra: {
    looks: "Vzhled",
    looksSub: "Karty, sukna a rubové strany",
    hints: "Rady trenéra",
    hintsSub: (left: number) => `Dnes zbývá: ${left}. Víc za reklamu nebo v Oczko Pro`,
    pro: "Oczko Pro",
    proActive: "Aktivní — spravovat předplatné",
    proSub: "Trenér a analýza bez limitu, velké stoly, vzhled",
    code: "Mám kód",
    codeSub: "Propagační kód Oczko Pro",
    adsPrivacy: "Soukromí u reklam",
    adsPrivacySub: "Souhlasy s reklamami (EU)",
  },
};
