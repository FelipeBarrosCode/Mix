import { useQuery } from "@tanstack/react-query";
import { getAccount, getAsset } from "@/lib/algorand/indexer";
import { baseUnitsToDecimal } from "@/lib/utils/amount";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";

export type WalletAssetOption = {
  id: string;
  label: string;
  symbol: string;
  assetId?: number;
  decimals: number;
  balance: string;
  isAlgo?: boolean;
};

export function useWalletAssets(address?: string) {
  const network = useActiveNetworkConfig();

  return useQuery({
    queryKey: ["wallet-assets", network.id, address],
    enabled: Boolean(address),
    refetchInterval: 30_000,
    queryFn: async (): Promise<WalletAssetOption[]> => {
      if (!address) return [];

      const account = await getAccount(address);
      const assets = (account.account.assets ?? [])
        .filter((item) => Number(item.amount ?? 0) > 0)
        .filter((item) => Number(item.assetId) !== network.usdcAssetId)
        .slice(0, 25);

      const algoOption: WalletAssetOption = {
        id: "algo",
        label: "ALGO",
        symbol: "ALGO",
        decimals: 6,
        balance: baseUnitsToDecimal(BigInt(account.account.amount ?? 0), 6),
        isAlgo: true,
      };

      const tokenOptions = await Promise.all(
        assets.map(async (item) => {
          const assetId = Number(item.assetId);
          let symbol = `ASA-${assetId}`;
          let name = symbol;
          let decimals = 0;

          try {
            const asset = await getAsset(assetId);
            const params = (asset as { asset?: { params?: { unitName?: string; name?: string; decimals?: number } } }).asset?.params;
            symbol = (params?.unitName ?? symbol).toUpperCase();
            name = params?.name ?? symbol;
            decimals = Number(params?.decimals ?? 0);
          } catch {
            // keep fallback metadata
          }

          return {
            id: String(assetId),
            label: `${symbol} - ${name}`,
            symbol,
            assetId,
            decimals,
            balance: baseUnitsToDecimal(BigInt(item.amount ?? 0), decimals),
          } satisfies WalletAssetOption;
        }),
      );

      return [algoOption, ...tokenOptions];
    },
  });
}
