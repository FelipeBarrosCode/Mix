import { getAccount } from "@/lib/algorand/indexer";
import { useNetworkStore } from "@/stores/network-store";

export async function isOptedIntoUsdc(address: string) {
  const usdcAssetId = useNetworkStore.getState().getActiveConfig().usdcAssetId;
  const account = await getAccount(address);
  return (account.account.assets ?? []).some((a) => Number(a.assetId) === usdcAssetId);
}

export async function getUsdcBalance(address: string) {
  const usdcAssetId = useNetworkStore.getState().getActiveConfig().usdcAssetId;
  const account = await getAccount(address);
  const holding = (account.account.assets ?? []).find((a) => Number(a.assetId) === usdcAssetId);
  return BigInt(holding?.amount ?? 0);
}
