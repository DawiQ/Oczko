# Boty — kalibracja poziomów

Wygenerowane przez `npm run tournament` (6000 rozdań na tryb, te same
rozdania dla każdej postaci — porównanie parami).

- **Rodzinne:** postać + 3 graczy referencyjnych (stają przy 15, 17 i 19),
  rozdający rotuje. Wynik = odsetek rund z punktem dla postaci.
- **Bank 1 na 1:** postać vs gracz referencyjny (staje przy 17), postać jest
  bankiem w co drugim rozdaniu. Wynik = odsetek rund z punktem dla postaci.
- **Siła** = średnia obu wyników. **z** = test parami względem poprzedniego
  poziomu (na tych samych rozdaniach); z > 2 → różnica istotna.

| Poziom | Postać | Polityka | Rodzinne | Bank 1:1 | Siła | z vs poprzedni |
|---|---|---|---|---|---|---|
| 1 | Zosia (Początki) | staje przy 15, 25% losowych decyzji | 13.9% | 36.1% | 25.0% | — |
| 2 | Kuba (Łatwy) | staje przy 14 | 20.4% | 40.7% | 30.5% | 15.3 |
| 3 | Witek (Ryzykant) | staje przy 20 | 30.1% | 39.7% | 34.9% | 9.6 |
| 4 | Hela (Ostrożna) | staje przy 16 | 27.9% | 46.2% | 37.0% | 4.9 |
| 5 | Ola (Średni) | staje przy 17 | 31.2% | 48.7% | 39.9% | 14.0 |
| 6 | Marek (Trudny) | staje przy 17, patrzy na stół | 33.5% | 48.7% | 41.1% | 9.8 |
| 7 | Profesor (Ekspert) | ewaluator, 40 próbek | 35.4% | 49.4% | 42.4% | 5.1 |
| 8 | Hrabia (Mistrz) | ewaluator, 1500 próbek | 35.8% | 50.2% | 43.0% | 3.0 |

Poziomy rosną monotonicznie: **tak**. Sąsiednie
poziomy różnią się istotnie: **tak**.

## Zestawy zasad (PLAN.md §13)

Ten sam turniej na kartach zestawu (2000 rozdań na tryb). Ajnc ma karty
17 und 4.

| Zestaw | Zosia | Kuba | Witek | Hela | Ola | Marek | Profesor | Hrabia | Rosną monotonicznie |
|---|---|---|---|---|---|---|---|---|---|
| 17 und 4 | 30.3% | 38.8% | 33.5% | 39.4% | 40.5% | 40.8% | 42.2% | 42.6% | NIE |
| Oko bere | 30.3% | 42.2% | 35.9% | 42.2% | 41.8% | 41.8% | 43.0% | 43.3% | NIE |
| Очко | 31.7% | 38.4% | 36.0% | 41.0% | 41.1% | 41.9% | 41.9% | 42.8% | NIE |
| Pontoon | 29.3% | 36.6% | 36.1% | 39.7% | 41.2% | 41.8% | 41.8% | 42.4% | NIE |

Siła zwykłego progu („staje przy t”) na kartach zestawu:

| Zestaw | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 |
|---|---|---|---|---|---|---|---|---|---|
| 17 und 4 | 34.8% | 37.0% | 38.8% | 39.6% | 39.4% | 40.5% | 40.8% | 39.5% | 33.5% |
| Oko bere | 37.0% | 40.3% | 42.2% | 42.6% | 42.2% | 41.8% | 41.0% | 39.4% | 35.9% |
| Очко | 34.5% | 36.2% | 38.4% | 39.9% | 41.0% | 41.1% | 41.6% | 40.7% | 36.0% |
| Pontoon | 34.2% | 35.4% | 36.6% | 37.9% | 39.7% | 41.2% | 41.4% | 40.4% | 36.1% |

Na taliach 32 i 36 kart (bez kart 2–6 / 2–5) progi 14–18 dają prawie tę samą siłę —
środkowe poziomy (Kuba, Hela, Ola, Marek) różnią się o ok. 1–2 pkt proc.,
a samymi progami nie da się ich rozsunąć. Witek (ciągnie do 20) jest tu
słabszy niż na 52 kartach (Очко: bank dobiera do 17). W Pontoonie (figury
po 10) krzywa rośnie do 17–18 jak w Oczku, poziomy od Heli rosną, a Kuba
i Witek są blisko siebie (różnica w granicach szumu). Decyzja (PLAN.md §13): postacie bez zmian —
ich styl i opisy („staje przy 14”) zostają prawdziwe; kolejność poziomów
obowiązuje dla domyślnego Oczka.

Dla odniesienia: przy 4 równych graczach udział rund z punktem w trybie
rodzinnym wynosi ok. 25% (+ remisy), a w banku 1:1 ok. 50%.
