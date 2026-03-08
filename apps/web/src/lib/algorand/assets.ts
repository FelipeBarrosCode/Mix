import { runWithIndexerFallback } from "@/lib/algorand/clients";

const cache = new Map<number, { name: string; unitName: string; decimals: number }>();

export async function getAssetMetadata(assetId: number) {
  if (cache.has(assetId)) return cache.get(assetId)!;
  const asset = await runWithIndexerFallback((client) => client.lookupAssetByID(assetId).do());
  const metadata = {
    name: asset.asset.params.name ?? `Asset ${assetId}`,
    unitName: asset.asset.params.unitName ?? "UNIT",
    decimals: asset.asset.params.decimals ?? 0,
  };
  cache.set(assetId, metadata);
  return metadata;
}
