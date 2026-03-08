import { useQuery } from "@tanstack/react-query";
import { getAccount } from "@/lib/algorand/indexer";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";

export function useAccountSummary(address?: string) {
  const config = useActiveNetworkConfig();
  return useQuery({
    queryKey: ["account-summary", config.id, address],
    queryFn: async () => {
      if (!address) return null;
      const account = await getAccount(address);
      const usdc = (account.account.assets ?? []).find((a) => Number(a.assetId) === config.usdcAssetId)?.amount ?? 0;
      return {
        algoMicro: BigInt(account.account.amount ?? 0),
        usdcMicro: BigInt(usdc),
      };
    },
    enabled: !!address,
    refetchInterval: 20_000,
  });
}
