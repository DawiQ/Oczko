# Wydanie — checklista

Uzupełniana w Etapie 11 (build, podpisywanie, sklepy). Sekcje monetyzacji —
Etap 10.

## Monetyzacja (konfiguracja właściciela)

1. **RevenueCat**: projekt „Oczko”, uprawnienie (entitlement) `pro`, oferta
   `default` z pakietami: roczny (z okresem próbnym w sklepie) i dożywotni.
   Klucze publiczne SDK wpisz w `app.json` → `expo.extra.monetization`
   (`revenueCatAndroidKey`, `revenueCatIosKey`). Bez kluczy zakupy są
   niedostępne, aplikacja działa.
2. **AdMob**: aplikacja Android i iOS, jednostka „Rewarded”. ID aplikacji
   w pluginie `react-native-google-mobile-ads` (`app.json`), ID jednostek
   w `expo.extra.monetization.rewardedAndroid / rewardedIos`. W wersji
   deweloperskiej używane są testowe jednostki Google.
3. **AdMob — zablokowane kategorie (obowiązkowo)**: w panelu AdMob →
   Blocking controls → Sensitive categories zablokuj **„Gambling & Betting”**
   i **„Social Casino”** dla obu aplikacji. Oczko to gra na punkty, bez
   pieniędzy i nagród — reklamy hazardu nie mogą się w niej pojawiać.
4. **Formularz zgód (UMP)**: w AdMob → Privacy & messaging utwórz komunikat
   GDPR dla EOG/UK/CH. Bez zgody reklamy są niespersonalizowane; zmiana zgody
   w Ustawieniach → „Prywatność reklam”.
5. **Regulamin i polityka prywatności**: adresy w `termsUrl` / `privacyUrl`
   (wyświetlane pod przyciskiem zakupu).

## Zasady reklam w aplikacji

- Reklama z nagrodą tylko na żądanie (arkusz limitu, ustawienia), nigdy
  w trakcie rundy i nigdy dla Oczko Pro.
- Nagroda: +1 do wybranego limitu dziennego (podpowiedź trenera, analiza
  partii, stół 7–8 osób) albo wygląd na 24 h. Nic, co wpływa na wynik gry
  z innymi ludźmi.
