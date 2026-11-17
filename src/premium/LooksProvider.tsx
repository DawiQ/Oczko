// The player's chosen looks (saved), shown as far as they are unlocked: the
// classic set is free, the rest needs Oczko Pro or a running 24 h trial. A
// guest at a Wi-Fi table sees the Pro host's looks instead (LookOverride).
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { readJSON, writeJSON, type KV } from "../storage/kv";
import { LookStyleProvider, styleOf } from "../ui/lookStyle";
import { CLASSIC, cleanChoice, effectiveChoice, type LookChoice } from "./looks";
import { usePremium } from "./PremiumProvider";

export const LOOKS_KEY = "oczko.looks.v1";

interface LooksControl {
  /** What the player picked (may include a look whose trial ended). */
  choice: LookChoice;
  /** What is shown. */
  effective: LookChoice;
  setChoice(c: LookChoice): void;
}

const LooksContext = createContext<LooksControl>({ choice: CLASSIC, effective: CLASSIC, setChoice: () => {} });

export const useLooks = (): LooksControl => useContext(LooksContext);

export function LooksProvider({ kv, children }: { kv: KV; children: ReactNode }) {
  const premium = usePremium();
  const [choice, setChoiceState] = useState<LookChoice>(CLASSIC);
  useEffect(() => {
    let alive = true;
    void readJSON(kv, LOOKS_KEY, (x): x is unknown => typeof x === "object" && x !== null).then((x) => {
      if (alive && x) setChoiceState(cleanChoice(x));
    });
    return () => {
      alive = false;
    };
  }, [kv]);
  const setChoice = useCallback(
    (c: LookChoice) => {
      setChoiceState(c);
      void writeJSON(kv, LOOKS_KEY, c);
    },
    [kv]
  );
  const effective = useMemo(() => effectiveChoice(choice, premium.lookUnlocked), [choice, premium]);
  const control = useMemo(() => ({ choice, effective, setChoice }), [choice, effective, setChoice]);
  const style = useMemo(() => styleOf(effective), [effective]);
  return (
    <LooksContext.Provider value={control}>
      <LookStyleProvider value={style}>{children}</LookStyleProvider>
    </LooksContext.Provider>
  );
}

/** Draw with someone else's looks (a Pro host's, at a Wi-Fi table). */
export function LookOverride({ choice, children }: { choice: LookChoice | null; children: ReactNode }) {
  const style = useMemo(() => (choice ? styleOf(cleanChoice(choice)) : null), [choice]);
  return style ? <LookStyleProvider value={style}>{children}</LookStyleProvider> : <>{children}</>;
}
