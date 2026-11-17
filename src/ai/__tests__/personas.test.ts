import { STRENGTH } from "../calibration";
import { PERSONAS, personaById, seatNames } from "../personas";

describe("personas", () => {
  it("have unique ids, names and colours", () => {
    expect(new Set(PERSONAS.map((p) => p.id)).size).toBe(PERSONAS.length);
    expect(new Set(PERSONAS.map((p) => p.name)).size).toBe(PERSONAS.length);
    expect(new Set(PERSONAS.map((p) => p.color)).size).toBe(PERSONAS.length);
    expect(PERSONAS.length).toBeGreaterThanOrEqual(8);
    expect(personaById("hrabia")?.name).toBe("Hrabia");
    expect(personaById("nikt")).toBeUndefined();
  });

  it("are ordered by measured strength, weakest first (npm run tournament)", () => {
    const s = PERSONAS.map((p) => STRENGTH[p.id]);
    expect(s.every((x) => typeof x === "number")).toBe(true);
    for (let i = 1; i < s.length; i++) expect(s[i]).toBeGreaterThan(s[i - 1]);
    expect(Object.keys(STRENGTH).sort()).toEqual(PERSONAS.map((p) => p.id).sort());
  });

  it("number repeated characters", () => {
    expect(seatNames(["ola", "hrabia", "ola", "ola"])).toEqual(["Ola", "Hrabia", "Ola II", "Ola III"]);
  });
});
