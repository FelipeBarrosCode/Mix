import { useQuery } from "@tanstack/react-query";
import { discoverRecipientsFromHistory } from "@/lib/algorand/recipients";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";

export function useDiscoveredRecipients(address?: string) {
  const network = useActiveNetworkConfig();

  return useQuery({
    queryKey: ["discovered-recipients", network.id, address],
    queryFn: async () => {
      if (!address) return [];
      return discoverRecipientsFromHistory({
        sender: address,
        usdcAssetId: network.usdcAssetId,
        limitPages: 6,
        reverseLookup: true,
      });
    },
    enabled: false,
    staleTime: 1000 * 60 * 3,
  });
}
