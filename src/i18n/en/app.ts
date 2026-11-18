// English: texts of the "app" area (the root: resume, confirms, daily limits,
// the settings' extra rows).
import type { pl } from "../pl";
import { common } from "./common";

export const app: typeof pl.app = {
  resume: {
    title: (round: number) => `Round ${round}`,
    family: "Family game",
    bank: "With a banker",
    training: "practice",
    single: "single round",
    target: (points: number) => `to ${common.points(points)}`,
    /** "Family game · to 10 points · You, Ollie, Mark" */
    line: (mode: string, kind: string, names: string[]) => `${mode} · ${kind} · ${names.join(", ")}`,
  },
  replaceSaved: {
    title: "You have an unfinished match",
    message: "A new game replaces the saved one — you won't be able to resume it.",
    confirm: "Start new",
  },
  /** A daily limit reached (a rewarded ad on request, or Oczko Pro). */
  limits: {
    analysis: {
      title: "Today's analysis used",
      text: "Without Oczko Pro, you get one match analysis a day. Another one tomorrow — or one more now, for an ad.",
      proLabel: "Unlimited analysis",
      adLabel: "+1 analysis today",
    },
    bigTable: {
      title: "Table for 7–8 people",
      text: "Without Oczko Pro, you get one big table a day. You've had today's — another one for an ad or with Oczko Pro.",
      proLabel: "Unlimited big tables",
      adLabel: "+1 big table today",
    },
    hints: {
      title: "Coach hints",
      text: "Without Oczko Pro, you get three hints a day. Another one for an ad — you only watch it if you want to.",
      proLabel: "Unlimited coach",
      adLabel: "+1 hint today",
    },
  },
  /** Settings rows of Oczko Pro, looks, ads' privacy and codes. */
  extra: {
    looks: "Look",
    looksSub: "Decks, felts and backs",
    hints: "Coach hints",
    hintsSub: (left: number) => `Left today: ${left}. More for an ad or with Oczko Pro`,
    pro: "Oczko Pro",
    proActive: "Active — manage subscription",
    proSub: "Unlimited coach and analysis, big tables, looks",
    code: "I have a code",
    codeSub: "Oczko Pro promo code",
    adsPrivacy: "Ad privacy",
    adsPrivacySub: "Ad consent (EU)",
  },
};
