import { describe, expect, it } from "vitest";
import { canStartSendFlow } from "@/features/send/flow";

describe("send flow smoke", () => {
  it("allows wallet + valid address", () => {
    const result = canStartSendFlow({
      walletConnected: true,
      recipient: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAY5HFKQ",
      amount: "3.10",
    });
    expect(result.ok).toBe(true);
  });

  it("blocks invalid recipient", () => {
    const result = canStartSendFlow({ walletConnected: true, recipient: "abc", amount: "3.10" });
    expect(result.ok).toBe(false);
  });
});
