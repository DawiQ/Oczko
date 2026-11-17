# CLAUDE.md — Oczko

Aplikacja mobilna do gry w Oczko (Expo + React Native + TypeScript), gra na
punkty, bez obstawiania. Plan prac: `PLAN.md`. Wzorzec architektury:
`docs/BLUEPRINT.md` i repozytorium Pana sklonowane w `../pan`, gałąź
`ccr-3c56375b-8hrsv2` (tylko do odczytu — nic tam nie zmieniaj; `main` Pana
to stary „Pan Advisor”, nie wzorzec). Makiety: `docs/mockups/`.

## Komunikacja
- Odpowiedzi po polsku, krótko, bez długich wyjaśnień.
- Zawsze całe pliki zamiast fragmentów.

## Sposób pracy
- Pracuj na osobnej gałęzi; commit + push po każdym kroku; PR tylko na prośbę.
- Jeden etap z `PLAN.md` na raz. Nie zaczynaj kolejnego bez prośby.
- Po każdej większej funkcji: self-review (błędy, skrajne przypadki, brakujące
  testy), poprawki w osobnym commicie.
- Przed większą funkcją UI (stół, lobby/onboarding, paywall) — makieta HTML
  do akceptacji (`docs/mockups/`).
- Decyzje oparte na pomiarach (`npm run stats`, `npm run tournament`), nie na oko.
- Pliki tymczasowe i skrypty pomocnicze usuwaj na koniec zadania.
- Aktualizuj README przy każdej nowej funkcji.

## Komendy
- `npm test` — Jest
- `npm run typecheck` — tsc
- `npm run lint`
- `npm run stats` — symulacje → `docs/STATS.md`
- `npm run tournament` — kalibracja botów → `docs/BOTS.md`
- `npm run art` — grafiki z `tools/render-*.js`
- `node build.js` — build (menu interaktywne)

Przed commitem: `npm test` i `npm run typecheck` muszą przejść.

## Zasada nadrzędna: zero hazardu
- Brak żetonów, stawek, zakładów, puli i jakiejkolwiek waluty. Wygrana runda
  = punkt. Nic kupowanego nie wpływa na rozgrywkę z innymi ludźmi.
- Nie używaj słów: kasyno, żetony, obstaw, zakład, stawka, krupier, jackpot,
  liczenie kart, szuler (pełna lista i wyjątki: `PLAN.md` §9). Test w Jest
  pilnuje (rdzenie + granica słowa, „zakładka” dozwolona).
- Bez kasynowej grafiki.

## Architektura — zasady obowiązkowe
- `src/engine/` — czysty TS, bez Reacta, bez efektów ubocznych, losowość tylko
  z RNG z ziarnem. Ten sam seed + te same decyzje → identyczny przebieg.
- Ukryta informacja: boty, UI i goście Wi‑Fi dostają wyłącznie `viewFor(seat)`
  i zdarzenia przefiltrowane przez `eventsFor(seat)`. Nigdy nie przekazuj
  pełnego stanu rundy, talii ani ziarna poza silnik i kontroler.
  Nieujawniona fura rywala jest widoczna jako „Starczy”.
- Brak rewanżu na tych samych kartach w grze na punkty (tylko `replayRound`
  w Treningu, bez punktów i statystyk).
- Trener wyłączony w grze Wi‑Fi.
- `src/ai/` — czyste funkcje; ewaluator anulowalny (licznik epok), liczony
  w kawałkach, nie blokuje UI.
- `GameController` bez Reacta; `sleep` i ewaluator wstrzykiwane; UI dostaje
  tylko niemutowalny `GameSnapshot`. `useGame` to jedyne spoiwo z Reactem.
- Stół korzysta wyłącznie z interfejsu `TableGame` (lokalnie, host, gość Wi‑Fi).
- Każda usługa zewnętrzna: interfejs + implementacja + wariant „brak”
  (`noStore`, `noAds`, `memoryKV`, transport pamięciowy).
- Konteksty bez providera zwracają wariant „bez ograniczeń”.
- Trwałe dane przez `kv.ts`: klucze `oczko.<nazwa>.v<N>`, walidator
  `looksLike…`, zły JSON → `null`, nigdy wyjątek.
- Zapisy stanu mają pole wersji `v`; rekordy historii — `engineVersion`.
- Nawigacja bez bibliotek: stan `Screen` w `App.tsx`.
- Animacje przez `Animated` z native driverem; szanuj `reduceMotion`.
- Reklamy tylko na żądanie użytkownika, nigdy w trakcie rundy.

## UI
- Stała ciemna paleta (`src/ui/palette.ts`, akcent Miedź `#E8925A`),
  komponenty bazowe z `src/ui/`.
- Słownictwo ze stołu: „Dobieram”, „Starczy”, „Fura!”, „Perskie oczko!”, „Bank”.
- Teksty po polsku, neutralne płciowo (bez „dobrałeś/dobrałaś”), odmiana
  liczebników przez `plural`.
- Dostępność: role, etykiety kart, `accessibilityLiveRegion` dla przebiegu
  rundy, cele dotyku ≥ 44 px, `accessibilityViewIsModal` dla nakładek.
- Grafiki i dźwięki tylko własne, generowane skryptami z `tools/`.

## Testy
- Silnik: niezmienniki, determinizm, tabele przypadków punktacji i rozliczeń,
  `viewFor` / `eventsFor` bez cudzych kart.
- Boty/ewaluator: dokładne P(fura), zbieżność MC, monotoniczność poziomów.
- Kontroler: bez UI, natychmiastowy `sleep`, stałe ziarno, mock ewaluatora.
- `src/__tests__/App.render.test.tsx` — test dymny całej aplikacji.
- `src/__tests__/forbiddenWords.test.ts` — słowa zakazane w `src/` i `store/`.
- Protokół Wi‑Fi na transporcie pamięciowym.
- Mocki modułów natywnych w `jest.setup.js`.
