import { describe, expect, it } from "vitest";
import { getUnitArtwork, UNIT_ARTWORK } from "./unitArtwork";

describe("uploaded unit artwork", () => {
  it.each(UNIT_ARTWORK)("matches the original banner for $name", (unit) => {
    expect(getUnitArtwork(unit.name)?.src).toBe(unit.src);
  });
  it("matches the board's Urbanae title", () => {
    expect(getUnitArtwork("Urbanae Cohortis")?.name).toBe("Cohortes Urbanae");
  });
  it("allows decorative symbols and capitalization in unit titles", () => {
    expect(getUnitArtwork("⚔️ LEGIO XXI RAPAX")?.name).toBe("Legio XXI Rapax");
  });
  it.each(["Legion Structure", "Military Sector", "Training", "How to join Legio I Italica"])("does not mislabel %s as a unit", (name) => {
    expect(getUnitArtwork(name)).toBeNull();
  });
});