import { describe, expect, it } from "vitest";
import { buildPayUri, parseMixUri } from "@/features/qr/uri";

describe("Mix URI", () => {
  it("parses pay URIs", () => {
    const uri = buildPayUri({ to: "alice.algo", amount: "10.50", note: "coffee" });
    const parsed = parseMixUri(uri);
    expect(parsed.type).toBe("pay");
    if (parsed.type === "pay") {
      expect(parsed.to).toBe("alice.algo");
      expect(parsed.amount).toBe("10.50");
    }
  });

  it("parses plain Algorand address as pay recipient", () => {
    const address = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
    const parsed = parseMixUri(address);
    expect(parsed).toEqual({ type: "pay", to: address, asset: "USDC" });
  });

  it("parses algorand payment URI", () => {
    const address = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
    const parsed = parseMixUri(`algorand://${address}?amount=2.5`);
    expect(parsed).toEqual({ type: "pay", to: address, asset: "USDC", amount: "2.5" });
  });

  it("parses pera send deeplink", () => {
    const address = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
    const parsed = parseMixUri(`pera://send?address=${address}&asset=USDC&amount=3.25`);
    expect(parsed).toEqual({ type: "pay", to: address, asset: "USDC", amount: "3.25" });
  });

  it("parses perawallet deeplink with base-units amount", () => {
    const address = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
    const parsed = parseMixUri(`perawallet://${address}?asset=31566704&amount=3250000`);
    expect(parsed).toEqual({ type: "pay", to: address, asset: "USDC", amount: "3.25" });
  });
});
