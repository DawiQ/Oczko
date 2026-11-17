# Oczko

Mobilna gra w karty **Oczko** (polska gra w 21) — Expo + React Native +
TypeScript. Gra na punkty, bez obstawiania: wygrana runda = +1 punkt.

## Stan prac

| Etap | Opis | Stan |
|---|---|---|
| 0 | Repozytorium, plan, makiety | gotowe |
| 1 | Szkielet: Expo, TS strict, Jest, ESLint, lobby z zakładkami, komponenty bazowe, `kv.ts` | gotowe |
| 2 | Silnik: reguły, punktacja, runda, partia, widok miejsca | gotowe |
| 3 | Boty, ewaluator, turniej, statystyki | gotowe |
| 4 | Kontroler gry, zapis i wznawianie, statystyki | gotowe |
| 5–11 | wg `PLAN.md` §7 | — |

## Uruchomienie

```bash
npm install
npx expo start          # Expo Go (do Etapu 8)
```

## Komendy

| Komenda | Co robi |
|---|---|
| `npm test` | testy Jest |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (konfiguracja Expo) |
| `npm run tournament` | kalibracja poziomów botów → `docs/BOTS.md`, `src/ai/calibration.ts` |
| `npm run stats` | statystyki reguł z symulacji → `docs/STATS.md` |
| `npm run art` | generuje ikonę, splash i ikony interfejsu (`tools/render-*.js`, Chromium przez Playwright) |

## Architektura (stan na Etap 4)

```
App.tsx                 korzeń: SafeAreaProvider, DialogProvider, czcionka, splash,
                        stan `Screen` (bez biblioteki nawigacji), „wstecz” Androida
src/home/               HomeScreen (lobby „Graj”), TabBar (Graj · Profil · Zasady), SoonScreen
src/engine/             silnik: czysty TS, bez Reacta, losowość tylko z ziarna (PLAN.md §4)
  cards.ts              karty 0..51 (ranga = (id >> 2) + 2, kolor = id & 3), talie 24/32/52
  rng.ts                mulberry32 (czysty stan), splitmix32, ziarno rundy, tasowanie
  rules.ts              reguły domowe, DEFAULT_RULES, PRESETS, MAX_SEATS, validateRules
  score.ts              wartość ręki (as 11 / 1 lub 11, perskie oczko, fura)
  round.ts              runda: rozdanie, Dobieram/Starczy, automatyczne perskie/fura/limit kart,
                        bank gra ostatni (nie gra, gdy wszyscy mają ujawnioną furę), rozliczenie
  match.ts              partia do celu, dogrywka przy remisie na szczycie, rotacja rozdającego i banku
  view.ts               viewFor(seat) i eventsFor(seat): tylko karty odkryte, ukryta fura = „Starczy”
src/ai/                 boty: czyste funkcje, decyzje tylko z SeatView
  evaluate.ts           ewaluator: dokładne P(fura) + Monte Carlo szans (Starczy / Dobieram),
                        typowane tablice, w kawałkach z anulowaniem (licznik epok)
  policies.ts           polityki: próg, próg z szumem, „patrzy na stół”, ewaluator; PolicySpec
  personas.ts           8 postaci = poziomy (od najsłabszej, kolejność z turnieju)
  simulate.ts           boty grające rundy i partie (turniej, statystyki, testy)
  calibration.ts        zmierzona siła postaci (generowane przez turniej)
src/game/               logika gry bez Reacta
  setup.ts              GameSetup: reguły, miejsca (człowiek / bot / zdalny), ziarno, tryb
  GameController.ts     kolejka ruchów, tempo botów, odsłanianie rąk po kolei, zapis po ruchu,
                        „Pokaż wynik”, rewanż (nowe karty), „ta runda jeszcze raz” (Trening)
  TableGame.ts          interfejs stołu + GameSnapshot (tylko widok człowieka)
  pace.ts               tempo: wolne / normalne / szybkie
  useGame.ts            jedyne spoiwo z Reactem (autozapis, statystyki, sprzątanie)
src/storage/save.ts     trwająca partia (oczko.save.v1), walidacja całego stanu
src/storage/stats.ts    statystyki (oczko.stats.v1), czyste reduktory, aktualizacje po kolei
src/storage/kv.ts       KV (AsyncStorage / pamięć), readJSON z walidatorem (zły JSON → null), kolejka zapisów
src/ui/                 paleta (akcent Miedź), Button3D, BottomSheet, Dialog (useConfirm), Header,
                        Portrait, CardFace/CardBack, plural, haptyka, czcionka Fraunces, ikony
tools/                  render-art.js (ikona, adaptive icon, splash), render-game-art.js (ikony)
```

- „Wstecz” na Androidzie: ekran → zakładka, z której go otwarto; zakładka
  Profil/Zasady → Graj; lobby → wyjście z aplikacji. Otwarte BottomSheety
  obsługują „wstecz” pierwsze.
- Grafiki tylko własne, generowane skryptami z `tools/`. Plakietka „21”
  na ikonie jest prostokątna (nie przypomina żetonu).

## Zgodność: zero hazardu

`src/__tests__/forbiddenWords.test.ts` przeszukuje `src/`, `store/`,
`App.tsx` i `app.json` pod kątem słów zakazanych (`PLAN.md` §9): rdzenie
z początkiem słowa, więc „zakładka”, „wstawka” czy „podstawka” przechodzą.

## Silnik — zasady w skrócie

- Runda: talia tasowana z `roundSeed(seedBase, roundNo)`, każdy dostaje
  `startCards`, gracze po kolei od lewej rozdającego (bank ostatni).
- Po każdej karcie: perskie oczko (dwa asy) → „Starczy” + ogłoszenie;
  > 21 → fura (karty odkryte przy `bustRevealed`); limit kart → koniec ręki.
  21 nie kończy ruchu. Pusta talia → tylko „Starczy”.
- Rodzinne: perskie > najwyższy wynik ≤ 21; remis wg `familyTie`.
- Z bankierem: każdy gracz vs bank; gracz +1 za wygrany pojedynek, bank +1
  za większość wygranych (`majority`) albo za każdy (`perDuel`).
- Partia: wygrywa jedyny lider z wynikiem ≥ celu po pełnej rundzie.

## Boty

| Poziom | Postać | Polityka |
|---|---|---|
| 1 | Zosia (Początki) | staje przy 15, 25% losowych decyzji |
| 2 | Kuba (Łatwy) | staje przy 14 |
| 3 | Witek (Ryzykant) | staje przy 20 |
| 4 | Hela (Ostrożna) | staje przy 16 |
| 5 | Ola (Średni) | staje przy 17 |
| 6 | Marek (Trudny) | staje przy 17, patrzy na stół |
| 7 | Profesor (Ekspert) | ewaluator, 40 próbek |
| 8 | Hrabia (Mistrz) | ewaluator, 1500 próbek |

Kolejność i rozróżnialność sąsiednich poziomów zmierzone turniejem
(`docs/BOTS.md`, porównanie parami na tych samych rozdaniach, z > 2).
Ewaluator: ok. 7–11 ms na 1500 próbek w Node (`docs/STATS.md`). Siła
w Oczku ma niski sufit (mało informacji) — najlepsze boty wygrywają
ok. 36% rund rodzinnych przy 4 graczach.

Ewaluator wnioskuje z tego, co widać: liczba kart, ogłoszone perskie oczko,
„Starczy” (ręka zgodna z modelem przeciwnika), ujawnione fury. Rywal, który
nie pasuje do modelu, po kilkunastu próbkach przestaje być wymuszany.

## Testy

- `src/storage/__tests__/kv.test.ts` — brak / zły JSON / odrzucony przez
  walidator → `null`, kolejność zapisów, awaria magazynu.
- `src/ui/__tests__/components.test.tsx` — Button3D, Dialog, BottomSheet,
  Header, karty (etykiety dla czytnika ekranu), Portrait.
- `src/ui/__tests__/plural.test.ts`, `src/ui/__tests__/haptics.test.ts`.
- `src/engine/__tests__/` — karty, RNG (jednorodność tasowania), reguły
  (walidacja), wartości rąk (tabele), runda (ruchy, niezmienniki na 1500
  losowych rundach, determinizm, brak mutacji), rozliczenia (tabele family
  i bank), partia (koniec, dogrywka, rotacja), widok (tysiące stanów bez
  cudzych zakrytych kart).
- `src/ai/__tests__/` — ewaluator (P(fura) dokładne na ręcznych przykładach,
  zbieżność MC z dokładnym wyliczeniem wszystkich kolejności kart,
  wnioskowanie z „Starczy” i perskiego oczka, kawałki = całość, anulowanie),
  polityki, postacie (kolejność = zmierzona siła), boty widzą tylko swój widok.
- `src/game/__tests__/` — kontroler bez UI (natychmiastowy `sleep`, stałe
  ziarno, mock decyzji botów): pełne partie family i bank, brak cudzych kart
  w snapshotach, odsłanianie po kolei, zapis → odczyt → kontynuacja = ten sam
  wynik, rewanż, „ta runda jeszcze raz”, „Pokaż wynik” w trakcie ruchu banku,
  błędy; `useGame` (autozapis, statystyki, sprzątanie).
- `src/storage/__tests__/save-stats.test.ts` — walidacja zapisu (zepsute
  dane → `null`), reduktory statystyk, brak utraconych aktualizacji.
- `src/__tests__/App.render.test.tsx` — test dymny: lobby, zakładki,
  ekran i powrót, „wstecz” Androida.

## Dokumenty

- `PLAN.md` — plan implementacji, decyzje (§0), specyfikacja silnika, etapy.
- `CLAUDE.md` — zasady pracy i architektury.
- `docs/BLUEPRINT.md` — opis aplikacji Pan (wzorzec architektury).
- `docs/mockups/oczko-makiety.html` — makiety ekranów (zaakceptowane).

## Wzorzec

Repozytorium Pana (`dawiq/pan`, gałąź `ccr-3c56375b-8hrsv2`) sklonowane obok
w `../pan`, tylko do odczytu.
