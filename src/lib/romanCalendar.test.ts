import { describe, it, expect } from "vitest";
import { romanDate, festivalsOn, nextFestival } from "./romanCalendar";

describe("roman calendar", () => {
  it("kalends, nones, ides", () => {
    expect(romanDate(new Date(2026, 0, 1))).toBe("Kal. Ian.");
    expect(romanDate(new Date(2026, 2, 7))).toBe("Non. Mar.");
    expect(romanDate(new Date(2026, 2, 15))).toBe("Id. Mar.");
  });
  it("counts inclusively", () => {
    expect(romanDate(new Date(2026, 9, 6))).toBe("prid. Non. Oct.");
    expect(romanDate(new Date(2026, 0, 2))).toBe("a.d. IV Non. Ian.");
    expect(romanDate(new Date(2026, 2, 14))).toBe("prid. Id. Mar.");
  });
  it("counts to next kalends after ides", () => {
    expect(romanDate(new Date(2026, 9, 31))).toBe("prid. Kal. Nov.");
    expect(romanDate(new Date(2026, 11, 25))).toBe("a.d. VIII Kal. Ian.");
    expect(romanDate(new Date(2026, 2, 16))).toBe("a.d. XVII Kal. Apr.");
  });
  it("festivals", () => {
    expect(festivalsOn(new Date(2026, 11, 20))[0].name).toBe("Saturnalia");
    expect(nextFestival(new Date(2026, 9, 6)).name).toBe("Meditrinalia");
  });
});
