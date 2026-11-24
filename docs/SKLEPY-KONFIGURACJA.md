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

Ceny (propozycja do decyzji; dożywotni ≈ 2× roczny):

| Rynek | Roczny | Na zawsze |
|---|---|---|
| Polska | 29,99 zł | 59,99 zł |
| Strefa euro (DE, AT, SK, IE) | 6,99 € | 13,99 € |
| Wielka Brytania | 5,99 £ | 11,99 £ |
| USA i reszta (cena bazowa) | 6,99 $ | 12,99 $ |
| Czechy | 149 Kč | 299 Kč |
| Węgry | 2 490 Ft | 4 990 Ft |
| Ukraina | 149 ₴ | 299 ₴ |
| Bałkany (RS, BA, HR — HR w euro) | przeliczenie sklepu z ceny bazowej, potem ręcznie w dół o ok. 30% | jw. |

Ceny regionalne w Europie Środkowo-Wschodniej są konieczne (`docs/RYNKI.md`).
W Play Console ustawia się cenę bazową, sklep przelicza ją na lokalne waluty,
a potem poprawia się ręcznie kraje z tabeli. App Store robi to samo przez
„Price Schedule”.

## 2. Google Cloud: konto usługi dla RevenueCat

**Stan (24.11.2026):** zrobione w konsoli na koncie dawikk.apps@gmail.com.

| | |
|---|---|
| Projekt | „Oczko Play”, ID `oczko-play` |
| Włączone API | Google Play Android Developer API, Google Play Developer Reporting API, Cloud Pub/Sub API |
| Konto usługi | `revenuecat@oczko-play.iam.gserviceaccount.com` (opis: RevenueCat – Oczko) |
| Role w projekcie | Pub/Sub Editor, Monitoring Viewer |
| Klucz JSON | jeszcze nie utworzony (właściciel, krok 2) |

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
