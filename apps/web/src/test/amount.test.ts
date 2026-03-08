import { describe, expect, it } from "vitest";
import { baseUnitsToDecimal, decimalToBaseUnits } from "@/lib/utils/amount";

describe("amount conversion", () => {
  it("converts decimal to base units", () => {
    expect(decimalToBaseUnits("1", 6)).toBe(1_000_000n);
    expect(decimalToBaseUnits("0.1", 6)).toBe(100_000n);
    expect(decimalToBaseUnits("12.345678", 6)).toBe(12_345_678n);
  });

  it("converts base units to decimal", () => {
    expect(baseUnitsToDecimal(12_345_678n, 6)).toBe("12.345678");
    expect(baseUnitsToDecimal(1_000_000n, 6)).toBe("1");
  });

  it("throws with too many decimals", () => {
    expect(() => decimalToBaseUnits("1.0000001", 6)).toThrow();
  });
});
