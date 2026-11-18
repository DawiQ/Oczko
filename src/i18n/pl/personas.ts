// Polish: the computer characters (portraits, colours and levels live in
// src/ai/personas.ts; only words here).
import type { PersonaId } from "../../ai/personas";

export interface PersonaText {
  name: string;
  /** "z …": the name in the instrumental case. */
  withName: string;
  /** Short label of the level / style. */
  label: string;
  blurb: string;
}

export const personas: Record<PersonaId, PersonaText> = {
  zosia: { name: "Zosia", withName: "Zosią", label: "Początki", blurb: "Dobiera, póki karty są ładne" },
  kuba: { name: "Kuba", withName: "Kubą", label: "Łatwy", blurb: "Staje już przy 14" },
  witek: { name: "Witek", withName: "Witkiem", label: "Ryzykant", blurb: "Ciągnie do 20, często ma furę" },
  hela: { name: "Hela", withName: "Helą", label: "Ostrożna", blurb: "Nie lubi ryzyka — staje przy 16" },
  ola: { name: "Ola", withName: "Olą", label: "Średni", blurb: "Gra rozsądnie, staje przy 17" },
  marek: { name: "Marek", withName: "Markiem", label: "Trudny", blurb: "Patrzy, kto jeszcze jest w grze" },
  profesor: { name: "Profesor", withName: "Profesorem", label: "Ekspert", blurb: "Szacuje szanse przed każdym ruchem" },
  hrabia: { name: "Hrabia", withName: "Hrabią", label: "Mistrz", blurb: "Rozważa tysiące rozdań na ruch" },
};
