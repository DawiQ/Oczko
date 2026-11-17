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

Dla odniesienia: przy 4 równych graczach udział rund z punktem w trybie
rodzinnym wynosi ok. 25% (+ remisy), a w banku 1:1 ok. 50%.
