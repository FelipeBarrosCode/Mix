export async function fetchAssetUsdPrice(input: { isAlgo?: boolean; assetId?: number; usdcAssetId: number }) {
  if (input.isAlgo) {
    const response = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=algorand&vs_currencies=usd");
    if (!response.ok) throw new Error("algo_price_unavailable");
    const json = (await response.json()) as { algorand?: { usd?: number } };
    return json.algorand?.usd ?? null;
  }

  if (!input.assetId) return null;
  if (input.assetId === input.usdcAssetId) return 1;

  const response = await fetch(
    `https://api.coingecko.com/api/v3/simple/token_price/algorand?contract_addresses=${input.assetId}&vs_currencies=usd`,
  );
  if (!response.ok) return null;
  const json = (await response.json()) as Record<string, { usd?: number }>;
  const key = String(input.assetId);
  return json[key]?.usd ?? null;
}
