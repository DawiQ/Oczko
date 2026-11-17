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
| 5 | Stół: układ, animacje, dźwięki, koniec rundy i partii, menu, wskazówki | gotowe |
| 6 | Lobby, nowa gra, onboarding, samouczek, zasady, ustawienia | gotowe |
| 7 | Trener, historia partii, powtórka, analiza decyzji, eksport | gotowe |
| 8 | Profil: rangi, odznaki, statystyki, następny rywal | gotowe |
| 9 | Gra przez Wi‑Fi: stół u gospodarza, goście, kod, QR, mDNS, rozłączenia | gotowe |
| 10–11 | wg `PLAN.md` §7 | — |

## Uruchomienie

```bash
npm install
npx expo run:android    # od Etapu 9 własny build (expo-dev-client: TCP, mDNS, aparat)
npm start               # serwer Metro dla dev clienta
```

## Komendy

| Komenda | Co robi |
|---|---|
| `npm test` | testy Jest |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (konfiguracja Expo) |
| `npm run tournament` | kalibracja poziomów botów → `docs/BOTS.md`, `src/ai/calibration.ts` |
| `npm run stats` | statystyki reguł z symulacji → `docs/STATS.md` |
| `npm run art` | generuje ikonę, splash, ikony, sukno i bandy (`tools/render-*.js`, Chromium przez Playwright) |
| `npm run sounds` | syntetyzuje dźwięki (`tools/render-sounds.py`, numpy) |

## Architektura (stan na Etap 9)

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
src/table/              stół (makiety 4–8), działa na dowolnym TableGame
  TableScreen.tsx       bandy z drewna, sukno, rywale na łuku, talia, podpis „na żywo”,
                        moja ręka (wachlarz + wynik), Dobieram / Starczy / Pokaż wynik, menu ☰
  OpponentSeat.tsx      portret, punkty, karty (rewersy / odkryte), status, BANK, rozdający
  Hand.tsx              wachlarz z animacją dobrania (lot + obrót)
  Effects.tsx           stempel „Fura!”, „Perskie oczko!” (promienie, asy, konfetti), konfetti
  RoundEnd.tsx          koniec rundy (ręce, kto punktuje, paski punktów), koniec partii (podium)
  texts.ts, layout.ts   czyste funkcje: komunikaty (neutralne płciowo), rozmieszczenie miejsc
  hints.ts              jednorazowe wskazówki (oczko.hints.v1)
src/onboarding/         „Jak grasz u siebie?” (Welcome), samouczek: skryptowana runda z ziarna
                        (tutorialScript, tools/find-tutorial-seed.ts, sprawdzana testem)
src/newgame/            NewGameScreen (rywale − n +, tryb, długość, reguły w BottomSheet),
                        RulesEditor (wszystkie warianty), HouseRulesScreen, rulesText (opisy)
src/info/RulesScreen    zasady: rodzinne, z bankierem, warianty, przykłady rąk, wartości kart
src/home/SettingsSheet  dźwięk, wibracje, trener, tempo rywali, reguły domowe, wskazówki od nowa
src/storage/settings, houseRules, onboarding, newGame   oczko.settings / rules / onboarding / newgame .v1
src/trainer/TrainerPanel  trener przy ręce: P(fura), Starczy / Dobieram (%), lepszy przycisk
                        podświetlony; ewaluator w kawałkach; tylko z widoku gracza
src/history/            record (partia = ziarno + reguły + decyzje, powtórka z silnika),
                        analysis (najlepsza / dobra / ryzykowna / błąd: utrata szansy ≤ 3 / ≤ 10 pp),
                        HistoryScreen (lista, eksport JSON), ReplayScreen (rundy, suwak, autoodtwarzanie)
src/storage/history.ts  oczko.history.v1: 50 ostatnich partii (bez Pro widać 10)
src/profile/            progress (rangi wg doświadczenia: Dziewiątka → … → As → Perskie oczko;
                        7 odznak), suggest (następny rywal), ProfileScreen (makieta 9)
src/lan/                gra ze znajomymi przez Wi‑Fi (z Pana, dopasowana)
  protocol.ts           JSON w liniach, wersja protokołu, walidacja każdej wiadomości
  host.ts               gospodarz = stół (ten sam GameController); goście jako miejsca zdalne;
                        30 s na ruch (potem „Starczy”), po rozłączeniu 60 s, potem bot pod
                        imieniem gościa, powrót tokenem; reakcje; 4 osoby (8 z Pro gospodarza)
  guest.ts              gość: wysyła tylko Dobieram / Starczy, dostaje swój widok, ponawia połączenie
  discovery.ts, code.ts mDNS `_oczko._tcp`, 4-znakowy kod stołu, QR (`oczko://stol?…`), port 47676
  LanScreen.tsx         menu, lobby gospodarza (kod, QR, miejsca, boty), dołączanie, lobby gościa, stół
src/storage/lan.ts      oczko.lanStats.v1: imię przy stole, wyniki przez Wi‑Fi
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

## Stół

- Rywale na łuku nad stołem (od mojej lewej), mniejsze portrety przy 6–7
  rywalach; ich karty zakryte do odsłonięcia (ujawniona fura od razu).
- Na koniec rundy ręce odsłaniają się po kolei, potem panel z wynikiem.
- Dźwięki (dobranie, Starczy, fura, perskie oczko, wygrana, koniec partii)
  i haptyka; animacje przez `Animated` z native driverem, przy „ogranicz
  ruch” — bez ruchu.
- Dostępność: podpis „na żywo” (`accessibilityLiveRegion`), etykiety kart
  i miejsc, cele ≥ 44 px, nakładki `accessibilityViewIsModal`.

## Profil

- Doświadczenie: runda +1, runda z punktem +2, wygrana partia +10, odznaka +15.
- Rangi (nazwy kart, neutralne płciowo): Dziewiątka 0, Dziesiątka 50,
  Walet 150, Dama 350, Król 700, As 1200, Perskie oczko 2000.
- Odznaki: Perskie oczko, Równe 21, Oczko z pięciu kart, Na krawędzi
  (wygrana z 21 po dobraniu przy 17+), Żelazny bank (bank wygrywa wszystkie
  pojedynki, 2+ graczy), Seria (5 rund z rzędu), Weteran (100 partii).
  Trening się nie liczy.

## Wi‑Fi

- Gospodarz zakłada stół: kod (np. „K7 4Q”), QR i ogłoszenie mDNS; dodaje
  miejsca dla znajomych i boty. Goście dołączają z listy, kodem albo QR.
- Gospodarz prowadzi partię (ten sam kontroler co lokalnie); każdy gość
  dostaje wyłącznie swój widok. Trener przy stole Wi‑Fi jest wyłączony.
- Uprawnienia: iOS `NSLocalNetworkUsageDescription`, `NSBonjourServices`
  (`_oczko._tcp`), aparat do QR.

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
- `src/table/__tests__/` — render stołu z zamockowanym kontrolerem (ruch,
  „Pokaż wynik”, koniec rundy i partii, menu z poddaniem, wskazówki),
  komunikaty dla każdego momentu partii (bez form rodzajowych), układ miejsc.
- `src/storage/__tests__/save-stats.test.ts` — walidacja zapisu (zepsute
  dane → `null`), reduktory statystyk, brak utraconych aktualizacji.
- `src/__tests__/App.render.test.tsx` — test dymny: onboarding → nowa gra →
  cała partia („Pokaż wynik”) → lobby → wznowienie; samouczek; ustawienia
  i reguły domowe; zakładki i „wstecz” Androida.
- `src/history/__tests__`, `src/trainer/__tests__` — zapis → odczyt →
  powtórka identyczna (family i bank), inna wersja silnika / zła decyzja,
  tabela klasyfikacji decyzji, limit 50 i zepsute rekordy, ekrany historii
  i powtórki, trener tylko w moim ruchu i z mojego widoku.
- `src/profile/__tests__` — każda odznaka (z rundy i z liczników, także
  „o jeden za mało”), każdy próg rangi, sugestia rywala, ekran profilu.
- `src/lan/__tests__` — protokół na transporcie pamięciowym: host + 3 gości
  (family i bank), żaden gość nie dostaje cudzych zakrytych kart, rozłączenie
  → bot → powrót, wynik = lokalna powtórka tych samych decyzji; odmowy
  (pełny stół, gra trwa, inna wersja), „Starczy” po czasie, parsowanie;
  ekrany: gospodarz z botem, gość po kodzie, obaj przy stole.
- `src/onboarding/__tests__`, `src/newgame/__tests__`, `src/storage/__tests__/prefs.test.ts`
  — ziarno samouczka, nowa gra (limity, wybory), opisy reguł, walidatory.

## Dokumenty

- `PLAN.md` — plan implementacji, decyzje (§0), specyfikacja silnika, etapy.
- `CLAUDE.md` — zasady pracy i architektury.
- `docs/BLUEPRINT.md` — opis aplikacji Pan (wzorzec architektury).
- `docs/mockups/oczko-makiety.html` — makiety ekranów (zaakceptowane).

## Wzorzec

Repozytorium Pana (`dawiq/pan`, gałąź `ccr-3c56375b-8hrsv2`) sklonowane obok
w `../pan`, tylko do odczytu.
