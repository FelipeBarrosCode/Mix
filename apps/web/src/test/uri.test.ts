import { describe, expect, it } from "vitest";
import { buildPayUri, parseMixUri } from "@/features/qr/uri";

const parseOptions = { usdcAssetId: 31566704, networkId: "mainnet" as const };

describe("Mix URI", () => {
  it("parses pay URIs", () => {
    const uri = buildPayUri({ to: "alice.algo", amount: "10.50", note: "coffee", network: "mainnet" });
    const parsed = parseMixUri(uri, parseOptions);
    expect(parsed.type).toBe("pay");
    if (parsed.type === "pay") {
      expect(parsed.to).toBe("alice.algo");
      expect(parsed.amount).toBe("10.50");
      expect(parsed.assetId).toBe(31566704);
    }
  });

  it("parses plain Algorand address as pay recipient", () => {
    const address = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
    const parsed = parseMixUri(address, parseOptions);
    expect(parsed).toEqual({ type: "pay", to: address, assetId: 31566704, source: "mix_uri" });
  });

  it("parses algorand payment URI", () => {
    const address = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
    const parsed = parseMixUri(`algorand://${address}?amount=2.5`, parseOptions);
    expect(parsed).toEqual({ type: "pay", to: address, assetId: 31566704, amount: "2.5", source: "algorand_uri" });
  });

  it("parses pera send deeplink", () => {
    const address = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
    const parsed = parseMixUri(`pera://send?address=${address}&asset=USDC&amount=3.25`, parseOptions);
    expect(parsed).toEqual({ type: "pay", to: address, assetId: 31566704, amount: "3.25", source: "pera_uri" });
  });

  it("parses perawallet deeplink with base-units amount", () => {
    const address = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
    const parsed = parseMixUri(`perawallet://${address}?asset=31566704&amount=3250000`, parseOptions);
    expect(parsed).toEqual({ type: "pay", to: address, assetId: 31566704, amount: "3.25", source: "perawallet_uri" });
  });

  it("parses canonical connect link with encoded perawallet deeplink", () => {
    const address = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
    const deepLink = `perawallet://${address}?asset=31566704&amount=3250000&note=coffee`;
    const encoded = encodeURIComponent(deepLink);
    const parsed = parseMixUri(`https://mix.app/connect/pera?link=${encoded}`, parseOptions);
    expect(parsed).toEqual({ type: "pay", to: address, assetId: 31566704, amount: "3.25", note: "coffee", source: "perawallet_uri" });
  });

  it("rejects asset mismatches for the active network", () => {
    const address = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ";
    expect(() => parseMixUri(`perawallet://${address}?asset=10458941&amount=3250000`, parseOptions)).toThrow(/Unsupported asset/);
  });
});
