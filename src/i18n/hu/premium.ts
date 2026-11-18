// Hungarian: texts of the "premium" area (Oczko Pro, plans, limits, codes, looks).
import type { pl } from "../pl";
import { hungarianForm } from "../plural";

/** "7 nap" (Hungarian numbers take the singular: hungarianForm is always "one"). */
const days = (n: number) => `${n} ${hungarianForm(n) === "one" ? "nap" : "napok"}`;

const MONTHS = ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"];
/** "2027. március 5-ig" (no Intl: Hermes' support is partial; "-ig" has one form). */
const until = (ms: number) => {
  const d = new Date(ms);
  return `${d.getFullYear()}. ${MONTHS[d.getMonth()]} ${d.getDate()}-ig`;
};

/** "az App Store-ban", "a Google Playen". */
const inStore = (store: string) => (store === "App Store" ? `az ${store}-ban` : `a ${store}en`);

export const premium: typeof pl.premium = {
  /** The product's name. */
  pro: "Oczko Pro",
  /** The tag next to a locked option. */
  tag: "PRO",
  wait: "Egy pillanat…",
  adFailed: "A reklám nem érhető el — próbáld újra kicsit később.",
  restore: "Vásárlások visszaállítása",

  /** The plans' texts (plans.ts). */
  plans: {
    title: {
      weekly: "Heti",
      monthly: "Havi",
      twoMonths: "2 hónapra",
      threeMonths: "3 hónapra",
      sixMonths: "Fél évre",
      yearly: "Éves",
      lifetime: "Örökre",
      other: "Oczko Pro",
    },
    /** "/ év" in the plan's note. */
    per: {
      weekly: "hét",
      monthly: "hónap",
      twoMonths: "2 hónap",
      threeMonths: "3 hónap",
      sixMonths: "fél év",
      yearly: "év",
    },
    /** "évente" in the fine print. */
    every: {
      weekly: "hetente",
      monthly: "havonta",
      twoMonths: "kéthavonta",
      threeMonths: "háromhavonta",
      sixMonths: "félévente",
      yearly: "évente",
    },
    days,
    lifetimeNote: (price: string) => `Egyszeri fizetés: ${price}`,
    note: (price: string, per: string) => `${price} / ${per}`,
    trialNote: (trialDays: number, price: string, per: string) => `${days(trialDays)} ingyen, utána ${price} / ${per}`,
    buy: "Oczko Pro vásárlása",
    tryFree: (trialDays: number) => `Próbáld ki ${days(trialDays)}ig ingyen`,
    buyLifetime: (price: string) => `Megveszem örökre · ${price}`,
    buyFor: (price: string) => `Megveszem · ${price}`,
    fineLifetime: "Egyszeri fizetés, megújítás nélkül.",
    fineOther: "A fizetési feltételeket a bolt a vásárlás előtt megmutatja.",
    fine: (trialDays: number | null, price: string, every: string) =>
      `${trialDays ? `${days(trialDays)}ig ingyenes. Utána ` : ""}${price} ${every}, amíg le nem mondod a bolt beállításaiban — ezt bármikor megteheted.`,
    /** The badge on a plan with a free trial. */
    trialBadge: (trialDays: number) => `${days(trialDays).toUpperCase()} INGYEN`,
  },

  paywall: {
    /** What the player was after. */
    headline: {
      hints: "Korlátlan edző",
      history: "Az utolsó 50 parti",
      analysis: "Minden parti elemzése",
      export: "Előzmények exportja",
      bigTable: "Asztalok 7–8 főnek",
      lanSeats: "Wi‑Fi-asztal 8 főig",
      looks: "Minden pakli, posztó és hátlap",
      stats: "Bővített statisztikák",
      profile: "Oczko Pro",
    },
    /** What Oczko Pro gives (PLAN.md §10). Nothing changes the game itself. */
    perks: [
      { title: "Korlátlan edző", note: "a túllépés esélye és a nyerési esélyek minden lépésnél" },
      { title: "Minden parti elemzése", note: "az utolsó 50 parti, visszajátszások, exportálás" },
      { title: "Asztalok 7–8 főnek", note: "egy telefonon és Wi‑Fi-n (elég, ha a házigazdának van Pro csomagja)" },
      { title: "Bővített statisztikák", note: "módok, ellenfelek, következő ellenfél" },
      { title: "Paklik, posztók és hátlapok", note: "a Wi‑Fi-asztalnál mindenki a házigazda megjelenését látja" },
    ],
    lead: "A játék ugyanaz marad — az edző, az elemzés és a nagy asztalok pedig korlátlanok.",
    buyFailed: "A vásárlás nem sikerült. Próbáld újra kicsit később.",
    pending: "A bolt még megerősíti a fizetést — az Oczko Pro magától bekapcsol, amint ez megtörténik.",
    nothingToRestore: "Ebben a bolti fiókban nem található korábbi Oczko Pro vásárlás.",
    noStore: "A vásárlás ebben az alkalmazásverzióban még nem érhető el.",
    noPrices: "Nem sikerült lekérni az árakat a boltból. Ellenőrizd az internetkapcsolatot.",
    plan: "Csomag",
    planLabel: (title: string, note: string) => `${title}: ${note}`,
    haveCode: "Van kódom",
    terms: "Feltételek",
    privacy: "Adatvédelem",
  },

  limit: {
    later: "Talán később",
    adLabel: (reward: string) => `Reklám megnézése: ${reward}`,
    adTitle: (reward: string) => `Reklám megnézése · ${reward}`,
    adLength: "kb. 30 másodperc",
  },

  redeem: {
    googlePlay: "Google Play",
    appStore: "App Store",
    title: "Van kódod?",
    leadAndroid: "Írd be az Oczko Pro kódodat. A Google Playen erősíted meg — az Oczko Pro a bolti fiókodon kapcsol be.",
    leadIos: "Az Oczko Pro kódokat az App Store ablakában kell beírni. Az Oczko Pro az Apple-fiókodon kapcsol be.",
    placeholder: "PL. OCZKO2026XYZ",
    code: "Kód",
    goAndroid: "Beváltás a Google Playen",
    goIos: "Kód beírása az App Store-ban",
    fine: "A kód egyszer és csak egy bolti fiókon működik. Másik eszközön a kódból kapott Oczko Pro a „Vásárlások visszaállítása” gombbal állítható vissza.",
    openFailed: "Nem sikerült megnyitni a boltot. Próbáld újra.",
    finishIn: (store: string) => `Fejezd be ${inStore(store)}`,
    stepOpened: (store: string) => `Megnyitottuk: ${store}`,
    stepConfirm: "Erősítsd meg a kódot a boltban",
    stepBack: "Gyere vissza ide — mi ellenőrizzük",
    checkNow: "Ellenőrzés most",
    otherCode: "Másik kód beírása",
    checking: "A bolti fiók ellenőrzése…",
    accepted: "Kód elfogadva!",
    active: "OCZKO PRO AKTÍV",
    gives: "Korlátlan tippek és elemzések, nagy asztalok, minden pakli és posztó, reklámok nélkül.",
    play: "Játék",
    offline: "Nincs kapcsolat",
    notYet: "Az Oczko Pro még nem látszik",
    offlineLead: "Nem sikerült kapcsolódni a bolthoz. Ellenőrizd az internetet, és próbáld újra.",
    notYetLead: "A bolt még nem erősítette meg a kódot ezen a fiókon. Lehetséges, hogy:",
    reasons: (store: string) => [
      `• a beváltás nem fejeződött be ${inStore(store)},`,
      "• a kódot már felhasználták, vagy lejárt,",
      "• a boltban másik fiók van bejelentkezve,",
      "• a boltnak még kell egy kis idő.",
    ],
    retry: "Ellenőrzés újra",
    again: "Kód újbóli beírása",
    noExpiry: "Nincs lejárati idő.",
    renews: (expires: number) => `${until(expires)}, utána a boltban megújul — ezt a bolt beállításaiban lemondhatod.`,
    validUntil: (expires: number) => `Érvényes ${until(expires)}.`,
  },

  looks: {
    title: "Megjelenés",
    tabs: { deck: "Paklik", felt: "Posztók", back: "Hátlapok" },
    /** Names and notes by look id (looks.ts). */
    items: {
      "deck.classic": { name: "Klasszikus", note: "két szín" },
      "deck.four": { name: "Négyszínű", note: "kék káró, zöld treff" },
      "deck.large": { name: "Nagy jelek", note: "messziről is olvasható" },
      "deck.gold": { name: "Arany", note: "krémszín arannyal" },
      "deck.night": { name: "Éjszakai", note: "sötét lapok" },
      "felt.green": { name: "Zöld", note: "klasszikus posztó" },
      "felt.burgundy": { name: "Bordó", note: "meleg és sötét" },
      "felt.navy": { name: "Sötétkék", note: "nyugodt" },
      "felt.walnut": { name: "Dió", note: "fa asztallap" },
      "felt.graphite": { name: "Grafit", note: "modern" },
      "back.classic": { name: "Klasszikus", note: "kék kockás" },
      "back.copper": { name: "Réz", note: "" },
      "back.green": { name: "Zöld", note: "" },
      "back.black": { name: "Fekete", note: "" },
      "back.gold": { name: "Arany", note: "" },
    },
    previewLabel: (deck: string, felt: string, back: string) => `Előnézet: pakli: ${deck}, posztó: ${felt}, hátlap: ${back}`,
    itemLabel: (name: string, inUse: boolean, locked: boolean) => `${name}${inUse ? ", aktív" : ""}${locked ? ", az Oczko Pro csomagban" : ""}`,
    inUse: "aktív",
    /** "21:05-ig" — a trial's end ("-ig" has one form). */
    trialUntil: (time: string) => `${time}-ig`,
    previewOf: (name: string) => `„${name}” · előnézet`,
    tryIt: "▶ 24 órás próba",
    allInPro: "Mind a Pro csomagban",
  },
};
