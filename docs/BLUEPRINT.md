# Pan — wzorzec dla kolejnej gry karcianej (np. „Wojna”)

Ten dokument opisuje aplikację **Pan** (repozytorium `dawiq/pan`) tak, by inna
sesja mogła zbudować podobną aplikację do innej gry karcianej. Najpierw jest
**co i jak** (stos, architektura, wzorce), potem **funkcje**, na końcu
**co przenieść do Wojny, a czego nie**. Ścieżki plików odnoszą się do
repozytorium Pana — tam warto zajrzeć po szczegóły.

---

## 1. Czym jest Pan

Gra w polską grę karcianą „Pan” (24 karty 9–A) na telefonie:

- gra z komputerem: 10 postaci (poziomów), 1–7 botów, pojedyncze rozdanie lub
  seria do 5 Panów, reguły domowe;
- trening z podpowiedziami silnika, historia i analiza rozdań, doradca do
  gry przy prawdziwym stole;
- gra ze znajomymi przez Wi‑Fi (każda osoba na swoim telefonie, bez internetu);
- profil: ranga, odznaki, statystyki;
- Pan Pro (subskrypcja roczna z okresem próbnym lub zakup jednorazowy) +
  reklamy z nagrodą dla osób bez Pro;
- wszystko po polsku, ciemny „stołowy” wygląd, animacje, dźwięki, haptyka.

---

## 2. Stos technologiczny

| Warstwa | Wybór |
|---|---|
| Aplikacja | **Expo SDK 58**, React Native 0.88 (New Architecture), React 19, TypeScript (strict) |
| Uruchamianie | `expo-dev-client` (własny build, nie Expo Go — są moduły natywne) |
| Silnik gry | **C++17, header-only**, lokalny moduł Expo `modules/pan-engine` (Kotlin/JNI na Androidzie, Swift → C ABI na iOS) |
| Zapis danych | `@react-native-async-storage/async-storage` za interfejsem `KV` |
| Czcionka | `@expo-google-fonts/fraunces` (Fraunces ExtraBold do tytułów i indeksów kart) |
| Dźwięk / haptyka | `expo-audio` (krótkie syntetyczne efekty), `expo-haptics` |
| Wi‑Fi | `react-native-tcp-socket` (TCP), `react-native-zeroconf` (mDNS), `expo-network` (IP), `expo-camera` (skan QR), `qrcode-generator` |
| Zakupy | `react-native-purchases` (RevenueCat), uprawnienie `pro` |
| Reklamy | `react-native-google-mobile-ads` (AdMob rewarded + formularz zgód UMP) |
| Testy | Jest 30 + `jest-expo` + `react-test-renderer`; silnik: osobne testy g++ |
| Build | `build.js` (interaktywne menu strzałkami; Android APK/AAB, iOS lokalnie przez Xcode lub w chmurze przez EAS), `eas.json` |

Nawigacji **nie robi** żadna biblioteka — `App.tsx` trzyma stan `Screen`
(unia typów) i sam obsługuje przycisk „wstecz” Androida. Przy kilkunastu
ekranach to prostsze i w pełni testowalne.

---

## 3. Struktura katalogów

```
App.tsx                 korzeń: providery, stan ekranu, wstecz na Androidzie, ładowanie danych, splash
index.ts                registerRootComponent
app.json                konfiguracja Expo (uprawnienia, pluginy, extra.monetization)
build.js                skrypt budowania (menu interaktywne, Android/iOS/EAS)
plugins/                plugin Expo: podpisywanie wydań lokalnych
assets/                 ikona, splash, grafiki stołu (assets/game), dźwięki
tools/                  generatory grafik (SVG -> PNG przez Chromium) i dźwięków (numpy)
store/                  teksty do sklepu, polityka prywatności, RELEASE.md (checklista)
docs/                   ten dokument
modules/pan-engine/     silnik (C++ + most TS) — patrz §5
src/
  home/                 lobby z zakładkami (Graj · Profil · Zasady), TabBar
  newgame/              wybór przeciwników, trybu i reguł
  table/                stół: TableScreen (TableView), RoundEnd, SeriesTable, wskazówki
  game/                 GameController (logika rozgrywki bez Reacta), TableGame, useGame
  history/              zapis przebiegu rozdania, powtórka, analiza ruchów, eksport
  advisor/              doradca do prawdziwego stołu
  onboarding/           pierwsze uruchomienie, samouczek (skryptowane rozdanie)
  profile/              ranga, odznaki, statystyki, sugestia kolejnego rywala
  info/                 zasady gry
  lan/                  gra przez Wi‑Fi: protokół, host, gość, TCP, mDNS, kod stołu, QR, ekrany
  premium/              Pan Pro, portfel limitów, reklamy, paywall, wygląd (talie/sukna/rewersy), kody
  storage/              trwałe dane (kv, zapis gry, statystyki, ustawienia, historia)
  ui/                   paleta, karty, przyciski 3D, BottomSheet, dialogi, portrety, dźwięk, haptyka
  __tests__/            test „dymny” całej aplikacji (silnik zamockowany)
jest.setup.js           mocki modułów natywnych (AsyncStorage, TCP, zeroconf, kamera, RevenueCat, AdMob…)
```

---

## 4. Najważniejsze wzorce architektoniczne

To jest sedno — te zasady warto przenieść 1:1.

### 4.1 Logika gry bez Reacta, z wstrzykiwanymi zależnościami

`src/game/GameController.ts` to zwykła klasa TypeScript:

```ts
new GameController(setup: GameSetup, deps: ControllerDeps)
// deps: { advisor (silnik), sleep?, onEngineError?, onRoundEnd? }
```

- Trzyma pełny stan rozgrywki (rozdanie, seria, kolejność wyjścia, bot, który
  myśli), steruje tempem botów (`sleep` wstrzyknięty → testy działają bez
  czekania), zapisuje się (`SavedGame`, z polem wersji `v`).
- Na zewnątrz wystawia **`GameSnapshot`** — niemutowalny widok dla UI (faza,
  ręka gracza, stos, liczby kart, legalne ruchy, ostatnie akcje, wynik,
  seria, flagi typu `canSkip`, `canRematch`) i subskrypcję zmian.
- Akcje gracza (`play`, `draw`, `newRound`, `skipToEnd`, `rematch`…) zwracają
  kod błędu lub `null`; reguły sprawdza wspólny moduł reguł.
- `src/game/useGame.ts` to jedyne spoiwo z Reactem (tworzy kontroler,
  autozapis, statystyki, sprzątanie).
- `src/game/TableGame.ts` — interfejs tego, czego potrzebuje stół. Implementują
  go: lokalny kontroler, host Wi‑Fi (ten sam kontroler) i gość Wi‑Fi (zdalny
  widok). Dzięki temu **jeden komponent stołu** obsługuje wszystkie tryby.

### 4.2 Adaptery z bezpiecznym „pustym” wariantem

Każda zewnętrzna usługa ma interfejs + implementację + wariant „brak”:

- `StoreApi` → `revenueCatStore()` / `noStore` (gdy brak klucza lub modułu),
- `AdsApi` → `adMobAds()` / `noAds`,
- `KV` → `deviceKV` / `memoryKV()` (testy),
- transport Wi‑Fi → TCP / pamięciowy (testy protokołu bez sieci),
- silnik → natywny / mock w testach.

Provider wybiera implementację raz (`safely(make, fallback)`), a testy
wstrzykują fałszywki przez propsy (`App` przyjmuje `store?`, `ads?`).

### 4.3 Konteksty z domyślną wartością „bez ograniczeń”

`PremiumProvider` / `usePremium()`: bez providera kontekst zwraca wariant
„wszystko odblokowane” — izolowane testy komponentów nie muszą nic ustawiać.
Podobnie `LooksProvider` (klasyczny wygląd), `DialogProvider`.

### 4.4 Trwałe dane

`src/storage/kv.ts`:

- `readJSON(kv, key, validator)` — brak, uszkodzony JSON lub nieprzechodzący
  walidator → `null` (aplikacja nigdy nie pada przez złe dane),
- `writeJSON` — zapisy w kolejce, odczyt czeka na kolejkę (odczyt zawsze widzi
  wcześniejsze zapisy),
- klucze z wersją: `pan.premium.v1`, `pan.pro.v1`, `pan.looks.v1`,
  `pan.lanStats.v1`…; każdy typ ma funkcję `looksLike…` (strażnik typu),
- przy wczytaniu łączenie stanu zapisanego z tym, co zmieniło się zanim odczyt
  się skończył (`mergeWallets`).

Co jest zapisywane: trwająca gra (wznów po zamknięciu aplikacji), statystyki,
ostatnie wybory nowej gry, ustawienia, ukończony onboarding i wskazówki,
historia rozdań (ostatnie N, z analizami), portfel limitów, stan Pro (cache
offline), wybrany wygląd, statystyki Wi‑Fi.

### 4.5 Czyste funkcje tam, gdzie się da

Reguły (`modules/pan-engine/src/rules.ts`), reducer historii (`history.ts`),
portfel limitów (`premium/wallet.ts`: `spend`, `grant`, `rollover` o północy),
ranga/odznaki (`profile/progress.ts`), kod stołu (`lan/code.ts`), protokół
(`lan/protocol.ts`: parsowanie z walidacją) — wszystko bez efektów ubocznych
i z testami jednostkowymi.

### 4.6 Wydajność

Ciężkie obliczenia (wyszukiwanie ISMCTS) w C++ na wątku tła (`AsyncFunction`
w module Expo), anulowanie kooperacyjne (licznik epok), postęp odpytywany
z JS co ~250 ms. Wątek UI nigdy nie liczy. Animacje przez `Animated`
z natywnym driverem.

---

## 5. Silnik (dla Pana) — skrót

`modules/pan-engine/`:

- `cpp/pan/*.hpp` — czysty C++ bez zależności od RN: karty jako maski bitowe,
  stan gry i generowanie ruchów, losowanie ukrytych rąk (determinizacja),
  **SO-ISMCTS max^n**, wyuczona polityka rolloutów, sieć wartości (42 wejścia,
  2–8 graczy), poziomy botów (`Bots.hpp`), anulowanie;
- `cpp/PanBridge.hpp` — JSON na wejściu i wyjściu, waliduje wszystko i zwraca
  `{"error": …}` zamiast się wywalić;
- `src/` — API TypeScript (`advise()`, `cancelAdvice()`), czyste reguły,
  reducer historii, model rozdania i serii w JS (zapas, gdy silnik zawiedzie);
- `cpp/tools/` — turniej botów do kalibracji poziomów, generatory danych,
  trening sieci (numpy);
- testy: `npm run test:cpp` (g++, bez toolchainu RN).

Poziomy botów są **kalibrowane turniejem** (procent przegranych przeciw
sąsiednim poziomom), a nie ustawiane na oko.

---

## 6. Funkcje aplikacji

### 6.1 Lobby i nowa gra
- Zakładki **Graj · Profil · Zasady**; „Wznów serię” dla zapisanej gry;
  ustawienia (⚙︎): dźwięk, haptyka, widoczność znanych kart, prywatność reklam,
  wygląd.
- Nowa gra: postacie z licznikiem − n + (ta sama postać może siąść kilka razy:
  „Hrabia II”), tryb (rozdanie / seria do 5), reguły domowe w BottomSheet;
  wybory zapamiętane.
- 10 postaci = 10 poziomów, każda z portretem, kolorem (`LEVEL_COLOR`),
  imieniem i etykietą.

### 6.2 Stół
- Sukno między drewnianymi bandami, portrety przeciwników (liczba kart, znane
  karty, „myśli…”), stos, ręka jako wachlarz (grywalne uniesione, reszta
  przyciemniona), przyciski 3D na dolnej bandzie.
- Boty czekają ~0,8 s na ruch; gdy gracz skończy — przyspieszają; „Pokaż
  wynik” rozgrywa resztę natychmiast.
- Ochrona przed nieskończoną grą botów (limit ruchów, rosnąca losowość).
- Animacje lotu kart, dźwięki, haptyka; jednorazowe wskazówki przy pierwszych
  sytuacjach; menu ☰ i tabela serii jako BottomSheet.
- Ekran końca rozdania: podium, „stempel” przegranego, żetony serii,
  konfetti, następne rozdanie / nowa seria, rewanż na tych samych kartach.

### 6.3 Nauka
- Onboarding „Znasz Pana?” → reguły i dobór stołu, albo samouczek
  (skryptowane rozdanie odtwarzane prawdziwymi regułami, sprawdzane testem).
- Trening z podpowiedzią: silnik pokazuje najlepszy ruch na żywo, szanse
  każdego ruchu, pewność.
- Historia: oś czasu, powtórka ruch po ruchu (suwak, autoodtwarzanie), analiza
  Twoich ruchów (najlepszy / dobry / niedokładny / błąd), eksport JSON.

### 6.4 Profil
- Ranga wg rozdań bez przegranej (progi), 6 odznak, statystyki per postać,
  sugestia kolejnego rywala, reset.

### 6.5 Wi‑Fi (gra lokalna)
- **Host jest stołem**: ten sam `GameController`, goście to „zdalne miejsca”.
  Gość wysyła tylko zamiar ruchu; host sprawdza i wysyła każdemu **jego
  własny widok** (`snapshotFor(seat)`) — nigdy cudzych kart.
- Wykrywanie: mDNS `_pan._tcp` (TXT: wolne miejsca, reguły); awaryjnie
  **4-znakowy kod stołu** (dwa ostatnie oktety IP + przesunięcie portu) i
  **QR** z pełnym adresem.
- TCP, port 47474 (+ kolejne wolne), JSON rozdzielany znakiem nowej linii,
  wersja protokołu, walidacja każdej wiadomości (nazwy, karty, długość linii).
- Ping co 3 s, zerwanie po 10–12 s ciszy; miejsce czeka 60 s, potem gra za
  nie bot pod imieniem gracza; powrót tokenem miejsca.
- Szybkie reakcje (Brawo, Ups…), kropki obecności, osobne statystyki.
- Uprawnienia: iOS `NSLocalNetworkUsageDescription`, `NSBonjourServices`,
  kamera; Android multicast + kamera.

### 6.6 Monetyzacja
- Cała gra darmowa; Pro dodaje to, co pomaga się uczyć, duże stoły i wygląd.
- **Portfel dzienny** (`wallet.ts`): darmowe przydziały na dzień (np. 3
  podpowiedzi, 1 analiza), reklama z nagrodą dodaje trochę, reset o północy;
  kredyty (np. rewanż) nie przepadają.
- `LimitSheet`: przy wyczerpaniu limitu — „Obejrzyj reklamę” albo „Pan Pro”.
- `PaywallScreen`: nagłówek zależny od powodu otwarcia, plany ze sklepu
  (roczny z okresem próbnym pierwszy), „Przywróć zakupy”, „Mam kod”, regulamin
  i prywatność, obsługa zakupu „w toku”.
- Wygląd: talie, sukna, rewersy; klasyczny zestaw darmowy, inne na 24 h za
  reklamę; host Pro narzuca swój wygląd gościom.
- Kody promocyjne: Android otwiera Google Play z kodem, iOS okienko App Store;
  po powrocie synchronizacja i wynik.
- Reklamy **tylko na żądanie**, nigdy w trakcie rozdania; zgody UMP, bez ATT,
  bez personalizacji bez zgody. Bez kluczy: zakupy „niedostępne”, reklam brak.
- Cała konfiguracja po stronie właściciela: `app.json` →
  `expo.extra.monetization` (klucze RevenueCat, ID jednostek reklamowych,
  URL regulaminu/prywatności) + ID aplikacji AdMob w pluginie.

---

## 7. UI — konwencje

- Paleta stała, zawsze ciemna (`src/ui/palette.ts`: `bg #0F1720`, `surface`,
  `felt #123D30`, `accent #F0B44C`, `card #FBF7EE`, `danger`…).
- Komponenty bazowe: `Button3D` (przycisk „fizyczny”, tony gold/dark/off),
  `BottomSheet` (punkty zaczepienia, przeciąganie, wstecz zamyka), `Dialog`
  (`useConfirm()` zamiast `Alert`), `Header`, `Portrait`, `CardFace`/`CardBack`
  (rozmiary lg/md/sm, styl z wyglądu).
- Teksty po polsku, **neutralne płciowo** (bez „wygrałeś/wygrałaś”; formy
  bezosobowe, „Ty”, rzeczowniki). Polskie odmiany liczebników (`plural`).
- Dostępność: `accessibilityRole`, etykiety, `accessibilityLiveRegion` dla
  komunikatów, cele dotyku ≥ 44 px, `accessibilityViewIsModal` dla nakładek.
- Bezpieczne obszary (`react-native-safe-area-context`), Android edge-to-edge.
- Grafiki rysowane w kodzie (`tools/render-*.js`: SVG → PNG), dźwięki
  syntetyzowane (`tools/render-sounds.py`) — brak cudzych zasobów.

---

## 8. Testy i jakość

- `npm test` (Jest), `npm run typecheck` (tsc), `npm run test:cpp`.
- Kontroler gry testowany bez UI (wstrzyknięty `sleep`, deterministyczny
  `seed`).
- `src/__tests__/App.render.test.tsx` renderuje całą aplikację z mockiem
  silnika i pamięciowym KV: gra rundę serii, wraca do lobby, wznawia.
- Protokół Wi‑Fi testowany na transporcie pamięciowym (host + goście w jednym
  procesie).
- Provider Pro testowany z fałszywym sklepem i reklamami.
- Mocki modułów natywnych w `jest.setup.js`.

---

## 9. Build i wydanie

- `node build.js` bez opcji → menu strzałkami; `--install`, `--aab`, `--clean`;
  `--ios --team …` (Xcode), `--ios --eas` (chmura).
- Podpisywanie Androida kluczem z `~/.gradle/gradle.properties`
  (`plugins/withReleaseSigning.js`), inaczej kluczem debug.
- `app.json`: wyłączone zbędne uprawnienia, splash, `versionCode` rośnie przy
  każdym wydaniu, biblioteki natywne linkowane pod strony 16 KB.
- `store/RELEASE.md`: checklista sklepów (formularze bezpieczeństwa danych,
  reklamy, polityka prywatności), `store/listing-pl.md`.

---

## 10. Konwencje pracy (jak prowadzony był projekt)

- Odpowiedzi po polsku, krótko; całe pliki zamiast fragmentów.
- Praca na osobnej gałęzi, commit + push po każdym kroku; PR tylko na prośbę.
- Po każdej większej funkcji: self-review (błędy, skrajne przypadki, testy),
  poprawki i osobny commit.
- Makiety (artefakt/canvas) przed implementacją większych funkcji UI.
- Pomiary zamiast intuicji (turnieje botów, liczby w README).
- README opisuje architekturę i każdą funkcję; konfiguracja po stronie
  właściciela opisana krok po kroku.
- Pliki tymczasowe usuwane na koniec zadania.

---

## 11. Wojna — co przenieść, co zmienić

**Najważniejsza różnica:** w klasycznej Wojnie **nie ma decyzji** — wynik
wynika z rozdania (kolejność kart w taliach graczy). Dlatego:

| Element Pana | W Wojnie |
|---|---|
| Silnik C++ ISMCTS, sieć wartości, poziomy botów | **Niepotrzebne.** Wystarczy czysta symulacja w TypeScript (`rules.ts` + `round.ts`). Bez modułu natywnego build jest prostszy (można nawet zacząć od Expo Go). |
| Trening z podpowiedziami, analiza ruchów, doradca | Odpadają (nie ma czego doradzać). |
| Postacie / poziomy | Mogą zostać jako **osobowości** (portret, imię, reakcje), bez różnic w sile. |
| `GameController` + `GameSnapshot` + `TableGame` | **Przenieść** — ten sam wzorzec: kontroler bez Reacta, wstrzyknięty `sleep`, snapshot dla UI, zapis z wersją. |
| Tempo botów, „Pokaż wynik” | **Kluczowe**: tempo odkrywania (wolno / normalnie / szybko), przewijanie do końca, auto-gra. |
| Ochrona przed nieskończoną grą | **Potrzebna**: Wojna potrafi się zapętlić (zależnie od sposobu zbierania kart). Reguła: kolejność dokładania zebranych kart (stała / losowa) + limit ruchów z rozstrzygnięciem (np. więcej kart wygrywa). |
| Reguły domowe | Talia 24 / 32 / 52, liczba graczy 2–4 (lub więcej), liczba kart zakrytych w „wojnie” (1–3), co przy braku kart w trakcie wojny, kolejność zbierania, limit ruchów. |
| Seria, statystyki, ranga, odznaki | **Przenieść** (odznaki pod Wojnę: najdłuższa wojna, podwójna wojna, powrót z 1 karty, wygrana bez przegranej bitwy…). |
| Historia / powtórka | Przenieść w uproszczeniu: przebieg partii, najdłuższe wojny, wykres liczby kart w czasie. |
| Wi‑Fi | **Przenieść całe** (host = stół, widok per miejsce, mDNS + kod + QR). W Wojnie gracze tylko odkrywają karty — ruch gościa to „odkryj”; można dodać opcję automatycznego odkrywania. |
| Monetyzacja | Przenieść mechanizm (RevenueCat, portfel, LimitSheet, paywall, kody, wygląd), ale **zmienić zawartość Pro**: wygląd (talie, sukna, rewersy, animacje), duże stoły Wi‑Fi, statystyki i historia Pro, tryby dodatkowe (np. warianty reguł, „Wojna drużynowa”), bez reklam. Reklamy z nagrodą: wygląd na 24 h, ewentualnie „cofnij przegraną partię”/„rewanż na tych samych kartach”. |
| Animacje i dźwięk | **Najważniejsza wartość gry**: odkrywanie kart, zderzenie przy wojnie, zakryte karty, zbieranie stosu do zwycięzcy, licznik kart. |
| UI, paleta, komponenty, dostępność, neutralne płciowo teksty | Przenieść 1:1 (nowa nazwa i akcent kolorystyczny). |
| `build.js`, `store/`, `plugins/`, `jest.setup.js` | Przenieść i odchudzić (bez silnika natywnego). |

### Proponowana kolejność prac dla Wojny

1. Szkielet Expo (TypeScript strict, Jest, struktura katalogów jak w §3),
   paleta, `Button3D`, `BottomSheet`, `Dialog`, `kv.ts`.
2. Czyste reguły + symulacja rozdania z wariantami i ochroną przed pętlą;
   testy (w tym statystyka długości partii dla wariantów, by dobrać limit).
3. `GameController` + `useGame` + zapis/wznawianie + seria.
4. Stół z animacjami odkrywania i wojny, tempo, „Pokaż wynik”, ekran wyniku.
5. Lobby, nowa gra, profil, statystyki, odznaki, zasady, onboarding.
6. Historia partii.
7. Wi‑Fi (skopiować `src/lan/` i dopasować protokół).
8. Monetyzacja (skopiować `src/premium/` i zmienić listę korzyści oraz limity).
9. Grafiki, dźwięki, teksty do sklepu, polityka prywatności, `build.js`.
