# Konfiguracja: Google Cloud ↔ Google Play ↔ RevenueCat (↔ App Store)

Dla Oczka Pro. Firebase nie jest potrzebny: aplikacja nie ma Firebase, a
RevenueCat łączy się z Google Play przez konto usługi w Google Cloud.

Pakiet / bundle id: **`com.dawikk.oczko`** (`app.json`). Nazwy pakietu w Google
Play nie da się zmienić. Jeśli w Play Console jest już aplikacja
`pl.dawiq.oczko`, trzeba założyć nową. Starą, nigdy nieopublikowaną, można usunąć.

## 1. Produkty i ceny

Kod nie zna nazw produktów: paywall pokazuje pakiety z oferty RevenueCat
(`src/premium/plans.ts`). Poniższe identyfikatory to propozycja.

| Produkt | Google Play | App Store | RevenueCat |
|---|---|---|---|
| Oczko Pro — roczny, 7 dni za darmo | subskrypcja `oczko_pro`, plan bazowy `roczny` (odnawiany co rok), oferta `proba-7-dni` (bezpłatny okres 7 dni, tylko nowi klienci) | grupa „Oczko Pro”, subskrypcja `oczko_pro_yearly`, oferta wprowadzająca: bezpłatnie 1 tydzień | pakiet `$rc_annual` |
| Oczko Pro — na zawsze | produkt w aplikacji `oczko_pro_lifetime` (jednorazowy) | Non-Consumable `oczko_pro_lifetime` | pakiet `$rc_lifetime` |

Oba produkty dają uprawnienie **`pro`** (`app.json` → `extra.monetization.entitlement`).

Ceny w Google Play (decyzja 24.11.2026): **tylko cena w PLN**, pozostałe kraje
przelicza sklep automatycznie, bez ręcznych korekt regionalnych.

| Produkt | Polska (z VAT) | Wpisana cena bazowa (netto, PLN) |
|---|---|---|
| `oczko_pro` / `roczny` | 29,99 zł | 24,38 zł |
| `oczko_pro_lifetime` | 59,99 zł | 48,77 zł |

Play traktuje cenę z „Edytuj zbiorczo ceny” jako kwotę bez VAT — dlatego baza
to 24,38 / 48,77 zł, a w Polsce wychodzi 29,99 / 59,99 zł. Przykładowe
przeliczenia (roczny / na zawsze): DE 6,49 € / 12,99 €, UK 5,49 £ / 10,99 £,
US 5,99 $ / 11,99 $, CZ 159,99 Kč / 319,99 Kč, HU 2 590 Ft / 5 099 Ft,
UA 324,99 ₴ / 649,99 ₴. Regionalne obniżki (`docs/RYNKI.md`) można dodać
później ręcznie per kraj.

## 2. Google Cloud: konto usługi dla RevenueCat

**Stan (24.11.2026):** zrobione w konsoli na koncie dawikk.apps@gmail.com.

| | |
|---|---|
| Projekt | „Oczko Play”, ID `oczko-play` |
| Włączone API | Google Play Android Developer API, Google Play Developer Reporting API, Cloud Pub/Sub API |
| Konto usługi | `revenuecat@oczko-play.iam.gserviceaccount.com` (opis: RevenueCat – Oczko) |
| Role w projekcie | Pub/Sub Editor, Monitoring Viewer |
| Klucz JSON | utworzony przez właściciela i wgrany do RevenueCat (nie w repo) |

Klucz: IAM → Konta usługi → `revenuecat` → Klucze → Dodaj klucz → JSON
(albo `gcloud iam service-accounts keys create revenuecat-key.json
--iam-account=revenuecat@oczko-play.iam.gserviceaccount.com`).

Pełna procedura od zera w [Cloud Shell](https://shell.cloud.google.com) (konto Google właściciela Play Console):

```bash
PROJECT=oczko-play-$RANDOM          # identyfikator musi być unikalny
gcloud projects create "$PROJECT" --name="Oczko Play"
gcloud config set project "$PROJECT"
gcloud services enable androidpublisher.googleapis.com \
  playdeveloperreporting.googleapis.com pubsub.googleapis.com
gcloud iam service-accounts create revenuecat --display-name="RevenueCat"
SA="revenuecat@$PROJECT.iam.gserviceaccount.com"
# Role wymagane przez RevenueCat (powiadomienia Pub/Sub i odczyt metryk):
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$SA" --role=roles/pubsub.editor
gcloud projects add-iam-policy-binding "$PROJECT" --member="serviceAccount:$SA" --role=roles/monitoring.viewer
gcloud iam service-accounts keys create revenuecat-key.json --iam-account="$SA"
cloudshell download revenuecat-key.json
echo "$SA"
```

- Klucz JSON to sekret: wgrywasz go tylko do RevenueCat i nigdy do repozytorium.
  Po wgraniu usuń go z dysku i z Cloud Shell.
- Jeśli `keys create` zwróci błąd polityki organizacji
  (`iam.disableServiceAccountKeyCreation`), wyłącz tę politykę dla projektu w
  IAM → Organization Policies albo użyj projektu poza organizacją.

## 3. Google Play Console

**Stan (24.11.2026):** kroki 1–6 zrobione. Aplikacja „Oczko — gra w karty”
(ID 4973404874280568304); konto usługi zaproszone (informacje o aplikacji,
dane finansowe, zamówienia i subskrypcje); produkty aktywne:
`oczko_pro_lifetime` (opcja zakupu `na-zawsze`, zgodność wsteczna) i
`oczko_pro` / `roczny` / `proba-7-dni`; powiadomienia w czasie rzeczywistym:
`projects/oczko-play/topics/Play-Store-Notifications`, wszystkie typy —
testowe dotarło do RevenueCat; testerzy licencji: lista „Oczko testerzy”.
Temat utworzył RevenueCat, ale rola Pub/Sub Editor nie pozwala mu nadać
uprawnień — `google-play-developer-notifications@system.gserviceaccount.com`
dostał ręcznie rolę Pub/Sub Publisher na tym temacie.

1. Utwórz aplikację „Oczko” (gra, bezpłatna), pakiet zostanie ustalony przy
   pierwszym wgraniu AAB `com.dawikk.oczko`.
2. Wgraj AAB na ścieżkę testów wewnętrznych (`npx eas build -p android
   --profile production` albo `node build.js --aab`). Produkty da się tworzyć
   dopiero, gdy Play zobaczy uprawnienie BILLING w wgranej wersji
   (`react-native-purchases` je dodaje).
3. **Użytkownicy i uprawnienia** → Zaproś nowego użytkownika → e-mail konta
   usługi (`$SA`) → uprawnienia do aplikacji:
   - wyświetlanie informacji o aplikacji i pobieranie raportów zbiorczych,
   - wyświetlanie danych finansowych, zamówień i odpowiedzi z ankiety o rezygnacji,
   - zarządzanie zamówieniami i subskrypcjami.
4. **Zarabianie → Produkty** → produkt w aplikacji `oczko_pro_lifetime`
   oraz subskrypcja `oczko_pro` z planem bazowym `roczny` i ofertą
   `proba-7-dni` (wg tabeli w §1). Aktywuj oba.
5. **Zarabianie → Konfiguracja zarabiania → Powiadomienia w czasie
   rzeczywistym**: wklej nazwę tematu Pub/Sub z RevenueCat (§4, krok 3),
   wyślij powiadomienie testowe.
6. **Ustawienia → Testowanie licencji**: dodaj konta testerów (zakupy bez
   obciążenia).

Uprawnienia konta usługi zaczynają działać po kilku godzinach, czasem do 36 h.
Do tego czasu RevenueCat zgłasza „credentials need attention”.

## 4. RevenueCat

**Stan (24.11.2026):** kroki 1, 3–7 zrobione dla Androida. Projekt „Oczko”,
aplikacja Play Store „Oczko (Android)” (credentials: valid), uprawnienie `pro`,
produkty `oczko_pro:roczny` i `oczko_pro_lifetime` (non-consumable) podpięte do
`pro`, oferta `default` (current): `$rc_annual` → `oczko_pro:roczny`,
`$rc_lifetime` → `oczko_pro_lifetime`. Publiczny klucz SDK Androida jest w
`app.json`. App Store (krok 2, 8) — do zrobienia.

1. Utwórz projekt „Oczko”. Dodaj aplikację **Play Store**: pakiet
   `com.dawikk.oczko`, wgraj `revenuecat-key.json`.
2. Dodaj aplikację **App Store**: bundle id `com.dawikk.oczko`, klucz In‑App
   Purchase (.p8) z App Store Connect (Users and Access → Integrations → In‑App
   Purchase) z Issuer ID i Key ID.
3. W aplikacji Play Store → **Google developer notifications** → „Connect to
   Google”. RevenueCat utworzy temat Pub/Sub (rola Pub/Sub Editor z §2).
   Skopiuj nazwę tematu do Play Console (§3, krok 5).
4. **Product catalog → Entitlements**: `pro`.
5. **Products**: zaimportuj z obu sklepów (`oczko_pro:roczny`,
   `oczko_pro_lifetime`, `oczko_pro_yearly`) i podepnij wszystkie do `pro`.
6. **Offerings**: oferta `default` oznaczona jako *current*, pakiety:
   `$rc_annual` (Play `oczko_pro:roczny`, iOS `oczko_pro_yearly`) i
   `$rc_lifetime` (`oczko_pro_lifetime` w obu sklepach). Kolejność pakietów
   w ofercie to kolejność na paywallu; na starcie zaznaczony jest pakiet
   z okresem próbnym.
7. **API keys**: publiczne klucze SDK (`goog_…`, `appl_…`) wpisz do
   `app.json` → `extra.monetization.revenueCatAndroidKey` / `revenueCatIosKey`.
   To klucze publiczne i mogą być w repozytorium. Kluczy tajnych (`sk_…`) nie wpisuj.
8. App Store: w App Store Connect → aplikacja → App Information → App Store
   Server Notifications wpisz URL z RevenueCat (aplikacja App Store →
   „Apple Server Notification URL”), wersja 2.

## 5. App Store Connect (iOS)

1. Developer → Identifiers: App ID `com.dawikk.oczko` z In‑App Purchase.
2. App Store Connect: nowa aplikacja z tym bundle id.
3. Subskrypcje: grupa „Oczko Pro”, `oczko_pro_yearly` (1 rok), oferta
   wprowadzająca „bezpłatnie, 1 tydzień”. In‑App Purchases: Non‑Consumable
   `oczko_pro_lifetime`.
4. Kody promocyjne (offer codes) dla subskrypcji: Subskrypcje →
   `oczko_pro_yearly` → Offer Codes. W aplikacji: „Mam kod”.

## 6. Sprawdzenie

- Build z kluczami RevenueCat na ścieżce testów wewnętrznych, konto testera:
  paywall pokazuje dwa plany z cenami ze sklepu, zakup → Pro, „Przywróć
  zakupy” na drugim urządzeniu → Pro.
- RevenueCat → Customers: widać testowy zakup; Play Console → Powiadomienia
  testowe docierają (RevenueCat → Integrations → Google: „last received”).
- Kod promocyjny z Play Console (Zarabianie → Kody promocyjne) → „Mam kod”.

## Co może zrobić Claude Code, a co tylko właściciel

Kontami Google Cloud, Play Console, RevenueCat i App Store Connect
zarządza właściciel. Claude Code nie ma do nich dostępu i nie przechowuje
kluczy. Może natomiast:
- przez API RevenueCat (v2) założyć uprawnienie, produkty i ofertę z §4,
  jeśli dostanie tajny klucz API przez bezpieczny formularz sesji (nigdy
  w czacie ani w repozytorium);
- wpisać publiczne klucze SDK do `app.json`, zbudować wersję i sprawdzić
  paywall w testach.
