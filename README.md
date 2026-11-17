# Oczko

Mobilna gra w karty **Oczko** (polska gra w 21) — Expo + React Native +
TypeScript. Gra na punkty, bez obstawiania: wygrana runda = +1 punkt.

## Stan prac

| Etap | Opis | Stan |
|---|---|---|
| 0 | Repozytorium, plan, makiety | gotowe |
| 1 | Szkielet: Expo, TS strict, Jest, ESLint, lobby z zakładkami, komponenty bazowe, `kv.ts` | gotowe |
| 2–11 | wg `PLAN.md` §7 | — |

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

## Architektura (stan na Etap 1)

```
App.tsx                 korzeń: SafeAreaProvider, DialogProvider, czcionka, splash,
                        stan `Screen` (bez biblioteki nawigacji), „wstecz” Androida
src/home/               HomeScreen (lobby „Graj”), TabBar (Graj · Profil · Zasady), SoonScreen
src/engine/cards.ts     kodowanie kart 0..51 (ranga = (id >> 2) + 2, kolor = id & 3), talie 24/32/52
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

## Testy

- `src/storage/__tests__/kv.test.ts` — brak / zły JSON / odrzucony przez
  walidator → `null`, kolejność zapisów, awaria magazynu.
- `src/ui/__tests__/components.test.tsx` — Button3D, Dialog, BottomSheet,
  Header, karty (etykiety dla czytnika ekranu), Portrait.
- `src/ui/__tests__/plural.test.ts`, `src/ui/__tests__/haptics.test.ts`,
  `src/engine/__tests__/cards.test.ts`.
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
