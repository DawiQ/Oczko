# Węgierskie Huszonegy powtarza 17 und 4, dodaje próg 15

Ludowe węgierskie „Huszonegyes” to w praktyce ta sama gra co niemieckie Siebzehn und Vier. **Talia: 32 karty magyar kártya. Wartości: alsó 2, felső 3, király 4, ász 11, VII–X według oczek.** Zgadzają się w tym wszystkie źródła, które podają wartości. To zamyka lukę z raportu rynkowego, gdzie wartości figur były niepotwierdzone. **Dwa asy wygrywają od razu** i stoją wyżej niż każde inne 21. Klasyczna forma to gra z bankiem. **Remis wygrywa bank.** Bank dobiera według uznania. Żadne ludowe źródło nie każe mu dobierać do 17. Najbardziej „węgierska” reguła to **zakaz stania poniżej 15** (czasem 14 lub 16). Silnik Oczka jej dziś nie obsługuje. W polach reguł aplikacji zestaw węgierski jest **identyczny z obecnym zestawem „17 und 4”**: deck 32, J 2, Q 3, K 4, ace eleven, persian wins, mode bank, bankTie bankWins, bankTo17 false. Różnią się wygląd talii, słownictwo i próg 15. Spory między źródłami dotyczą szczegółów: czy dwa asy to „21” czy „22”, czy na start jest jedna karta czy dwie, kto wygrywa remis w grze rodzinnej. Ich obraz opiera się głównie na stronach hobbystycznych, haśle hu.wikipedii i leksykonie z MEK. Nie udało się przeczytać XIX-wiecznych zbiorów zasad ani reguł z aplikacji jbdev. Dlatego kilka punktów trzeba potwierdzić u rodzimych graczy.

## Wartości są pewne, spór dotyczy szczegółów

Uwaga na nazwę. Na hu.wikipedii hasło **„Huszonegy” opisuje francuski blackjack** (52 karty, figury po 10). Gra ludowa ma osobne hasło **„Huszonegyes”** ([hu.wikipedia: Huszonegyes](https://hu.wikipedia.org/wiki/Huszonegyes); [hu.wikipedia: Huszonegy](https://hu.wikipedia.org/wiki/Huszonegy)). Wiele węgierskich stron miesza te dwie gry. Źródła anglojęzyczne nie pomagają. Pagat opisuje talię magyar kártya, ale nie wspomina o grze w 21 ([pagat](https://www.pagat.com/national/hungary.html)). Najlepszym punktem kontrolnym jest niemiecki opis gry na 32 kartach ([de.wikipedia](https://de.wikipedia.org/wiki/Siebzehn_und_Vier)).

| Reguła | Co mówią źródła | Źródła | Pewność |
|---|---|---|---|
| Talia | 32 karty magyar kártya (VII–ász, 4 kolory). Francuska talia tylko jako „podobna gra”, bez wartości. Brak wersji 36- i 52-kartowej. | [Wiki HU](https://hu.wikipedia.org/wiki/Huszonegyes), [Kisokos](https://mek.oszk.hu/00000/00056/html/134.htm), [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [Kölöknet](https://www.koloknet.hu/szuloszerep-es-gyermekneveles/magyar-kartya-jatekok-szabalyok-zsirozas-huszonegy-csapdlecsacsi/), [jatek-szabalyok](https://jatek-szabalyok.hu/huszonegy-a-klasszikus-kartyajatek/) | wysoka |
| VII, VIII, IX, X | Według oczek: 7, 8, 9, 10. | jak wyżej, [magyarkartyajatekok](https://magyarkartyajatekok.hu/huszonegy-21/) | wysoka |
| alsó / felső / király | 2 / 3 / 4. Bez wyjątku w każdym źródle z wartościami. Idiom „19-re lapot kér” (dobierać na 19) ma sens tylko wtedy, gdy najniższa karta to alsó = 2. | [Wiki HU](https://hu.wikipedia.org/wiki/Huszonegyes), [Kisokos](https://mek.oszk.hu/00000/00056/html/134.htm), [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [magyarkartyajatekok](https://magyarkartyajatekok.hu/huszonegy-21/), [Kölöknet](https://www.koloknet.hu/szuloszerep-es-gyermekneveles/magyar-kartya-jatekok-szabalyok-zsirozas-huszonegy-csapdlecsacsi/), [gyakorikerdesek](https://www.gyakorikerdesek.hu/tudomanyok__tarsadalomtudomanyok-es-bolcseszet__12502454-mit-jelent-a-19-re-lapot-huz-kifejezes) | wysoka |
| Ász | Pięć źródeł: tylko 11. jatek-szabalyok: „zwykle stałe 11”. aduasz: 1 albo 11 (w mniejszości). | jak wyżej, [aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php) | wysoka (11) |
| Dwa asy | Wygrywają od razu, przed ruchem banku. Najlepsza ręka, wyżej niż 21. | wszystkie źródła ludowe, [forum](https://www.gyakorikerdesek.hu/szorakozas__jatekok__9197646-a-blackjack-ben-az-asz-mikor-er-1-et-es-mikor-11-et) | wysoka |
| Dwa asy: 21 czy 22 | 4 źródła: „liczą się jako 21, nie 22”. Kölöknet: „22, więcej niż 21”. Wiki HU i Kisokos: bez liczby, „najlepsza ręka”. | [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php), [jatek-szabalyok](https://jatek-szabalyok.hu/huszonegy-a-klasszikus-kartyajatek/), [homoludens](http://www.homoludens.hu/node/22356), [Kölöknet](https://www.koloknet.hu/szuloszerep-es-gyermekneveles/magyar-kartya-jatekok-szabalyok-zsirozas-huszonegy-csapdlecsacsi/) | średnia (liczba), wysoka (ranga) |
| Bank czy nie | Klasycznie bank przeciw każdemu graczowi. Rodzinna wersja bez banku (każdy z każdym, 10 rund) w Kölöknet i magyarkartyajatekok. Aplikacja jbdev: z bankiem. | [Wiki HU](https://hu.wikipedia.org/wiki/Huszonegyes), [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [Kölöknet](https://www.koloknet.hu/szuloszerep-es-gyermekneveles/magyar-kartya-jatekok-szabalyok-zsirozas-huszonegy-csapdlecsacsi/), [App Store](https://apps.apple.com/hu/app/id1549553547) | wysoka (bank), średnia (wariant rodzinny) |
| Remis z bankiem | Wygrywa bank. aduasz: najpierw mniej kart, przy równej liczbie kart bank. | [Wiki HU](https://hu.wikipedia.org/wiki/Huszonegyes), [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [jatek-szabalyok](https://jatek-szabalyok.hu/huszonegy-a-klasszikus-kartyajatek/), [aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php) | wysoka |
| Remis bez banku | Wygrywa ten, kto ma mniej kart. | [Kölöknet](https://www.koloknet.hu/szuloszerep-es-gyermekneveles/magyar-kartya-jatekok-szabalyok-zsirozas-huszonegy-csapdlecsacsi/), [magyarkartyajatekok](https://magyarkartyajatekok.hu/huszonegy-21/) | średnia |
| Dobieranie banku | „Dobiera, aż uzna, że wystarczy, albo przekroczy 21”. Brak stałego progu. Próg 16/17 tylko w niezweryfikowanym streszczeniu wyszukiwarki, jak w blackjacku. | [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [jatek-szabalyok](https://jatek-szabalyok.hu/huszonegy-a-klasszikus-kartyajatek/), [aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php) | średnia |
| Fura banku | Wygrywa każdy gracz, który sam nie przekroczył 21. | [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php) | wysoka |
| Karty na start | Klasycznie 1 zakryta karta dla każdego (bank ostatni). Nowsze opisy: 2 karty. | 1: [Wiki HU](https://hu.wikipedia.org/wiki/Huszonegyes), [Kisokos](https://mek.oszk.hu/00000/00056/html/134.htm), [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/); 2: [aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php), [Kölöknet](https://www.koloknet.hu/szuloszerep-es-gyermekneveles/magyar-kartya-jatekok-szabalyok-zsirozas-huszonegy-csapdlecsacsi/), [magyarkartyajatekok](https://magyarkartyajatekok.hu/huszonegy-21/) | średnia (1 w grze z bankiem) |
| Minimum, by stanąć | Najczęściej 15. Wiki HU: 14. Kölöknet: 16. Sama zasada minimum jest powszechna. | [Kisokos](https://mek.oszk.hu/00000/00056/html/134.htm), [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [jatek-szabalyok](https://jatek-szabalyok.hu/huszonegy-a-klasszikus-kartyajatek/), [aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php), [Wiki HU](https://hu.wikipedia.org/wiki/Huszonegyes), [Kölöknet](https://www.koloknet.hu/szuloszerep-es-gyermekneveles/magyar-kartya-jatekok-szabalyok-zsirozas-huszonegy-csapdlecsacsi/) | wysoka (jest), średnia (15) |
| Przekroczenie 21 | Ogłaszane od razu („fuccs”, „trapp”), karty rzucone. Czy odkryte — nie wiadomo. Wynik stojącego gracza ukryty do końca (aduasz). | [Wiki HU](https://hu.wikipedia.org/wiki/Huszonegyes), [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [homoludens](http://www.homoludens.hu/node/22356), [aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php) | wysoka |
| Limit kart | Brak w każdym źródle. | — | wysoka |
| Przejęcie banku | Co rozdanie w prawo, po ustalonej liczbie rozdań albo dobrowolnie. Lokalnie: przejmuje go gracz z dwoma asami (aduasz) albo bank oddaje się dopiero po wyciągnięciu VII lub króla (Siedmiogród). jbdev: bank zmienia się co rundę. | [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [jatek-szabalyok](https://jatek-szabalyok.hu/huszonegy-a-klasszikus-kartyajatek/), [aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php), [homoludens](http://www.homoludens.hu/node/22356), [App Store](https://apps.apple.com/hu/app/id1549553547) | średnia |
| Óneász / „ne ászt” | Przy 11 punktach z kilku kart gracz może zapowiedzieć „óneász” i odrzucić asa, jeśli przyjdzie. | [Kisokos](https://mek.oszk.hu/00000/00056/html/134.htm), [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [jatek-szabalyok](https://jatek-szabalyok.hu/huszonegy-a-klasszikus-kartyajatek/) | średnia |
| Ász + X | Wariant: wygrywa od razu (każdy as z dziesiątką albo tylko w jednym kolorze). | [Kisokos](https://mek.oszk.hu/00000/00056/html/134.htm) | niska |
| Pięć kart | Dwie strony: kto nie przekroczył 21 pięcioma kartami, może zacząć rozdanie od nowa. Jedna recenzja w Google Play: pięć kart bez fury wygrywa. | [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [jatek-szabalyok](https://jatek-szabalyok.hu/huszonegy-a-klasszikus-kartyajatek/), [Google Play](https://play.google.com/store/apps/details?id=jbdev.huszonegy_magyar&hl=hu&gl=HU) | niska |
| „Sánta” | Czerwona siódemka jako dzika karta (7, 10 lub 11). Tylko jedna wieś w Siedmiogrodzie. | [homoludens](http://www.homoludens.hu/node/22356) | niska |
| Dwa asy u banku | Brak danych. Źródła mówią tylko o graczu. | — | brak |
| 7‑7‑7, inne układy | Nie znaleziono. | — | — |

Wartości mają mocne podstawy. Zgadzają się encyklopedia, leksykon, cztery strony z zasadami, poradnik dla rodziców i forum. Pasują też do niemieckiej gry na 32 kartach (Unter 2, Ober 3, König 4, Ass 11) ([de.wikipedia](https://de.wikipedia.org/wiki/Siebzehn_und_Vier)). Węgierska gra nie jest czeskim Oko bere, gdzie figury liczą się po 1, 1 i 2 ([cs.wikipedia](https://cs.wikipedia.org/wiki/Jednadvacet)). Słabszy jest obraz zasad przebiegu gry. Strony hobbystyczne nie mają autora ani daty i częściowo przepisują się nawzajem. Hasło hu.wikipedii nie ma przypisów. Jego archaiczny język sugeruje, że pochodzi z leksykonu Pallasa (1893–1897), ale strona Arcanum była zablokowana ([Arcanum](https://www.arcanum.com/hu/online-kiadvanyok/Lexikonok-a-pallas-nagy-lexikona-2/h-B866/huszonegyes-CFB6/)). Etnograf z Siedmiogrodu pisze, że reguły „prawie nie różnią się między regionami” ([homoludens](http://www.homoludens.hu/node/22356)). To dobrze wróży jednemu zestawowi dla całego rynku.

## Dwa asy wygrywają, choć źródła nazywają je 21

Węgierskie „dwa asy liczą się jako 21, nie 22” mapuje się na **persian „wins”**, a nie na „is21”. Zdanie o 21 odpowiada na inne pytanie: czy dwa asy to fura. Przy asie za 11 dwa asy dają 22. Źródła mówią więc: „to nie jest 22, nie przegrywasz”. jatek-szabalyok pisze to wprost: „nie 22 (co oznaczałoby furę), tylko automatycznie 21, natychmiastowa wygrana” ([jatek-szabalyok](https://jatek-szabalyok.hu/huszonegy-a-klasszikus-kartyajatek/)). Ranga jest jasna. Wiki HU: „najlepsza wartość to dwa asy, potem 21, 20…”, a dwa asy wygrywają, zanim bank weźmie kartę ([Wiki HU](https://hu.wikipedia.org/wiki/Huszonegyes)). aduasz: z dwoma asami „zawsze wygrywamy z bankiem”, a as z dziesiątką to też 21, ale niżej ([aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php)). Forum: w węgierskiej grze „dwa asy są najlepsze” ([gyakorikerdesek](https://www.gyakorikerdesek.hu/szorakozas__jatekok__9197646-a-blackjack-ben-az-asz-mikor-er-1-et-es-mikor-11-et)).

W aplikacji „is21” znaczy zwykłe 21. Wtedy as z dziesiątką remisuje z dwoma asami. W grze z bankiem i regule „remis dla banku” 21 banku pokonałoby dwa asy gracza. To przeczy wszystkim źródłom z rangą. Dlatego „wins”. Kölöknet mówi to samo innymi słowami: dwa asy to „22, więcej niż 21, bierze wszystko” ([Kölöknet](https://www.koloknet.hu/szuloszerep-es-gyermekneveles/magyar-kartya-jatekok-szabalyok-zsirozas-huszonegy-csapdlecsacsi/)). Liczba 21 albo 22 jest tylko etykietą. Wynik jest ten sam. Jedyny niejasny przypadek to Siedmiogród: „dwa asy znaczą 21, choć mają 22” ([homoludens](http://www.homoludens.hu/node/22356)). Z tekstu nie wynika, czy remisują z asem i dziesiątką. Inaczej jest w Czechach: tam „fojer” to zwykłe 21, i zestaw Oko bere słusznie ma „is21”.

Jeszcze jeden szczegół. Kölöknet uznaje dwa asy tylko z pierwszego rozdania, Kisokos mówi „w ręce”. Przy asie zawsze za 11 i talii 32 kart nie ma to znaczenia. Dwa asy i każda trzecia karta dają co najmniej 24. Dwa asy mogą więc wystąpić tylko jako ręka z dwóch kart. Pole persian w aplikacji („dokładnie dwa asy w dwóch kartach”) pasuje do obu opisów.

## Gotowy zestaw „Huszonegy” to 17 und 4 w węgierskich kartach

Pola z zadania i pola z kodu (`src/engine/rules.ts`), które mają węgierski odpowiednik:

| Pole | Wartość węgierska | Dlaczego | Pewność |
|---|---|---|---|
| deck | 32 | Wszystkie źródła ludowe. | wysoka |
| J / Q / K | 2 / 3 / 4 (alsó / felső / király) | Jednogłośnie. | wysoka |
| ace | "eleven" | Większość źródeł i idiom „19 + alsó”. | wysoka |
| persian | "wins" | Dwa asy stoją wyżej niż każde 21 (sekcja wyżej). | wysoka |
| mode | "bank" | Klasyczna forma i aplikacja jbdev. | wysoka |
| bankTie | "bankWins" | Wiki HU, kartya-jatek, jatek-szabalyok. | wysoka |
| bankTo17 | false | Bank dobiera według uznania. 17 to reguła blackjacka. | średnia |
| startCards | 1 | Wiki HU, Kisokos, kartya-jatek (klasyczna gra z bankiem). | średnia |
| bankRotation | "everyRound" | Rotacja co rozdanie (kartya-jatek, jatek-szabalyok, jbdev). „onPersian” jako opcja wg aduasz. | średnia |
| bustRevealed | true | Furę ogłasza się od razu („fuccs”). | wysoka |
| fiveCardTrick | false | Tylko jedna recenzja. Źródła piszą o czymś innym (nowe rozdanie). | niska |
| pontoon | false | As + X to wariant mniejszości (Kisokos). | niska |
| maxCards | null | Brak limitu w źródłach. | wysoka |

**Zestaw węgierski jest równy obecnemu „17 und 4”** w każdym polu, które ustawia preset (deck, values, ace, persian, mode, bankTie, bankTo17, pontoon, fiveCardTrick, maxCards). To trzeci identyczny zestaw obok 17 und 4 i Ajnc. `presetOf` już rozwiązuje to parametrem `prefer`. Węgry potrzebują więc wpisu `huszonegy` z tymi samymi regułami oraz HU w `BY_REGION` i hu w `BY_LANG`. Różnice są poza polami presetu. Pierwsza to wygląd: talia magyar kártya (Piros, Tök, Makk, Zöld) i nazwy figur Alsó / Felső / Király. Dziś słownik hu ma francuskie „Bubi / Dáma / Király”. PLAN.md już przewiduje talie węgierskie jako wygląd, nie reguły. Druga to próg 15, którego silnik nie ma. Trzecia to słownictwo.

Wariant rodzinny (Kölöknet: 2 karty, każdy z każdym, 10 rund) da się w przybliżeniu ustawić polem mode "family". Remisy rozstrzyga tam jednak liczba kart, a aplikacja ma tylko „allScore”/„noneScore”. Nie warto go wydawać jako osobnego zestawu przed potwierdzeniem.

Reguły, których silnik nie obsługuje:

| Reguła | Poparcie | Czy dodać |
|---|---|---|
| Minimum 14/15/16, by stanąć | 6 źródeł; najbardziej węgierska reguła | **Tak.** Pole np. `minStand: number \| null`. „Starczy” nieaktywne poniżej progu; boty, trener i walidacja Wi‑Fi muszą go respektować. Efekt zmierzyć `npm run stats` przed ustaleniem domyślnej wartości. |
| Remis: mniej kart wygrywa | 3 źródła (aduasz z bankiem, 2 rodzinne) | Może później, jako opcja remisu. Najpierw potwierdzić. |
| Óneász | 3 źródła | Nie teraz. Przy 11 tylko as daje furę, więc zysk jest mały, a wymaga nowej zapowiedzi w UI i protokole. |
| As + X wygrywa od razu | 1 źródło (wariant) | Nie. Pole `pontoon` daje podobny efekt (X to jedyna karta za 10), ale bez wersji „w jednym kolorze”. |
| „Sánta” (czerwona VII dzika) | 1 wieś | Nie. |
| Pięć kart: nowe rozdanie | 2 strony hobbystyczne, opis niejasny | Nie. Wygraną pięcioma kartami już daje `fiveCardTrick`. |

## Słownictwo przy stole: „Kérek”, „Elég”, „Fuccs!”

Źródła dają spójny zestaw zwrotów. Słownik hu już używa „Kérek” i „Elég” — oba mają mocne poparcie. Furę nazywa „Túl sok!”. To zrozumiałe, ale przy stole mówi się raczej „fuccs” lub „befuccsol”.

| Pojęcie (PL w aplikacji) | Węgierski | Źródła | Pewność |
|---|---|---|---|
| Dobieram | **Kérek** / Kérek még / Lapot kérek | [Kölöknet](https://www.koloknet.hu/szuloszerep-es-gyermekneveles/magyar-kartya-jatekok-szabalyok-zsirozas-huszonegy-csapdlecsacsi/), [aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php), [jatek-szabalyok](https://jatek-szabalyok.hu/huszonegy-a-klasszikus-kartyajatek/) | wysoka |
| Starczy | **Elég** / Megállok | [jatek-szabalyok](https://jatek-szabalyok.hu/huszonegy-a-klasszikus-kartyajatek/), [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/), [Kölöknet](https://www.koloknet.hu/szuloszerep-es-gyermekneveles/magyar-kartya-jatekok-szabalyok-zsirozas-huszonegy-csapdlecsacsi/) | wysoka |
| Fura! | **Fuccs!** (befuccsol); „fuccs (sok)” | [Wiki HU](https://hu.wikipedia.org/wiki/Huszonegyes), [Kisokos](https://mek.oszk.hu/00000/00056/html/134.htm), [aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php) | wysoka |
| Fura (inne) | Besokallt; Túl sok | [magyarkartyajatekok](https://magyarkartyajatekok.hu/huszonegy-21/) (też w haśle o blackjacku) | średnia |
| Fura (regionalnie) | Trapp | [homoludens](http://www.homoludens.hu/node/22356) | niska (tylko Siedmiogród) |
| Bank | Bank; osoba: bankár, bankos; rozdający: osztó | [Wiki HU](https://hu.wikipedia.org/wiki/Huszonegyes), [aduasz](https://aduasz.com/magyarkartya/szabalyok/huszonegy.php), [App Store](https://apps.apple.com/hu/app/id1549553547) | wysoka |
| Perskie oczko! | **Két ász!** (brak osobnej nazwy) | wszystkie źródła; „tűz/fojer” należą do innych gier | wysoka |
| Óneász (gdyby dodać) | Óneász / „Ne ászt” | [Kisokos](https://mek.oszk.hu/00000/00056/html/134.htm), [kartya-jatek](https://www.kartya-jatek.hu/huszonegy/) | średnia |

Propozycja: przycisk fury „Fuccs!”, w opisach można zostawić „túl sok (24)”. Strony z zasadami używają słów z węgierskiej listy zakazanej (PLAN.md §12). Nie wolno ich przenosić do słownika. „Ennyi”, „túllő” i „tizenhét és négy” nie występują w żadnym źródle.

## Do potwierdzenia u rodzimych graczy

1. Czy alsó = 2, felső = 3, király = 4, ász = 11?
2. Czy ász może liczyć się jako 1?
3. Czy dwa asy wygrywają z 21 złożonym z asa i dziesiątki?
4. Czy dwa asy w ręce banku wygrywają ze wszystkimi graczami?
5. Czy przy równym wyniku z bankiem wygrywa bank?
6. Czy przy równym wyniku wygrywa ten, kto ma mniej kart?
7. Czy nie wolno stanąć poniżej 15? (A może 14 albo 16?)
8. Czy bank musi dobierać do określonej liczby, np. do 17?
9. Czy na start każdy dostaje jedną kartę, a nie dwie?
10. Czy pięć kart bez przekroczenia 21 wygrywa?
11. Czy znacie i stosujecie „óneász”?
12. Czy bank przechodzi co rozdanie na następną osobę?
13. Czy przy stole mówi się „Kérek”, „Elég” i „Fuccs”?
14. Czy w domu gracie też bez banku, każdy z każdym?

Dobrym źródłem jest też ekran „Tudnivalók” w aplikacji jbdev (50K+ pobrań, gra na punkty z bankiem). Nie dało się go odczytać ([Google Play](https://play.google.com/store/apps/details?id=jbdev.huszonegy_magyar&hl=hu&gl=HU)).

## Conclusion

Węgry nie wymagają nowych wartości ani nowej logiki dwóch asów. Wystarczy zestaw „17 und 4” z węgierską nazwą, talią i słownictwem. To najtańszy z rynków z raportu rynkowego. Jedyną zmianą silnika, która naprawdę wyróżni Huszonegy, jest próg stania 15. Przyda się ona też innym zestawom, bo minimum stania znają gry domowe w wielu krajach. Warto ją dodać po pomiarze wpływu na boty. Pytania 3, 7 i 9 mają największą wagę. Rozstrzygają o tym, czy ustawienia domyślne będą brzmiały dla Węgra jak „nasza gra”.

## Źródła

- hu.wikipedia: Huszonegyes — https://hu.wikipedia.org/wiki/Huszonegyes
- hu.wikipedia: Huszonegy (blackjack, inna gra) — https://hu.wikipedia.org/wiki/Huszonegy
- Kisokos – Kártyajátékok szabályai, MEK (ok. 1997) — https://mek.oszk.hu/00000/00056/html/134.htm
- kartya-jatek.hu: Huszonegy — https://www.kartya-jatek.hu/huszonegy/
- jatek-szabalyok.hu: Huszonegy (2025) — https://jatek-szabalyok.hu/huszonegy-a-klasszikus-kartyajatek/
- aduasz.com: Huszonegy — https://aduasz.com/magyarkartya/szabalyok/huszonegy.php
- magyarkartyajatekok.hu: Huszonegy (21) — https://magyarkartyajatekok.hu/huszonegy-21/
- Kölöknet (7.07.2025) — https://www.koloknet.hu/szuloszerep-es-gyermekneveles/magyar-kartya-jatekok-szabalyok-zsirozas-huszonegy-csapdlecsacsi/
- Zsigmond Győző: Huszonegyes Erdélyben, homoludens.hu (2008) — http://www.homoludens.hu/node/22356
- Pais József: Kártya.hu, MEK — https://mek.oszk.hu/25800/25831/25831.doc
- Pallas Nagy Lexikona, „Huszonegyes” (nieodczytane, 403) — https://www.arcanum.com/hu/online-kiadvanyok/Lexikonok-a-pallas-nagy-lexikona-2/h-B866/huszonegyes-CFB6/
- gyakorikerdesek: ász 1 vagy 11 — https://www.gyakorikerdesek.hu/szorakozas__jatekok__9197646-a-blackjack-ben-az-asz-mikor-er-1-et-es-mikor-11-et
- gyakorikerdesek: 19-re lapot húz — https://www.gyakorikerdesek.hu/tudomanyok__tarsadalomtudomanyok-es-bolcseszet__12502454-mit-jelent-a-19-re-lapot-huz-kifejezes
- Huszonegy (magyar kártyával), Google Play — https://play.google.com/store/apps/details?id=jbdev.huszonegy_magyar&hl=hu&gl=HU
- Huszonegy (magyar kártyával), App Store HU — https://apps.apple.com/hu/app/id1549553547
- de.wikipedia: Siebzehn und Vier — https://de.wikipedia.org/wiki/Siebzehn_und_Vier
- cs.wikipedia: Jednadvacet — https://cs.wikipedia.org/wiki/Jednadvacet
- pagat: Card games in Hungary — https://www.pagat.com/national/hungary.html
