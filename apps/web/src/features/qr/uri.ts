import { z } from "zod";
import { isAlgoName, isValidAlgorandAddress } from "@/lib/validation/address";

const paySchema = z.object({
  type: z.literal("pay"),
  to: z.string(),
  asset: z.literal("USDC").default("USDC"),
  amount: z.string().optional(),
  note: z.string().optional(),
});

export type ParsedUri = z.infer<typeof paySchema>;

export function parseMixUri(input: string): ParsedUri {
  const text = input.trim();

  if (text.startsWith("Mix://pay?")) {
    const params = new URLSearchParams(text.replace("Mix://pay?", ""));
    return paySchema.parse({
      type: "pay",
      to: params.get("to"),
      asset: params.get("asset") ?? "USDC",
      amount: params.get("amount") ?? undefined,
      note: params.get("note") ?? undefined,
    });
  }

  if (text.includes("/pay?") || text.startsWith("/pay?")) {
    const params = new URLSearchParams(text.split("?")[1] ?? "");
    return paySchema.parse({
      type: "pay",
      to: params.get("to"),
      asset: params.get("asset") ?? "USDC",
      amount: params.get("amount") ?? undefined,
      note: params.get("note") ?? undefined,
    });
  }

  if (text.startsWith("pera://send?")) {
    const params = new URLSearchParams(text.replace("pera://send?", ""));
    return paySchema.parse({
      type: "pay",
      to: params.get("address"),
      asset: params.get("asset") ?? "USDC",
      amount: params.get("amount") ?? undefined,
      note: params.get("note") ?? undefined,
    });
  }

  if (text.startsWith("perawallet://")) {
    const value = text.replace("perawallet://", "");
    const [addressPart, queryString] = value.split("?");
    const to = (addressPart ?? "").trim();
    const params = new URLSearchParams(queryString ?? "");
    const amountRaw = params.get("amount") ?? undefined;
    const assetRaw = params.get("asset") ?? undefined;

    let parsedAmount: string | undefined = undefined;
    if (amountRaw && /^\d+$/.test(amountRaw)) {
      const decimals = assetRaw === "31566704" || assetRaw === "10458941" ? 6 : 6;
      const s = amountRaw.padStart(decimals + 1, "0");
      const whole = s.slice(0, -decimals) || "0";
      const fraction = s.slice(-decimals).replace(/0+$/, "");
      parsedAmount = fraction ? `${whole}.${fraction}` : whole;
    } else {
      parsedAmount = amountRaw;
    }

    return paySchema.parse({
      type: "pay",
      to,
      asset: "USDC",
      amount: parsedAmount,
      note: params.get("note") ?? params.get("xnote") ?? undefined,
    });
  }

  if (text.startsWith("algorand://") || text.startsWith("algorand:")) {
    const value = text.startsWith("algorand://") ? text.replace("algorand://", "") : text.replace("algorand:", "");
    const [addressPart, queryString] = value.split("?");
    const to = (addressPart ?? "").split("/")[0].trim();
    const params = new URLSearchParams(queryString ?? "");
    return paySchema.parse({
      type: "pay",
      to,
      asset: "USDC",
      amount: params.get("amount") ?? undefined,
      note: params.get("note") ?? undefined,
    });
  }

  if (isValidAlgorandAddress(text) || isAlgoName(text)) {
    return paySchema.parse({
      type: "pay",
      to: text,
      asset: "USDC",
    });
  }

  throw new Error("Unsupported QR payload");
}

export function buildPayUri(input: {
  to: string;
  amount?: string;
  note?: string;
}) {
  const params = new URLSearchParams({ to: input.to, asset: "USDC" });
  if (input.amount) params.set("amount", input.amount);
  if (input.note) params.set("note", input.note);
  return `Mix://pay?${params.toString()}`;
}
