import type { FiatCurrency } from "@/stores/preferences-store";

export type FxQuote = {
  currency: FiatCurrency;
  usdToFiat: number;
  source: string;
  updatedAt: string;
};

async function fetchFrankfurter(currency: FiatCurrency): Promise<FxQuote> {
  if (currency === "USD") {
    return { currency, usdToFiat: 1, source: "usd-peg", updatedAt: new Date().toISOString() };
  }

  const response = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${currency}`);
  if (!response.ok) throw new Error("Frankfurter request failed");
  const json = (await response.json()) as { date: string; rates: Record<string, number> };
  const rate = json.rates[currency];
  if (!rate) throw new Error("Rate unavailable");
  return { currency, usdToFiat: rate, source: "frankfurter", updatedAt: json.date };
}

async function fetchOpenErApi(currency: FiatCurrency): Promise<FxQuote> {
  const response = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!response.ok) throw new Error("ER-API request failed");
  const json = (await response.json()) as { time_last_update_utc: string; rates: Record<string, number> };
  const rate = currency === "USD" ? 1 : json.rates[currency];
  if (!rate) throw new Error("Rate unavailable");
  return {
    currency,
    usdToFiat: rate,
    source: "open-er-api",
    updatedAt: new Date(json.time_last_update_utc).toISOString(),
  };
}

export async function fetchFxQuote(currency: FiatCurrency): Promise<FxQuote> {
  try {
    return await fetchFrankfurter(currency);
  } catch {
    return fetchOpenErApi(currency);
  }
}

export function convertUsdcToFiat(amountUsdc: string, quote?: FxQuote) {
  const numeric = Number(amountUsdc || 0);
  if (!quote || Number.isNaN(numeric)) return null;
  return numeric * quote.usdToFiat;
}
