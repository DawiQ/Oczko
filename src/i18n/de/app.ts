// German: texts of the "app" area (the root: resume, confirms, daily limits,
// the settings' extra rows).
import type { pl } from "../pl";
import { common } from "./common";

export const app: typeof pl.app = {
  resume: {
    title: (round: number) => `Runde ${round}`,
    family: "Familienspiel",
    bank: "Mit Bankhalter",
    training: "Training",
    single: "eine Runde",
    target: (points: number) => `bis ${common.points(points)}`,
    /** "Familienspiel · bis 10 Punkte · Du, Ella, Markus" */
    line: (mode: string, kind: string, names: string[]) => `${mode} · ${kind} · ${names.join(", ")}`,
  },
  replaceSaved: {
    title: "Du hast eine offene Partie",
    message: "Ein neues Spiel ersetzt das gespeicherte — das alte lässt sich dann nicht mehr fortsetzen.",
    confirm: "Neu starten",
  },
  /** A daily limit reached (a rewarded ad on request, or Oczko Pro). */
  limits: {
    analysis: {
      title: "Heutige Analyse verbraucht",
      text: "Ohne Oczko Pro gibt es eine Partie-Analyse pro Tag. Morgen die nächste — oder jetzt noch eine, mit Werbung.",
      proLabel: "Analyse ohne Limit",
      adLabel: "+1 Analyse heute",
    },
    bigTable: {
      title: "Tisch für 7–8 Personen",
      text: "Ohne Oczko Pro gibt es einen großen Tisch pro Tag. Heute gab es schon einen — der nächste mit Werbung oder mit Oczko Pro.",
      proLabel: "Große Tische ohne Limit",
      adLabel: "+1 großer Tisch heute",
    },
    hints: {
      title: "Trainer-Tipps",
      text: "Ohne Oczko Pro gibt es drei Tipps pro Tag. Den nächsten mit Werbung — die siehst du nur, wenn du willst.",
      proLabel: "Trainer ohne Limit",
      adLabel: "+1 Tipp heute",
    },
  },
  /** Settings rows of Oczko Pro, looks, ads' privacy and codes. */
  extra: {
    looks: "Aussehen",
    looksSub: "Karten, Tischtücher und Rückseiten",
    hints: "Trainer-Tipps",
    hintsSub: (left: number) => `Heute übrig: ${left}. Mehr mit Werbung oder mit Oczko Pro`,
    pro: "Oczko Pro",
    proActive: "Aktiv — Abo verwalten",
    proSub: "Trainer und Analyse ohne Limit, große Tische, Aussehen",
    code: "Ich habe einen Code",
    codeSub: "Aktionscode für Oczko Pro",
    adsPrivacy: "Datenschutz bei Werbung",
    adsPrivacySub: "Einwilligungen für Werbung (EU)",
  },
};
