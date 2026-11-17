# Oczko

Mobilna gra w karty **Oczko** (polska gra w 21) — Expo + React Native +
TypeScript. Gra na punkty, bez obstawiania: wygrana runda = +1 punkt.

## Stan prac

| Etap | Opis | Stan |
|---|---|---|
| 0 | Repozytorium, plan, makiety | gotowe |
| 1 | Szkielet: Expo, TS strict, Jest, ESLint, lobby z zakładkami, komponenty bazowe, `kv.ts` | gotowe |
| 2 | Silnik: reguły, punktacja, runda, partia, widok miejsca | gotowe |
| 3–11 | wg `PLAN.md` §7 | — |

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
| `npm run art` | generuje ikonę, splash i ikony interfejsu (`tools/render-*.js`, Chromium przez Playwright) |

## Architektura (stan na Etap 2)

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
