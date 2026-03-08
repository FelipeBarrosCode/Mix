import { describe, expect, it } from "vitest";
import { isAlgoName, isValidAlgorandAddress } from "@/lib/validation/address";

describe("address validation", () => {
  it("validates .algo names", () => {
    expect(isAlgoName("merchant.algo")).toBe(true);
    expect(isAlgoName("bad.name")).toBe(false);
  });

  it("validates algorand addresses", () => {
    expect(isValidAlgorandAddress("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ")).toBe(true);
    expect(isValidAlgorandAddress("invalid")).toBe(false);
  });
});
