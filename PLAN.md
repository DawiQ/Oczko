# Oczko — plan implementacji (dla Claude Code)

Plan budowy aplikacji do gry w **Oczko** na wzór aplikacji **Pan** (`dawiq/pan`,
opis w `docs/BLUEPRINT.md`). Każdy etap to osobna sesja / seria commitów.
Na start każdej sesji: *„Przeczytaj CLAUDE.md, PLAN.md i docs/BLUEPRINT.md.
Wykonaj Etap N.”*

Repozytorium Pana sklonuj obok jako wzorzec tylko do odczytu: `../pan`,
**gałąź `ccr-3c56375b-8hrsv2`** (pełna aplikacja; `main` to stary „Pan Advisor”).
Kopiując moduły, zmieniaj prefiksy (`pan.` → `oczko.`, `Pan Pro` → `Oczko Pro`,
`_pan._tcp` → `_oczko._tcp`) i usuwaj zależności od silnika C++.

Makiety: `docs/mockups/oczko-makiety.html` (lobby, onboarding, nowa gra, stół
rodzinny i z bankiem, perskie oczko, koniec rundy, koniec partii, profil, zasady).
Makiety zaakceptowane przez właściciela (akcent Miedź) — obowiązują w Etapach 5 i 6.

---

## 0. Decyzje (przyjęte)

| Decyzja | Wartość |
|---|---|
| Nazwa / bundle id | „Oczko — gra w karty”, `pl.dawiq.oczko` |
| Akcent kolorystyczny | Miedź `#E8925A` (ciemniejszy `#A85E2E`, tekst na akcencie `#1E0F06`); reszta palety z Pana |
| Tryb domyślny | Rodzinne (wszyscy na wszystkich, punkt dla najbliższego 21) |
| Talia | 52 karty (opcje: 24 karty 9–A, 32 karty 7–A w regułach zaawansowanych) |
| Wartości | 2–10 wg oczek, W=2, D=3, K=4, A=11 (konfigurowalne) |
| Perskie oczko | włączone (dokładnie dwa asy, wygrywa wszystko, ogłaszane publicznie) |
| Karty na start | 1 |
| Remis w trybie rodzinnym | punkt dla każdego z remisujących |
| Remis w trybie z bankierem | wygrywa bank |
| Gracz z furą przy banku | przegrywa od razu, nawet gdy bank też ma furę |
| Punktacja w trybie z bankierem | `majority`: gracz +1 za wygrany pojedynek; bank +1, gdy wygra więcej pojedynków, niż przegra |
| Rotacja banku | co rundę |
| Fura | ogłaszana od razu, karty odkryte |
| Partia | do 10 punktów; wygrywa jedyny lider z wynikiem ≥ celu po pełnej rundzie |
| Rewanż | ci sami rywale, **nowe karty**; te same karty tylko w Treningu, bez punktów i statystyk (§6) |
| Trener w grze Wi‑Fi | wyłączony dla wszystkich |
| Limity graczy wg talii | 24 → 2–5, 32 → 2–7, 52 → 2–8 (zmierzone: `docs/STATS.md`) |
| Zawartość Pro i limity portfela | wg §10 |

---

## 1. Kluczowe założenia projektowe

1. **Zero obstawiania.** Brak żetonów, stawek, puli, waluty. Gra się na
   punkty: wygrana runda = +1 punkt. Nic kupowanego nie wpływa na rozgrywkę
   z innymi ludźmi. Szczegóły zgodności w §9 — obowiązują na każdym etapie.
2. **Zasady rundy jak przy prawdziwym stole:** „Dobieram” / „Starczy”, fura
   (> 21), perskie oczko, bankier. Wszystkie warianty domowe w ustawieniach,
   wybierane przy pierwszym uruchomieniu („Jak grasz u siebie?”).
3. **Silnik w czystym TypeScript** (`src/engine/`), bez modułu natywnego,
   bez Reacta, losowość tylko z RNG z ziarnem. Runda = `(seed, rules, seats,
   decyzje)` → ten sam przebieg.
4. **Ukryta informacja.** Ręce są zakryte do odsłonięcia. Każde miejsce widzi
   tylko swój widok (`viewFor(seat)`) i swoje zdarzenia (`eventsFor(seat)`) —
   dotyczy botów, UI i Wi‑Fi.
5. **Boty i trener** oparte na ewaluatorze prawdopodobieństw (P(fura) +
   Monte Carlo szans wygranej). Poziomy kalibrowane turniejem.
   C++ tylko wtedy, gdy pomiary pokażą, że TS jest za wolny (nie zakładamy).
6. Wzorce z Pana przenoszone 1:1: kontroler bez Reacta + `GameSnapshot` +
   `TableGame`, adaptery z wariantem „brak”, konteksty z domyślną wartością
   „bez ograniczeń”, `kv.ts` z walidatorami, czyste funkcje, UI i dostępność.

---

## 2. Stos

Jak w Panie (Expo SDK 58, RN 0.88 New Architecture, React 19, TS strict,
Jest 30 + jest-expo), **bez** `modules/pan-engine`. Do Etapu 8 można pracować
w Expo Go; od Etapu 9 (TCP, mDNS, RevenueCat, AdMob) `expo-dev-client`.

Skrypty `package.json`: `test`, `typecheck`, `lint`, `stats`
(`tsx tools/stats.ts`), `tournament` (`tsx tools/tournament.ts`).

---

## 3. Struktura katalogów

```
App.tsx, index.ts, app.json, eas.json, build.js
plugins/                withReleaseSigning.js (z Pana)
assets/                 ikona, splash, sukna, rewersy, dźwięki
tools/                  stats.ts, tournament.ts, find-tutorial-seed.ts, render-*.js, render-sounds.py
store/                  listing-pl.md, privacy.md, RELEASE.md, rating-answers.md
docs/                   BLUEPRINT.md (z Pana), STATS.md, BOTS.md (generowane), mockups/
src/
  engine/               cards, rng, rules, score, round, match, view, version
  ai/                   evaluate, policies, personas, levels
  game/                 GameController, TableGame, useGame, pace, series
  table/                TableScreen, Hand, OpponentSeat, BankBadge, Showdown, RoundResult, ScoreSheet, Hints
  home/                 HomeScreen, TabBar
  newgame/              NewGameScreen, RulesSheet, presets
  onboarding/           Welcome („Jak grasz u siebie?”), Tutorial
  trainer/              TrainerPanel (P(fura), szanse, rekomendacja)
  history/              record, reducer, HistoryScreen, ReplayScreen, analysis
  profile/              progress (rangi, odznaki), ProfileScreen
  info/                 RulesScreen
  lan/                  z Pana, protokół dopasowany (§7, Etap 9)
  premium/              z Pana, nowa zawartość Pro (§10)
  storage/              kv, save, stats, settings, history
  ui/                   z Pana (paleta, Button3D, BottomSheet, Dialog, CardFace/Back, Portrait, sound, haptics, plural)
  __tests__/            App.render.test.tsx, forbiddenWords.test.ts
jest.setup.js
```

---

## 4. Silnik — specyfikacja

### 4.1 Typy (zaimplementowane w Etapie 2, `src/engine/`)

```ts
// cards.ts
export type Card = number;              // 0..51; rank = (id >> 2) + 2 (2..14; 11=W, 12=D, 13=K, 14=A), suit = id & 3 (kier, karo, trefl, pik)
export function makeDeck(size: 24 | 32 | 52): Card[];   // 24: 9–A, 32: 7–A, 52: 2–A

// rng.ts — mulberry32, stan serializowalny; ziarno rundy = splitmix32(seedBase, roundNo)
export interface Rng { state: number }
export function rngNext(r: Rng): [number, Rng];          // czyste: zwraca nowy stan
export function roundSeed(seedBase: number, roundNo: number): number;
export function shuffle<T>(items: readonly T[], seed: number): T[];

// rules.ts
export interface Rules {
  deck: 24 | 32 | 52;
  values: Record<2|3|4|5|6|7|8|9|10|11|12|13, number>;  // 1..11; A osobno
  ace: 'eleven' | 'oneOrEleven';
  persian: boolean;                      // dokładnie dwa asy = wygrana ponad wszystko
  startCards: 1 | 2;
  maxCards: number | null;               // limit kart w ręce (null = bez); startCards + 1..12
  mode: 'family' | 'bank';
  familyTie: 'allScore' | 'noneScore';
  bankTie: 'bankWins' | 'nobody';
  bankScoring: 'majority' | 'perDuel';
  bankRotation: 'everyRound' | 'onPersian' | 'fixed';
  playerBustLoses: boolean;              // fura gracza przegrywa nawet przy furze banku
  bustRevealed: boolean;                 // fura ogłaszana od razu i karty odkryte
  target: number;                        // punkty do wygrania partii (1..50)
}
export const DEFAULT_RULES: Rules;
export const PRESETS: Record<'family' | 'bank' | 'small24', Rules>;
export const MAX_SEATS: Record<Rules['deck'], number>;   // 24: 5, 32: 7, 52: 8
export function validateRules(r: unknown): Rules | null; // zakresy, spójność, brak/nadmiar pól → null

// score.ts
export function handValue(hand: Card[], rules: Rules): { total: number; soft: boolean; bust: boolean; persian: boolean };

// round.ts
export type Action = 'hit' | 'stand';
export type SeatStatus = 'waiting' | 'playing' | 'stood' | 'bust' | 'maxed';
export interface RoundState {
  v: 1; rules: Rules; seed: number;
  stock: Card[];                 // potasowana przy starcie; indeks 0 = wierzch
  hands: Card[][]; status: SeatStatus[];
  order: number[];               // kolejność ruchów (bank ostatni)
  turn: number | null;           // miejsce na ruchu
  dealer: number; bank: number | null;
  revealed: boolean[];           // czyje karty są odkryte
  log: RoundEvent[]; result: RoundResult | null;
}
export type RoundEvent =
  | { t: 'deal'; seat: number; count: number }
  | { t: 'hit'; seat: number; card?: Card }     // card tylko dla właściciela ręki (eventsFor)
  | { t: 'stand'; seat: number }
  | { t: 'bust'; seat: number }                 // dla innych tylko przy bustRevealed (inaczej → 'stand')
  | { t: 'persian'; seat: number }              // zawsze publiczne
  | { t: 'maxed'; seat: number }                // limit kart osiągnięty
  | { t: 'reveal'; seat: number; hand: Card[] }
  | { t: 'result'; result: RoundResult };
export interface RoundResult {
  values: { seat: number; total: number; bust: boolean; persian: boolean }[];
  points: number[];                       // +punkty per miejsce w tej rundzie
  duels?: { seat: number; winner: 'player' | 'bank' | 'none' }[];   // tryb bank, wg miejsc
}
export function newRound(rules: Rules, seats: number, seed: number, dealer: number, bank: number | null): RoundState;
export function dealRound(rules, seats, stock, dealer, bank, seed?): RoundState;   // z podanej talii (testy, samouczek)
export function legal(s: RoundState): Action[];               // bez 'hit' przy pustej talii
export function apply(s: RoundState, seat: number, a: Action): { state: RoundState; events: RoundEvent[] } | { error: 'round-over' | 'not-your-turn' | 'illegal-action' };
export function scoreRound(rules: Rules, hands: Card[][], bank: number | null): RoundResult;

// match.ts — rundy do `target`, rotacja rozdającego i banku
export interface MatchState { v: 1; rules: Rules; seats: number; scores: number[]; round: RoundState; roundNo: number; dealer: number; bank: number | null; seedBase: number; winner: number | null }
export function newMatch(rules: Rules, seats: number, seedBase: number, first?: number): MatchState;
export function matchApply(m: MatchState, seat: number, a: Action): { state: MatchState; events: RoundEvent[] } | { error };
export function nextRound(m: MatchState): MatchState | { error: 'match-over' | 'round-not-over' };
export function rotation(m: MatchState): { dealer: number; bank: number | null };
export function winnerOf(scores: number[], target: number): number | null;   // jedyny lider ≥ target

// view.ts — to, co widzi miejsce (bez cudzych zakrytych kart, bez talii, bez ziarna)
export interface SeatView {
  me: number; rules: Rules; roundNo: number; turn: number | null; dealer: number; bank: number | null;
  myHand: Card[]; myValue: ReturnType<typeof handValue>; myStatus: SeatStatus;
  others: { seat: number; cards: number; status: SeatStatus; persian: boolean; hand?: Card[] }[];  // nieujawniona fura → 'stood'; persian = ogłoszone perskie
  seenCards: Card[];               // wszystkie karty widoczne dla mnie w tej rundzie
  stockLeft: number; scores: number[]; legal: Action[];
  result: RoundResult | null; winner: number | null;
}
export function viewFor(s: MatchState, seat: number): SeatView;
export function eventsFor(events: RoundEvent[], seat: number, s: RoundState): RoundEvent[];

// version.ts
export const ENGINE_VERSION = 1;
```

### 4.2 Przebieg rundy

- Talia tasowana z `roundSeed(seedBase, roundNo)` na starcie każdej rundy
  (brak przenoszenia informacji między rundami); każdy dostaje `startCards`
  zakrytych.
- Kolejność: od lewej rozdającego; w trybie bank — gracze, na końcu bank.
- Po rozdaniu i po każdym dobraniu automatycznie:
  - perskie oczko (`persian`, dokładnie 2 karty, oba asy) → `stood` +
    publiczne zdarzenie `persian` (także od razu przy rozdaniu, gdy
    `startCards: 2`);
  - wynik > 21 → `bust` (+ `reveal`, jeśli `bustRevealed`). Dwa asy przy
    `persian: false` i `ace: 'eleven'` to 22, czyli fura;
  - osiągnięty `maxCards` → `maxed` (liczy się jak „Starczy”, bez premii).
  - Wynik dokładnie 21 nie kończy ruchu automatycznie (gracz mówi „Starczy”;
    UI podpowiada).
- Pusta talia → `legal()` zwraca tylko `stand`.
- `bustRevealed: false` → cudza fura widoczna jako `stood`, zdarzenie `bust`
  tylko dla właściciela; ujawnienie przy końcu rundy.
- Tryb bank: jeśli wszyscy gracze mają **ujawnioną** furę, bank nie gra.
- Rozliczenie:
  - **family:** perskie oczko bije wszystko (kilka perskich → remis między
    nimi wg `familyTie`); potem najwyższy wynik ≤ 21; wszyscy z furą → nikt
    nie punktuje; remis wg `familyTie`.
  - **bank:** każdy gracz vs bank. Fura gracza → bank (także przy furze banku,
    gdy `playerBustLoses`; inaczej obie fury → `none`). Fura banku → gracz.
    Perskie bije wszystko; perskie vs perskie i równe wyniki → `bankTie`.
    Wyższy wynik wygrywa. Punkty: gracz +1 za wygrany pojedynek; bank wg
    `bankScoring` (`majority`: +1, gdy wygranych pojedynków > przegranych;
    `perDuel`: +1 za każdy).
- Rotacja banku: `everyRound` — następne miejsce; `onPersian` — bank
  przejmuje gracz z perskim oczkiem (kilku → pierwszy w kolejności ruchów;
  perskie banku → bank zostaje); `fixed` — bez zmian.
- Partia kończy się, gdy po pełnej rundzie dokładnie jedno miejsce ma
  najwyższy wynik ≥ `target`; inaczej kolejna runda (wszyscy grają).
- Liczba miejsc ≤ `MAX_SEATS[deck]`.

### 4.3 Testy silnika (warunki konieczne)

- Niezmienniki: karty w grze = talia, brak duplikatów, gracz nie rusza się
  po `stood/bust/maxed`, `apply` odrzuca ruch poza kolejką, `hit` przy pustej
  talii odrzucony.
- Determinizm: ten sam seed + te same decyzje → identyczny przebieg.
- `apply` nie mutuje wejścia.
- `handValue`: tabele przypadków dla obu ustawień asa, perskie oczko tylko
  przy dwóch kartach, dwa asy bez perskiego, wartości figur z reguł, talia 24.
- Rozliczenia: tabela przypadków dla family i bank (fura vs fura, perskie vs
  perskie, perskie przy rozdaniu, remisy wg opcji, wszyscy z furą,
  `bankScoring` obu wariantów).
- `viewFor` i `eventsFor` nigdy nie zawierają cudzych zakrytych kart ani
  nieujawnionej fury (test na tysiącach losowych stanów).
- Rotacja rozdającego i banku wg `bankRotation`; koniec partii i dogrywka.
- `validateRules`: zakresy, `maxCards`, nieznane wartości → `null`.

---

## 5. Boty, ewaluator, trener

### 5.1 Ewaluator (`ai/evaluate.ts`, czysty) ✅

```ts
export interface OpponentModel { standAt: number }      // rywale dobierają poniżej progu
export interface Evaluation {
  bustIfHit: number;          // dokładne: niewidziane karty dające furę / liczba niewidzianych
  winIfStand: number;         // Monte Carlo: oczekiwany udział w punktach rundy (0..1)
  winIfHit: number;           // Monte Carlo (po dobraniu gra dalej do `continueAt`)
  best: Action;
  confidence: number;         // z błędu standardowego różnicy (próbki sparowane)
  samples: number;
}
export function evaluate(view: SeatView, opts: { samples: number; rng: Rng; opponentModel: OpponentModel; continueAt?: number }): Evaluation;
export function chunkedEvaluator(chunk?, yieldNow?): { evaluate(view, opts, onProgress?): Promise<Evaluation | null>; cancel(): void };
```

- Karty niewidziane = talia − `seenCards`. `bustIfHit` jest dokładne przy
  założeniu, że każda niewidziana karta jest równie prawdopodobna.
- Monte Carlo: cudze zakryte ręce losowane z niewidzianych kart, zgodne
  z obserwacjami (liczba kart, ogłoszone perskie oczko, „Starczy” → ręka
  ≥ progu modelu; ukryta fura możliwa tylko bez `bustRevealed`) —
  odrzucanie do 100 prób na rękę, a dla miejsca, które wyraźnie nie pasuje
  do modelu, tylko 6. Obie gałęzie (Starczy / Dobieram) na tej samej
  kolejności talii. Tablice typowane, bez alokacji na próbkę.
- Pomiar (Node): 7–11 ms na 1500 próbek (`docs/STATS.md`). Na telefonie
  w kawałkach po 250 próbek z anulowaniem licznikiem epok.

### 5.2 Polityki i poziomy (`ai/policies.ts`, `ai/personas.ts`) ✅

- `threshold(t)`, `noisy(t, ε)`, `contextual(t)` (patrzy na stół),
  `evaluatorPolicy(samples, model)`; opis serializowalny `PolicySpec`.
- 8 postaci (kolejność z turnieju, `docs/BOTS.md`): Zosia (15 + 25% szumu),
  Kuba (14), Witek „Ryzykant” (20), Hela „Ostrożna” (16), Ola (17),
  Marek (17, patrzy na stół), Profesor (ewaluator, 40 próbek), Hrabia
  (ewaluator, 1500 próbek). Bez imion i etykiet kojarzonych z hazardem.
- `tools/tournament.ts` — każda postać gra te same rozdania (porównanie
  parami): rodzinne 4 graczy (rywale referencyjni 15/17/19) i bank 1 na 1
  (rola banku co drugie rozdanie). Siła = średnia obu odsetków; sąsiednie
  poziomy z > 2. Wynik: `docs/BOTS.md` i `src/ai/calibration.ts` (test
  pilnuje, by kolejność postaci = zmierzona siła).

### 5.3 Trener (`trainer/`)

- Panel przy ręce: „Szansa na furę: 38%”, „Starczy: 54% / Dobieram: 41%”,
  podświetlenie lepszego przycisku. Bez słów „liczenie kart”.
- Bez Pro: limit dzienny z portfela (§10), także w trybie „Trening”.
  Pro: bez limitu.
- W grze Wi‑Fi trener wyłączony dla wszystkich (także Pro).

---

## 6. Kontroler gry

```ts
new GameController(setup: GameSetup, deps: ControllerDeps)
// setup: { rules, seats: SeatSetup[] (human | persona | remote), seed?, mode: 'match' | 'single' | 'training' }
// deps:  { sleep?, now?, evaluate?, onRoundEnd?, onMatchEnd?, onEngineError? }
```

- Steruje kolejką ruchów, tempem botów (~0,8 s na decyzję, szybciej po
  furze/„Starczy” człowieka), sekwencją odsłaniania (karta po karcie).
- Akcje (kod błędu lub `null`): `hit()`, `stand()`, `nextRound()`,
  `skipToEnd()` (rozgrywa resztę rundy bez opóźnień), `rematch()` (ci sami
  rywale, nowe ziarno), `replayRound()` (tylko `training`: ta sama runda
  jeszcze raz, bez punktów i statystyk), `abandon()`.
- **Brak „rewanżu na tych samych kartach” w grze na punkty**: kolejność talii
  przesądza o dobieranych kartach, więc zapamiętane rozdanie dawałoby pełną
  wiedzę.
- `GameSnapshot`: `phase` (`dealing` | `myTurn` | `othersTurn` | `bankTurn` |
  `showdown` | `roundEnd` | `matchEnd`), `view` (mój `SeatView`), `seats[]`
  (`name`, `persona`, `cards`, `status`, `isBank`, `isDealer`, `thinking`,
  `score`, `hand?` po odsłonięciu), `lastEvents` (wyłącznie z `eventsFor`,
  z id), `result`, `scores`, `target`, `canSkip`, `canRematch`.
- Zapis `SavedGame { v: 1, setup, match, roundStart, decisions, botRng }`
  po każdym ruchu, wznawianie po zamknięciu aplikacji. Decyzje botów:
  `decideAsync` (ewaluator w kawałkach, wstrzykiwalne `decide`).
- `TableGame` — interfejs dla stołu (lokalny kontroler, host Wi‑Fi, gość).
- `useGame` — jedyne spoiwo z Reactem.
- Testy: natychmiastowy `sleep`, stałe ziarno, zamockowany ewaluator;
  pełna partia family i bank, zapis → odczyt → kontynuacja = ten sam wynik,
  `replayRound` daje to samo rozdanie i nie zmienia punktów, `skipToEnd`
  w trakcie ruchu banku, `lastEvents` bez cudzych kart.

---

## 7. Etapy

Każdy etap kończy się: `npm test`, `npm run typecheck` na zielono, self-review
(błędy, skrajne przypadki, brakujące testy), poprawki w osobnym commicie,
aktualizacja README. Przed Etapami 5, 6 i 10 — makieta (HTML) do akceptacji
(wstępna: `docs/mockups/oczko-makiety.html`).

### Etap 0 — Repozytorium ✅
- `CLAUDE.md`, `PLAN.md`, `docs/BLUEPRINT.md`, makiety, README.
- Klon `dawiq/pan` (gałąź `ccr-3c56375b-8hrsv2`) do `../pan` (tylko odczyt).
- **Gotowe, gdy:** pliki na gałęzi roboczej (do `main` przez PR na prośbę).

### Etap 1 — Szkielet ✅
- Expo + TS strict + Jest + ESLint; `App.tsx` ze stanem `Screen` i obsługą
  „wstecz” Androida; splash; safe area; edge-to-edge.
- Z Pana: `src/ui/*` (akcent Miedź wg §0), `src/storage/kv.ts`,
  `jest.setup.js` (bez mocka silnika), czcionka Fraunces.
- Test słów zakazanych (§9) od pierwszego dnia.
- **Gotowe, gdy:** aplikacja startuje, lobby z TabBar, testy `kv.ts`,
  komponentów bazowych i słów zakazanych przechodzą.

### Etap 2 — Silnik ✅
- §4 w całości + presety.
- **Gotowe, gdy:** testy z §4.3 przechodzą.

### Etap 3 — Boty i ewaluator ✅
- §5.1, §5.2, `tools/tournament.ts`, `tools/stats.ts` → `docs/STATS.md`,
  `docs/BOTS.md`. Statystyki: średnia liczba dobrań, % fur, przewaga banku
  dla presetów, udział wygranych partii per miejsce w trybie bank (obie
  wartości `bankScoring`), P(pusta talia) per talia i liczba graczy
  (weryfikacja `MAX_SEATS`), długość partii do 10 pkt w minutach przy
  normalnym tempie.
- Pomiar czasu ewaluatora w Node; jeśli > 30 ms dla 1500 próbek — optymalizuj
  (tablice typowane, mutowalne symulacje), zanim rozważysz C++.
- **Gotowe, gdy:** poziomy rosną monotonicznie w turnieju, testy ewaluatora
  (P(fura) dokładne na ręcznych przykładach, zbieżność MC na prostych
  przypadkach z wynikiem policzonym analitycznie), domyślne reguły trybu bank
  zbalansowane (udział wygranych partii per miejsce ≈ 1/n ± 3 pp.).

### Etap 4 — Kontroler ✅
- §6: `GameController`, `pace`, `series`, `TableGame`, `useGame`,
  `storage/save.ts`, `storage/stats.ts`.
- **Gotowe, gdy:** testy z §6 przechodzą.

### Etap 5 — Stół ✅
- Układ wg makiety 4–7: ręka gracza na dole jako wachlarz (karty odkryte dla
  siebie), rywale wokół: portret, liczba kart (rewersy w małym wachlarzu),
  status („myśli…”, „Starczy”, „Fura!”), punkty. Znacznik **Bank**
  i rozdającego.
- Przyciski 3D na dolnej bandzie: **Dobieram** / **Starczy**; przy 21
  podświetlone „Starczy”. Duży wynik ręki przy wachlarzu.
- Animacje: rozdanie z talii, dobranie karty (lot + obrót), stempel „Fura!”,
  „Perskie oczko!” (osobna, efektowna animacja), odsłanianie rąk po kolei
  przy końcu rundy, +1 lecące do punktów zwycięzcy.
- Dźwięki i haptyka (dobranie, fura, perskie oczko, wygrana rundy).
- Ekran końca rundy: wyniki rąk, kto punktuje, tabela punktów; koniec partii:
  podium, konfetti, „Rewanż”, „Nowa gra”.
- Menu ☰ (BottomSheet): zasady, tabela punktów, poddaj. Jednorazowe
  wskazówki przy pierwszych sytuacjach (pierwsza fura, pierwsze 21, bank).
- Dostępność: live region z neutralnymi komunikatami („Dobrana karta: dama.
  Masz 17”), etykiety kart, cele ≥ 44 px.
- **Gotowe, gdy:** pełna partia family i bank 2–6 graczy grywalna, test
  renderu stołu z zamockowanym kontrolerem.

### Etap 6 — Lobby, nowa gra, onboarding, zasady ✅
- Zakładki **Graj · Profil · Zasady**; „Wznów partię”; ustawienia ⚙︎
  (dźwięk, haptyka, tempo botów, trener, prywatność reklam, wygląd).
- Onboarding „Jak grasz u siebie?”: tryb (rodzinne / z bankierem), wartości
  figur (2/3/4, 3/4/5, własne), talia (52 / 24), perskie oczko (tak / nie),
  as (11 / 1 lub 11); podgląd zasad jednym zdaniem; zapis jako domyślne
  reguły. Opcja „Pokaż mi zasady” → samouczek: skryptowana runda z ziarna
  (znalezionego `tools/find-tutorial-seed.ts`), sprawdzana testem.
- Nowa gra: przeciwnicy (licznik − n +, powtórzenia „Hrabia II”, limit wg
  `MAX_SEATS`), tryb, punkty do wygranej (5 / 10 / 15 / 1 runda), reguły
  w BottomSheet; wybory zapamiętane.
- Zasady: opis każdego wariantu, przykłady rąk z grafiką kart.
- **Gotowe, gdy:** `App.render.test.tsx`: onboarding → nowa gra → partia do
  końca (`skipToEnd`) → lobby → wznowienie.

### Etap 7 — Trener, historia, analiza ✅
- Trener wg §5.3 (włączany w ustawieniach lub w trybie „Trening”).
- `HistoryRecord { v, engineVersion, seedBase, rules, seats, rounds: { decisions }[], result, summary, date }`
  — jeden rekord = jedna partia (pojedyncza runda = partia z jedną rundą);
  przechowywane ostatnie 50 (`oczko.history.v1`), bez Pro widoczne 10.
- Powtórka ruch po ruchu (suwak, autoodtwarzanie) z odsłoniętymi kartami.
- Analiza decyzji gracza ewaluatorem: najlepsza / dobra / ryzykowna / błąd
  (progi różnicy szans w `analysis.ts`, czyste funkcje + testy).
- Eksport JSON.
- **Gotowe, gdy:** zapis → odczyt → powtórka identyczna; testy klasyfikacji.

### Etap 8 — Profil ✅
- Ranga wg punktów doświadczenia (rundy, wygrane partie), progi w
  `progress.ts`.
- Odznaki: „Perskie oczko”, „Równe 21”, „Oczko z pięciu kart” (21 z 5+
  kartami), „Na krawędzi” (wygrana z 21 po dobraniu przy 17+), „Żelazny bank”
  (bank wygrywa wszystkie pojedynki w rundzie z 3+ graczami), „Seria”
  (5 wygranych rund z rzędu), „Weteran” (100 partii). Rundy z `training`
  się nie liczą.
- Statystyki: partie, wygrane %, % fur, średni wynik przy „Starczy”, per tryb
  i per postać; sugestia kolejnego rywala; reset z potwierdzeniem.
- **Gotowe, gdy:** testy `progress.ts` dla każdej odznaki i progu.

### Etap 9 — Wi‑Fi ✅
- Skopiuj `src/lan/` z Pana (TCP, mDNS, kod stołu, QR, ekrany, ping, tokeny,
  szybkie reakcje, obecność, statystyki). Usługa `_oczko._tcp`, port bazowy
  **47676**.
- Host = stół (ten sam `GameController`); gość wysyła tylko `hit` / `stand`;
  host waliduje i wysyła każdemu **jego** `SeatView` i zdarzenia z
  `eventsFor` — nigdy cudzych zakrytych kart ani ziarna.
- Trener wyłączony dla wszystkich miejsc.
- Czas na ruch gościa: 30 s, potem „Starczy” automatycznie; rozłączenie →
  60 s oczekiwania, potem gra za niego bot pod jego imieniem; powrót tokenem.
- Tryb imprezowy do 8 osób (Pro hosta, talia 52).
- Uprawnienia jak w Panie. Od tego etapu `expo-dev-client`.
- **Gotowe, gdy:** test protokołu na transporcie pamięciowym: host + 3 gości,
  żaden gość nie dostaje cudzych kart przed odsłonięciem, rozłączenie
  i powrót, wynik zgodny z partią lokalną z tymi samymi decyzjami.

### Etap 10 — Monetyzacja i wygląd ✅
- Skopiuj `src/premium/` (RevenueCat, portfel, `LimitSheet`, paywall, kody,
  AdMob rewarded + UMP, warianty „brak”). Uprawnienie `pro`. Z portfela
  usuń kredyt „rewanż”.
- Zawartość wg §10; reklamy tylko na żądanie, nigdy w trakcie rundy.
- AdMob: zablokowane kategorie wrażliwe „Gambling & Betting” i „Social
  Casino” (opisz w README i `store/RELEASE.md` — ustawia właściciel w panelu
  AdMob).
- **Gotowe, gdy:** testy providera z fałszywym sklepem i reklamami; bez
  kluczy aplikacja działa.

### Etap 11 — Grafiki, dźwięki, wydanie ✅ (AAB sprawdzony; iOS — przez EAS u właściciela)
- `tools/render-*.js`: ikona, splash, sukna, rewersy, stemple („Fura!”,
  „Perskie oczko!”), portrety postaci; `tools/render-sounds.py`.
- `build.js` z Pana bez kroków silnika; `eas.json`; podpisywanie.
- `store/listing-pl.md` (słowa kluczowe: oczko, 21, perskie oczko, gra
  w karty, ze znajomymi przez Wi‑Fi — bez słów z listy w §9),
  `store/privacy.md`, `store/RELEASE.md`, `store/rating-answers.md` (§9).
- **Gotowe, gdy:** build AAB i iOS przechodzi, checklista RELEASE.md
  wypełniona.

### Etap 12 — Infrastruktura wielu języków (bez widocznej zmiany) ✅
Szczegóły i decyzje: §12. Po tym etapie aplikacja nadal jest tylko po polsku,
ale żaden tekst UI nie jest już wpisany w komponent.
- `src/i18n/`: typ `Lang`, słownik bazowy `pl.ts` (obiekt z kluczami
  pogrupowanymi wg ekranów), typ `Strings = typeof pl` — kompilator pilnuje
  kompletności każdego innego języka; `t()` z parametrami (`{name}`),
  `plural(lang, n, forms)` wg reguł CLDR (własna implementacja, bez `Intl`).
- `LocaleProvider` + `useT()`; moduły bez Reacta (`table/texts.ts`,
  `hints.ts`, `rulesText.ts`, `tutorialScript.ts`, `profile/progress.ts`,
  `premium/plans.ts`, `history/analysis.ts`) dostają słownik parametrem.
- Przeniesienie wszystkich tekstów (ok. 730 polskich literałów w ~45 plikach
  + teksty bez znaków diakrytycznych) do `pl.ts`, plik po pliku.
- Karty: litery figur i nazwy kolorów dla czytnika ekranu w słowniku
  (PL W/D/K, EN J/Q/K, DE B/D/K…).
- Postacie: imiona i opisy w słowniku (lokalne imiona per język, te same
  portrety i poziomy).
- Wi‑Fi: protokół v2 — reakcje jako identyfikatory (`bravo`, `oops`…),
  nie polskie napisy; każdy telefon pokazuje je w swoim języku. Starszy gość
  dostaje odmowę „version”.
- Ustawienia `oczko.settings.v2`: pole `lang` („auto” = język telefonu albo
  wybrany); migracja z v1. Wykrywanie: `expo-localization`; wiersz „Język”
  w Ustawieniach; zmiana bez restartu.
- Czcionka: Fraunces ma łacinę rozszerzoną (ł, ő, č, đ), ale nie cyrylicę
  ani greckie — `DISPLAY` zależny od pisma (dla cyrylicy druga czcionka OFL
  z cyrylicą, wybór i licencja w tym etapie).
- Test słów zakazanych: listy per język (§12) i skan słowników.
- Testy: kompletność kluczy i parametrów `{…}` we wszystkich słownikach,
  reguły liczby mnogiej (tabele), brak polskich znaków w słownikach innych
  języków, test dymny aplikacji w każdym dostępnym języku, protokół v2.
- Aktualizacja `CLAUDE.md` (teksty przez `t()`, zasady neutralności płciowej
  dla wszystkich języków) i README.
- **Gotowe, gdy:** w komponentach i modułach UI nie ma literałów tekstu
  (test lub lint to sprawdza), aplikacja po polsku wygląda i działa jak
  przed etapem, wszystkie testy zielone.

### Etap 13 — Angielski i niemiecki
- Słownik pojęć (glosariusz) dla EN i DE: „Dobieram”, „Starczy”, „Fura!”,
  „Perskie oczko!”, „Bank”, nazwy trybów i reguł — bez słownictwa kasyna
  (§12). Nazwa w sklepie: EN „Oczko — 21 card game”, DE „Oczko — 17 und 4”.
- Tłumaczenia `en.ts`, `de.ts`; teksty samouczka i zasad przepisane, nie
  tłumaczone dosłownie.
- `app.json` → `locales`: nazwa aplikacji i komunikaty uprawnień (sieć
  lokalna, aparat) dla iOS (i Androida, jeśli SDK pozwala — do sprawdzenia).
- Sklep: `store/listing-en.md`, `store/listing-de.md`, grafika do Google
  Play z napisem per język (`tools/render-art.js`), zrzuty ekranu.
- Przegląd układu: najdłuższe teksty (niemiecki ~30% dłuższy) na małym
  ekranie — zrzuty kluczowych ekranów w obu językach.
- Test dymny aplikacji po angielsku: na ekranach żadnych polskich liter
  (łapie wywołanie modułu bez słownika — domyślne `s = pl`).
- Imiona zapisane w partii („Ty”, postacie) zostają w języku z chwili
  rozpoczęcia — wznowiona partia po zmianie języka pokazuje stare imiona;
  rozważyć wyświetlanie miejsca człowieka i postaci wg id, nie zapisanego
  imienia (lokalnie; Wi‑Fi bez zmian).
- **Gotowe, gdy:** cała aplikacja i opisy sklepu w EN i DE, przegląd
  tłumaczeń przez rodzimego użytkownika (właściciel organizuje), testy
  zielone.

### Etap 14 — Czeski, słowacki, węgierski
- Jak Etap 13: glosariusz, `cs.ts`, `sk.ts`, `hu.ts`, opisy sklepu
  („Oko bere”, „Oko berie”, „Huszonegy” w nazwie lub słowach kluczowych),
  grafiki, przegląd układu.
- Reguły liczby mnogiej cs/sk (1 / 2–4 / 5+), węgierski bez odmiany po
  liczebniku.
- **Gotowe, gdy:** jak Etap 13.

### Etap 15 — Ukraiński, rosyjski, BCMS
- Cyrylica: czcionka z Etapu 12 sprawdzona na wszystkich ekranach.
- `uk.ts` (wymagany na Ukrainie), `ru.ts` (Kazachstan, diaspora; nazwa
  zawsze „Очко 21”, nigdy samo „Очко”), `sh.ts` — jedna wersja łacińska
  dla Serbii, Chorwacji, BiH i Czarnogóry („Ajnc”).
- Dystrybucja: Rosja i Białoruś wyłączone w konsolach sklepów (płatności,
  sankcje — `docs/RYNKI.md`).
- **Gotowe, gdy:** jak Etap 13.

Presety reguł regionalnych (talia 36 kart, inne wartości figur, Pontoon,
7½) to osobne etapy po językach — zmiana silnika, nie tłumaczenie.

---

## 8. Trwałe dane (klucze)

`oczko.save.v1`, `oczko.stats.v1`, `oczko.settings.v1` (od Etapu 12: `v2` z polem `lang`), `oczko.rules.v1`
(reguły domowe z onboardingu), `oczko.newgame.v1`, `oczko.history.v1`,
`oczko.onboarding.v1`, `oczko.hints.v1`, `oczko.premium.v1`, `oczko.pro.v1`,
`oczko.looks.v1`, `oczko.lanStats.v1`.
Każdy typ z funkcją `looksLike…`; zły JSON → `null`, nigdy wyjątek.

---

## 9. Zgodność: brak symulowanego hazardu (obowiązuje zawsze)

- Żadnych żetonów, stawek, zakładów, puli, waluty, „podwajania”, „wszystko
  albo nic”. Punkty nie są do kupienia, wydania ani wymiany.
- Słowa zakazane w UI, opisach sklepu, powiadomieniach i reklamach:
  kasyno, żetony, obstaw/zakład, stawka, krupier, wygraj pieniądze, jackpot,
  liczenie kart, szuler, blackjack (w opisie dopuszczalne tylko jako „Oczko —
  polska gra w 21”). Zamiast „krupier” — „bankier”/„bank”.
- Grafika: domowy stół (sukno lub drewniany blat), bez napisów na suknie,
  żetonów, ruletki.
- `store/rating-answers.md`: odpowiedzi do kwestionariusza IARC (Google Play)
  i Apple („Simulated Gambling: None”), uzasadnienie (gra na punkty bez
  zakładów), zrzuty ekranu do ewentualnego odwołania.
- Test automatyczny (`src/__tests__/forbiddenWords.test.ts`): przeszukuje
  `src/` i `store/` wyrażeniami z rdzeniami i granicą słowa (np.
  `\bzakład(?!k)`, `\bstawk`, `\bobstaw`, `\bżeton`, `\bkasyn`, `\bkrupier`,
  `\bjackpot`, `liczeni\w* kart`, `\bszuler`, `\bblackjack`) — „zakładka”,
  „wstawka”, „podstawka” nie są błędem. Wyjątki: plik testu, ta lista
  i dozwolone zdanie o blackjacku.

---

## 10. Monetyzacja — zawartość

**Darmowe:** pełna gra 2–6 graczy, oba tryby, wszystkie reguły domowe,
partie, profil, historia ostatnich 10 partii, Wi‑Fi do 4 osób.

**Oczko Pro** (roczna z okresem próbnym lub jednorazowo):
- stoły 7–8 osób (lokalnie i Wi‑Fi; wystarczy host Pro),
- trener bez limitu (poza Wi‑Fi), analiza decyzji bez limitu,
- pełna historia (50), powtórki, eksport, rozszerzone statystyki,
- talie, sukna, rewersy; host Pro narzuca wygląd gościom.

**Portfel dzienny (bez Pro):** 3 podpowiedzi trenera, 1 analiza partii,
1 stół 7–8 osób; reklama z nagrodą: +1 do wybranego limitu albo wygląd
na 24 h. Reset o północy.

---

## 11. Definicja ukończenia całości

- Etapy 0–11 z kryteriami spełnionymi, testy i typecheck zielone.
- README: architektura, funkcje, konfiguracja właściciela krok po kroku
  (RevenueCat, AdMob z blokadą kategorii, podpisywanie, EAS, kwestionariusze
  ratingów).
- `docs/STATS.md` i `docs/BOTS.md` aktualne.
- Pliki tymczasowe usunięte.

---

## 12. Wiele języków — decyzje i zasady

Podstawa: raport rynków `docs/RYNKI.md`. Kolejność języków wg rynków: EN (sklepy,
język zapasowy) → DE (DE/AT) → CS, SK → HU → UK, RU (KZ) → BCMS.

| Decyzja | Wartość |
|---|---|
| Biblioteka | brak (własne `t()`, typy z `pl.ts`); jedyna nowa zależność: `expo-localization` |
| Język bazowy | polski (`pl.ts` — źródło kluczy i typów) |
| Język zapasowy | angielski dla telefonu w nieobsługiwanym języku; polski, gdy telefon po polsku |
| Wybór | „Automatycznie (język telefonu)” albo ręcznie w Ustawieniach |
| Liczba mnoga | własne reguły CLDR: pl, cs/sk, uk/ru, sh (1 / 2–4 / reszta z wyjątkami), en/de (1 / reszta), hu (bez odmiany) |
| Nazwa gry w UI | „Oczko” jako marka we wszystkich językach; lokalna nazwa gry w podtytule i opisie sklepu |
| Postacie | lokalne imiona per język, te same portrety, kolory i poziomy |
| Wi‑Fi | reakcje i komunikaty jako identyfikatory; imiona graczy bez zmian |
| Reguły | język nie zmienia reguł (presety regionalne osobno) |
| Tłumaczenia | szkic tłumaczenia w repozytorium + przegląd rodzimego użytkownika przed wydaniem języka |

**Słownictwo bez hazardu w każdym języku.** Test słów zakazanych dostaje listy
rdzeni per język, m.in.:
EN casino, chip(s), bet, wager, stake, croupier, jackpot, gambl, blackjack,
card counting; DE Kasino/Casino, Jeton, Einsatz, Wette, wetten, Croupier,
Jackpot, Glücksspiel; CS/SK kasino, žeton, sázk/stávk, krupiér, jackpot;
HU kaszinó, zseton, tét, fogad, krupié, jackpot; UK/RU казино, фішк/фишк,
ставк, крупʼє/крупье, джекпот; BCMS kazino, žeton, ulog, oklad, krupije,
džekpot. Granice słowa i wyjątki (np. DE „Wetter”, HU „tét” vs „tétel”)
ustalane z testem, jak dla polskiego.

**Neutralność płciowa.** Jak po polsku: bez form czasu przeszłego zależnych od
płci (CS, SK, UK, RU, BCMS) — czas teraźniejszy, tryb rozkazujący,
rzeczowniki („Fura!”, „Twoja kolej”).

**Ryzyko „simulated gambling”.** Teksty i opisy sklepu w każdym języku: gra na
punkty, bez stawek; nigdy „blackjack”/„casino” w nazwie ani słowach
kluczowych; kwestionariusze ocen wiekowych z tymi samymi odpowiedziami co
dla Polski (`store/rating-answers.md`).

**Ustalenia z Etapu 12:**
- Daty i liczby formatują funkcje słownika (bez `Intl`).
- Czcionka dla cyrylicy (Etap 15): Literata ExtraBold
  (`@expo-google-fonts/literata`, SIL OFL; cyrylica i greka). Do tego czasu
  system rysuje brakujące znaki czcionką systemową.
- Moduły bez Reacta mają domyślny parametr `s = pl`: w Etapie 13 test dymny
  aplikacji po angielsku sprawdza, że na ekranie nie ma polskich liter
  (wykrywa wywołanie bez słownika).
- Do sprawdzenia w Etapie 13: `locales` w `app.json` dla Androida w SDK 58
  (nazwa aplikacji per język).
