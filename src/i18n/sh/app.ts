// Bosnian-Croatian-Serbian: texts of the "app" area (the root: resume,
// confirms, daily limits, the settings' extra rows).
import type { pl } from "../pl";
import { toPoints } from "./common";

export const app: typeof pl.app = {
  resume: {
    title: (round: number) => `Runda ${round}`,
    family: "Svi protiv svih",
    bank: "S bankarom",
    training: "trening",
    single: "jedna runda",
    target: (points: number) => toPoints(points),
    /** "Svi protiv svih · do 10 bodova · Ti, Olja, Marko" */
    line: (mode: string, kind: string, names: string[]) => `${mode} · ${kind} · ${names.join(", ")}`,
  },
  replaceSaved: {
    title: "Imaš nezavršenu partiju",
    message: "Nova igra zamjenjuje sačuvanu — onu više nećeš moći nastaviti.",
    confirm: "Počni novu",
  },
  /** A daily limit reached (a rewarded ad on request, or Oczko Pro). */
  limits: {
    analysis: {
      title: "Današnja analiza je potrošena",
      text: "Bez Oczko Pro jedna analiza partije dnevno. Sutra nova — ili još jedna odmah, uz reklamu.",
      proLabel: "Analiza bez ograničenja",
      adLabel: "+1 analiza danas",
    },
    bigTable: {
      title: "Igra za 7–8 osoba",
      text: "Bez Oczko Pro za velikim stolom igra se jednom dnevno. Danas je to već bilo — opet uz reklamu ili s Oczko Pro.",
      proLabel: "Veliki stolovi bez ograničenja",
      adLabel: "+1 igra za 7–8 danas",
    },
    hints: {
      title: "Savjeti trenera",
      text: "Bez Oczko Pro tri savjeta dnevno. Još jedan uz reklamu — gledaš je samo kad želiš.",
      proLabel: "Trener bez ograničenja",
      adLabel: "+1 savjet danas",
    },
  },
  /** Settings rows of Oczko Pro, looks, ads' privacy and codes. */
  extra: {
    looks: "Izgled",
    looksSub: "Špilovi, čoje i poleđine",
    hints: "Savjeti trenera",
    hintsSub: (left: number) => `Danas je preostalo: ${left}. Više uz reklamu ili s Oczko Pro`,
    pro: "Oczko Pro",
    proActive: "Aktivno — upravljaj pretplatom",
    proSub: "Trener i analiza bez ograničenja, veliki stolovi, izgled",
    code: "Imam kod",
    codeSub: "Promotivni kod za Oczko Pro",
    adsPrivacy: "Privatnost reklama",
    adsPrivacySub: "Pristanak na reklame (EU)",
  },
};
