import { isAlgoName, isValidAlgorandAddress } from "@/lib/validation/address";

export function canStartSendFlow(input: { walletConnected: boolean; recipient: string; amount: string }) {
  if (!input.walletConnected) return { ok: false, reason: "wallet_not_connected" as const };
  if (!/^\d+(\.\d+)?$/.test(input.amount)) return { ok: false, reason: "invalid_amount" as const };
  if (isValidAlgorandAddress(input.recipient) || isAlgoName(input.recipient)) return { ok: true as const };
  return { ok: false, reason: "invalid_recipient" as const };
}
