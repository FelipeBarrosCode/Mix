import { isAlgoName, isValidAlgorandAddress } from "@/lib/validation/address";
import { decimalToBaseUnits } from "@/lib/utils/amount";
import { NetworkId } from "@/lib/algorand/network";

const SUPPORTED_USDC_ALIASES = new Set(["USDC", "USDCA"]);
const MAX_NOTE_BYTES = 256;

export type PaymentSource = "manual" | "mix_uri" | "app_link" | "pera_uri" | "perawallet_uri" | "algorand_uri" | "scan";

export type ParsedPaymentRequest = {
  type: "pay";
  to: string;
  assetId: number;
  amount?: string;
  note?: string;
  source: Exclude<PaymentSource, "manual">;
};

type PaymentValidationOptions = {
  usdcAssetId: number;
  networkId: NetworkId;
  allowAlgoName?: boolean;
  requireAddress?: boolean;
};

export function validatePaymentRecipient(raw: string, options: Pick<PaymentValidationOptions, "allowAlgoName" | "requireAddress">) {
  const value = raw.trim();
  if (!value) throw new Error("Recipient is required.");
  if (isValidAlgorandAddress(value)) return value;
  if (!options.requireAddress && options.allowAlgoName !== false && isAlgoName(value)) return value;
  throw new Error(options.requireAddress ? "Payment link must contain a valid Algorand address." : "Recipient must be a valid Algorand address or .algo name.");
}

export function validatePaymentAmount(raw?: string) {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value) return undefined;
  const amountBase = decimalToBaseUnits(value, 6);
  if (amountBase <= 0n) throw new Error("Amount must be greater than zero.");
  return value;
}

export function validatePaymentNote(raw?: string) {
  if (!raw) return undefined;
  const value = raw.trim();
  if (!value) return undefined;
  if (/[\u0000-\u001F\u007F]/.test(value)) {
    throw new Error("Reference contains unsupported control characters.");
  }
  const byteLength = new TextEncoder().encode(value).length;
  if (byteLength > MAX_NOTE_BYTES) {
    throw new Error(`Reference is too long. Max ${MAX_NOTE_BYTES} bytes.`);
  }
  return value;
}

export function assertMatchingNetwork(raw: string | null, expectedNetwork: NetworkId) {
  if (!raw) return;
  const value = raw.trim().toLowerCase();
  if (!value) return;
  if (value !== expectedNetwork) {
    throw new Error(`Payment request is for ${value}, but your wallet is on ${expectedNetwork}.`);
  }
}

export function normalizeUsdcAsset(raw: string | null | undefined, usdcAssetId: number) {
  const value = (raw ?? "").trim();
  if (!value) return usdcAssetId;
  const upper = value.toUpperCase();
  if (SUPPORTED_USDC_ALIASES.has(upper)) return usdcAssetId;
  if (value === String(usdcAssetId)) return usdcAssetId;
  throw new Error(`Unsupported asset. This app only supports USDCa (ASA ${usdcAssetId}) on the active network.`);
}

export function validateParsedPayment(input: {
  to: string | null | undefined;
  amount?: string | null;
  note?: string | null;
  asset?: string | null;
  network?: string | null;
  source: ParsedPaymentRequest["source"];
}, options: PaymentValidationOptions): ParsedPaymentRequest {
  assertMatchingNetwork(input.network ?? null, options.networkId);
  return {
    type: "pay",
    to: validatePaymentRecipient(input.to ?? "", options),
    assetId: normalizeUsdcAsset(input.asset, options.usdcAssetId),
    amount: validatePaymentAmount(input.amount ?? undefined),
    note: validatePaymentNote(input.note ?? undefined),
    source: input.source,
  };
}

export function isPaymentRequestInput(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("Mix://")
    || trimmed.startsWith("/pay?")
    || trimmed.includes("/pay?")
    || trimmed.startsWith("/connect/pera?")
    || trimmed.includes("/connect/pera?")
    || trimmed.startsWith("pera://send?")
    || trimmed.startsWith("perawallet://")
    || trimmed.startsWith("algorand://")
    || trimmed.startsWith("algorand:");
}
