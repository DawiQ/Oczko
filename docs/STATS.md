# Statystyki reguł

Wygenerowane przez `npm run stats` z symulacji botów (deterministyczne
ziarna). Boty: progi 15–19 (mieszany stół), w testach sprawiedliwości —
wszyscy jednakowi (próg 17).

## Rundy

20 000 rund na wiersz.

| Wariant | Graczy | Dobrań na rękę | Fura (% rąk) | Bank wygrywa pojedynek | Bank punktuje (% rund) |
|---|---|---|---|---|---|
| Rodzinne (52) | 4 | 2,48 | 27.5% | — | — |
| Rodzinne (52) | 6 | 2,46 | 26.5% | — | — |
| Z bankierem (52) | 4 | 2,47 | 27.4% | 56.6% | 56.2% |
| Z bankierem (52) | 2 | 2,11 | 18.6% | 55.9% | 55.9% |
| Rodzinne (24 karty) | 4 | 2,15 | 37.7% | — | — |
| Rodzinne, 2 karty na start | 4 | 1,47 | 27.4% | — | — |

## Sprawiedliwość trybu z bankierem

Udział wygranych partii (do 10 pkt) per miejsce przy jednakowych botach,
bank co rundę na kolejnym miejscu, 3000 partii na wiersz. Cel: każde miejsce
≈ 1/n ± 3 pp dla domyślnego `majority`.

| Punktacja banku | Graczy | Udział per miejsce | Oczekiwany | Maks. odchylenie |
|---|---|---|---|---|
| majority | 2 | 50.8% / 49.2% | 50.0% | 0.8 pp |
| majority | 3 | 34.0% / 33.1% / 32.9% | 33.3% | 0.7 pp |
| majority | 4 | 24.6% / 25.7% / 24.6% / 25.0% | 25.0% | 0.7 pp |
| majority | 6 | 16.8% / 15.3% / 16.7% / 16.6% / 17.1% / 17.5% | 16.7% | 1.3 pp |
| perDuel | 2 | 50.8% / 49.2% | 50.0% | 0.8 pp |
| perDuel | 3 | 33.6% / 33.4% / 33.0% | 33.3% | 0.3 pp |
| perDuel | 4 | 24.9% / 25.0% / 24.2% / 25.9% | 25.0% | 0.9 pp |
| perDuel | 6 | 17.4% / 15.9% / 16.0% / 17.4% / 15.7% / 17.6% | 16.7% | 1.0 pp |

Domyślna punktacja (`majority`) zbalansowana: **tak**.
Średnia liczba rund do 10 pkt przy 4 graczach: `majority` 16,8,
`perDuel` 10,0 (przy `perDuel` bank zbiera do n−1 punktów
w rundzie, więc partia kończy się szybciej i zależy od tego, kto ma bank
w końcówce).

## Brak kart w talii

Odsetek rund, w których skończyła się talia (2 karty na start, wszyscy
dobierają do 20 — najgorszy przypadek), 20 000 rund na liczbę graczy.
Przy pustej talii można już tylko powiedzieć „Starczy”.

| Talia | Limit graczy (`MAX_SEATS`) | P(pusta talia) wg liczby graczy |
|---|---|---|
| 24 | 5 | 2: 0.00%, 3: 0.00%, 4: 0.00%, 5: 0.00%, 6: 5.22% (ponad limit), 7: 91.45% (ponad limit), 8: 100.00% (ponad limit) |
| 32 | 7 | 2: 0.00%, 3: 0.00%, 4: 0.00%, 5: 0.00%, 6: 0.00%, 7: 0.00%, 8: 0.14% (ponad limit) |
| 52 | 8 | 2: 0.00%, 3: 0.00%, 4: 0.00%, 5: 0.00%, 6: 0.00%, 7: 0.00%, 8: 0.00% |

## Długość partii do 10 punktów

Tempo normalne: bot 0,8 s na decyzję, człowiek ok. 2 s, rozdanie ok. 2 s,
odsłanianie 0,4 s na rękę, ekran końca rundy ok. 3 s. 1500 partii na wiersz.

| Tryb | Graczy | Rund | Czas |
|---|---|---|---|
| Rodzinne | 2 | 15,7 | 3,8 min |
| Rodzinne | 4 | 22,5 | 7,7 min |
| Rodzinne | 6 | 26,5 | 11,7 min |
| Z bankierem | 2 | 16,1 | 3,7 min |
| Z bankierem | 4 | 16,5 | 5,7 min |
| Z bankierem | 6 | 16,6 | 7,3 min |

## Szybkość ewaluatora

1500 próbek Monte Carlo na decyzję, Node (JIT), średnia ze 150 pozycji.
Na telefonie (Hermes, bez JIT) liczone w kawałkach po 250 próbek, bez
blokowania UI.

| Tryb | Graczy | Czas |
|---|---|---|
| Rodzinne | 4 | 7,0 ms |
| Rodzinne | 8 | 10,7 ms |
| Z bankierem | 4 | 8,3 ms |
