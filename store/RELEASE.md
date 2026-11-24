# Wydanie w Google Play i App Store — checklista

`[x]` — zrobione w repozytorium, `[ ]` — do zrobienia przez właściciela
(konta, klucze, panele sklepów). Bez słów z listy zakazanych (`PLAN.md` §9).

## 0. Decyzje i wersja

- [x] Nazwa „Oczko — gra w karty”, bundle id / package `com.dawikk.oczko`
      (`app.json`).
- [x] Expo SDK 58, React Native 0.88 (New Architecture), `expo-dev-client`.
- [x] `version` 1.0.0, Android `versionCode` 1 (podbijaj przy każdym
      wydaniu; EAS `autoIncrement` w profilu `production`).
- [x] Uprawnienia: iOS `NSLocalNetworkUsageDescription`,
      `NSBonjourServices` (`_oczko._tcp`), aparat (tylko skan QR stołu);
      Android: zbędne zablokowane (`blockedPermissions`).
- [x] Grafiki z `npm run art`: ikona, adaptive icon, splash,
      `store/icon-512.png`, `store/feature-graphic.png`; dźwięki
      `npm run sounds`.

## 1. Konta

- [ ] Google Play Console (opłata jednorazowa), App Store Connect (Apple
      Developer Program).
- [ ] Konto Expo (EAS) — `npx eas login`.

## 2. Klucze i podpisywanie

- [ ] Android, build lokalny: klucz uploadu
      `keytool -genkeypair -v -keystore oczko-upload.jks -alias oczko-upload -keyalg RSA -keysize 2048 -validity 10000`,
      a w `~/.gradle/gradle.properties`:
      `OCZKO_UPLOAD_STORE_FILE`, `OCZKO_UPLOAD_STORE_PASSWORD`,
      `OCZKO_UPLOAD_KEY_ALIAS`, `OCZKO_UPLOAD_KEY_PASSWORD`
      (plugin `plugins/withReleaseSigning.js`; bez nich — klucz debug).
      Nigdy nie commituj `.jks` (jest w `.gitignore`).
- [ ] Włącz Play App Signing w Play Console.
- [x] Funkcje sprzętowe opcjonalne (Wi‑Fi, ekran pionowy, aparat) — plugin
      `plugins/withOptionalFeatures.js`; Play nie ogranicza dostępności.
- [ ] iOS: certyfikaty i profile zarządza EAS (`eas credentials`) albo Xcode
      (`node build.js --ios --team <TEAM_ID>`).

## 3. Budowanie

- [x] `node build.js` — menu: APK / AAB (`--aab`) / iOS (Xcode lub EAS).
- [x] `eas.json`: `development` (dev client), `preview` (APK), `production`.
- [x] Build AAB sprawdzony: `expo prebuild -p android` +
      `./gradlew bundleRelease -PreactNativeArchitectures=arm64-v8a`
      → `app-release.aab` (ok. 33 MB; SDK 37, NDK 27.1, JDK 21; bez klucza
      uploadu podpisany kluczem debug).
- [ ] Wydanie: `node build.js --aab` z kluczem uploadu → `dist/oczko-<wersja>.aab`
      (albo `npx eas build -p android --profile production`).
- [ ] `npx eas build -p ios --profile production` (albo `node build.js --ios --eas`)
      — wymaga konta Apple; build iOS nie był uruchamiany (brak macOS/EAS
      w środowisku deweloperskim).
- [x] Przed buildem: `npm test`, `npm run typecheck`, `npm run lint` na zielono.

## 4. Testy na urządzeniach

- [ ] Partia rodzinna i z bankierem 2–6 graczy do końca; „Pokaż wynik”,
      rewanż, wznowienie po zamknięciu aplikacji.
- [ ] Onboarding i samouczek na świeżej instalacji.
- [ ] Wi‑Fi: 2 telefony (Android + iOS) — lista stołów (mDNS), kod, QR,
      wyjście z sieci i powrót, „Starczy” po 30 s.
- [ ] Oczko Pro: zakup w sandboxie (roczny z okresem próbnym, dożywotni),
      „Przywróć zakupy”, kod promocyjny.
- [ ] Reklama z nagrodą (testowa jednostka w buildzie deweloperskim):
      formularz zgód w EOG, nagroda po obejrzeniu, brak reklam w trakcie rundy.
- [ ] TalkBack / VoiceOver: komunikaty rundy, etykiety kart, przyciski ≥ 44 px.
- [ ] „Ogranicz ruch” — animacje bez ruchu.

## 5. Zrzuty ekranu

- [ ] Telefon (Play: min. 2, App Store 6,7" i 5,5"): lobby, stół w trakcie
      rundy (z trenerem), perskie oczko, koniec rundy, profil, Wi‑Fi (kod
      stołu). Bez motywów kojarzących się z hazardem; wygląd „Zielone” lub „Orzech”.

## 6. Google Play Console

- [ ] Opis per język: `store/listing-{pl,en,de,cs,sk,hu,uk,ru,sh}.md` (nazwa,
      krótki i pełny opis), grafiki (`store/feature-graphic.png`, `-en`, `-de`,
      `-cs`, `-sk`, `-hu`, `-uk`, `-ru`, `-sh`) i zrzuty ekranu w każdym języku.
      `listing-sh.md` → wersje „hr”, „sr” (i „bs”, jeśli konsola ją ma).
- [ ] Kraje dystrybucji: **bez Rosji i Białorusi** (wstrzymane płatności
      Google/Apple, sankcje UE — `docs/RYNKI.md`); rosyjski jest dla
      Kazachstanu, Mołdawii, krajów bałtyckich i diaspory.
- [ ] Kategoria: Gry → Karciane. Grupa docelowa: 13+ (ze względu na
      reklamy) — albo „wszyscy” po zablokowaniu reklam dla dzieci.
- [ ] Ocena treści (IARC): odpowiedzi z `store/rating-answers.md`
      — **Simulated gambling: No**.
- [ ] Bezpieczeństwo danych: identyfikatory urządzenia (AdMob, RevenueCat)
      i historia zakupów — tak, do reklam i zakupów; dane gry — tylko na
      urządzeniu; szyfrowanie w tranzycie — tak; usuwanie danych — przez
      odinstalowanie.
- [ ] Reklamy: „Aplikacja zawiera reklamy” — tak.
- [x] Strona, polityka prywatności i regulamin (repo DawikkApps, `public/Oczko/`):
      https://dawikk-apps.vercel.app/Oczko,
      https://dawikk-apps.vercel.app/Oczko/privacyPolicy.html,
      https://dawikk-apps.vercel.app/Oczko/termsOfUse.html — w `app.json`.
- [ ] Adres polityki prywatności wpisz w Play Console i App Store Connect.
- [ ] Produkty: np. subskrypcja roczna z okresem próbnym i produkt
      jednorazowy (te same w RevenueCat; nazwy dowolne — kod ich nie zna).

## 7. App Store Connect

- [ ] Opis i słowa kluczowe per język: `store/listing-{pl,en,de,cs,sk,hu,uk,ru,sh}.md`
      (App Store: „sh” jako „hr”; Serbia czyta wersję chorwacką lub angielską).
- [ ] Dostępność: bez Rosji i Białorusi.
- [ ] Age Rating: `store/rating-answers.md` — **Simulated Gambling: None**.
- [ ] App Privacy: identyfikatory (reklamy — bez śledzenia między
      aplikacjami, bez ATT), zakupy.
- [ ] Zakupy w aplikacji: subskrypcja (grupa „Oczko Pro”) i zakup
      jednorazowy; regulamin (EULA) i polityka prywatności w opisie.

## 8. Monetyzacja (konfiguracja właściciela)

1. [ ] **RevenueCat**: projekt „Oczko”, uprawnienie (entitlement) `pro`
   (inna nazwa → `extra.monetization.entitlement`), oferta oznaczona jako
   bieżąca (albo jej identyfikator w `extra.monetization.offering`).
   Pakiety dowolne: tygodniowy, miesięczny, 2/3/6 miesięcy, roczny,
   dożywotni lub „Custom” (rodzaj wg okresu produktu; produkt bez okresu =
   na zawsze). Kolejność na ekranie = kolejność w ofercie; domyślnie
   zaznaczony plan z okresem próbnym. Zmiany w panelu działają bez nowego
   wydania. Klucze publiczne SDK w `app.json` → `expo.extra.monetization`
   (`revenueCatAndroidKey`, `revenueCatIosKey`). Bez kluczy zakupy są
   niedostępne, aplikacja działa.
2. [ ] **AdMob**: aplikacja Android i iOS, jednostka „Rewarded”. ID aplikacji
   w pluginie `react-native-google-mobile-ads` (`app.json`, teraz testowe),
   ID jednostek w `expo.extra.monetization.rewardedAndroid / rewardedIos`.
3. [ ] **AdMob — zablokowane kategorie (obowiązkowo)**: Blocking controls →
   Sensitive categories: zablokuj **„Gambling & Betting”**
   i **„Social Casino”** dla obu aplikacji. Oczko to gra na punkty, bez pieniędzy
   i nagród — reklamy hazardu nie mogą się w niej pojawiać.
4. [ ] **Formularz zgód (UMP)**: AdMob → Privacy & messaging, komunikat GDPR
   dla EOG/UK/CH. Bez zgody reklamy są niespersonalizowane; zmiana zgody
   w Ustawieniach → „Prywatność reklam”.
5. [ ] **Regulamin i polityka prywatności**: `termsUrl` / `privacyUrl`.

## Zasady reklam w aplikacji

- [x] Reklama z nagrodą tylko na żądanie (arkusz limitu, ustawienia), nigdy
      w trakcie rundy i nigdy dla Oczko Pro.
- [x] Nagroda: +1 do wybranego limitu dziennego (podpowiedź trenera,
      analiza partii, stół 7–8 osób) albo wygląd na 24 h.
