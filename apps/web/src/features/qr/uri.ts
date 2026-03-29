import { baseUnitsToDecimal } from "@/lib/utils/amount";
import { NetworkId } from "@/lib/algorand/network";
import { ParsedPaymentRequest, validateParsedPayment } from "@/lib/validation/payment";

type ParseMixUriOptions = {
  usdcAssetId: number;
  networkId: NetworkId;
};

export type ParsedUri = ParsedPaymentRequest;

function decodeParamIfNeeded(value: string, expectedPrefix: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith(expectedPrefix)) return trimmed;
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
}

export function parseMixUri(input: string, options: ParseMixUriOptions): ParsedUri {
  const text = input.trim();

  if (text.startsWith("Mix://pay?")) {
    const params = new URLSearchParams(text.replace("Mix://pay?", ""));
    return validateParsedPayment({
      to: params.get("to"),
      asset: params.get("asset") ?? "USDC",
      amount: params.get("amount") ?? undefined,
      note: params.get("note") ?? undefined,
      network: params.get("network") ?? undefined,
      source: "mix_uri",
    }, options);
  }

  if (text.includes("/pay?") || text.startsWith("/pay?")) {
    const params = new URLSearchParams(text.split("?")[1] ?? "");
    return validateParsedPayment({
      to: params.get("to"),
      asset: params.get("asset") ?? "USDC",
      amount: params.get("amount") ?? undefined,
      note: params.get("note") ?? undefined,
      network: params.get("network") ?? undefined,
      source: "app_link",
    }, options);
  }

  if (text.includes("/connect/pera?") || text.startsWith("/connect/pera?")) {
    const params = new URLSearchParams(text.split("?")[1] ?? "");
    const rawLink = params.get("link");
    if (rawLink) {
      const decodedLink = decodeParamIfNeeded(rawLink, "perawallet://");
      if (decodedLink.startsWith("perawallet://")) {
        return parseMixUri(decodedLink, options);
      }
    }
    throw new Error("Unsupported connect payload");
  }

  if (text.startsWith("pera://send?")) {
    const params = new URLSearchParams(text.replace("pera://send?", ""));
    return validateParsedPayment({
      to: params.get("address"),
      asset: params.get("asset") ?? "USDC",
      amount: params.get("amount") ?? undefined,
      note: params.get("note") ?? undefined,
      source: "pera_uri",
    }, options);
  }

  if (text.startsWith("perawallet://")) {
    const value = text.replace("perawallet://", "");
    const [addressPart, queryString] = value.split("?");
    const params = new URLSearchParams(queryString ?? "");
    const assetId = String(options.usdcAssetId);
    const amountRaw = params.get("amount") ?? undefined;
    const parsedAmount = amountRaw && /^\d+$/.test(amountRaw)
      ? baseUnitsToDecimal(BigInt(amountRaw), 6)
      : amountRaw;

    return validateParsedPayment({
      to: (addressPart ?? "").trim(),
      asset: params.get("asset") ?? assetId,
      amount: parsedAmount,
      note: params.get("note") ?? params.get("xnote") ?? undefined,
      source: "perawallet_uri",
    }, { ...options, requireAddress: true });
  }

  if (text.startsWith("algorand://") || text.startsWith("algorand:")) {
    const value = text.startsWith("algorand://") ? text.replace("algorand://", "") : text.replace("algorand:", "");
    const [addressPart, queryString] = value.split("?");
    const params = new URLSearchParams(queryString ?? "");
    return validateParsedPayment({
      to: (addressPart ?? "").split("/")[0].trim(),
      asset: params.get("asset") ?? String(options.usdcAssetId),
      amount: params.get("amount") ?? undefined,
      note: params.get("note") ?? undefined,
      source: "algorand_uri",
    }, { ...options, requireAddress: true });
  }

  return validateParsedPayment({
    to: text,
    asset: String(options.usdcAssetId),
    source: "mix_uri",
  }, options);
}

export function buildPayUri(input: {
  to: string;
  amount?: string;
  note?: string;
  network?: NetworkId;
}) {
  const params = new URLSearchParams({ to: input.to, asset: "USDC" });
  if (input.amount) params.set("amount", input.amount);
  if (input.note) params.set("note", input.note);
  if (input.network) params.set("network", input.network);
  return `Mix://pay?${params.toString()}`;
}
