// Hungarian: texts of the "app" area (the root: resume, confirms, daily
// limits, the settings' extra rows).
import type { pl } from "../pl";
import { common } from "./common";

export const app: typeof pl.app = {
  resume: {
    title: (round: number) => `${round}. kör`,
    family: "Családi játék",
    bank: "Bankárral",
    training: "gyakorlás",
    single: "egy kör",
    /** "10 pontig" */
    target: (points: number) => `${common.points(points)}ig`,
    /** "Családi játék · 10 pontig · Te, Olga, Márk" */
    line: (mode: string, kind: string, names: string[]) => `${mode} · ${kind} · ${names.join(", ")}`,
  },
  replaceSaved: {
    title: "Van egy befejezetlen partid",
    message: "Az új játék felülírja a mentettet — azt már nem lehet majd folytatni.",
    confirm: "Új játék",
  },
  /** A daily limit reached (a rewarded ad on request, or Oczko Pro). */
  limits: {
    analysis: {
      title: "A mai elemzés elfogyott",
      text: "Oczko Pro nélkül naponta egy partielemzés jár. Holnap jön a következő — vagy most még egy, egy reklámért cserébe.",
      proLabel: "Korlátlan elemzés",
      adLabel: "+1 elemzés ma",
    },
    bigTable: {
      title: "Asztal 7–8 főnek",
      text: "Oczko Pro nélkül naponta egy nagy asztal jár. Ma már volt — a következő egy reklámért cserébe, vagy korlátlanul az Oczko Pro csomaggal.",
      proLabel: "Korlátlan nagy asztalok",
      adLabel: "+1 nagy asztal ma",
    },
    hints: {
      title: "Edzői tanácsok",
      text: "Oczko Pro nélkül naponta három tanács jár. A következőt egy reklámért kapod — csak akkor nézed meg, ha szeretnéd.",
      proLabel: "Korlátlan edző",
      adLabel: "+1 tanács ma",
    },
  },
  /** Settings rows of Oczko Pro, looks, ads' privacy and codes. */
  extra: {
    looks: "Megjelenés",
    looksSub: "Paklik, posztók és hátlapok",
    hints: "Edzői tanácsok",
    hintsSub: (left: number) => `Mára maradt: ${left}. Továbbiak reklámért vagy az Oczko Pro csomaggal`,
    pro: "Oczko Pro",
    proActive: "Aktív — előfizetés kezelése",
    proSub: "Korlátlan edző és elemzés, nagy asztalok, megjelenés",
    code: "Van kódom",
    codeSub: "Oczko Pro promóciós kód",
    adsPrivacy: "Reklámok és adatvédelem",
    adsPrivacySub: "Hozzájárulás a reklámokhoz (EU)",
  },
};
