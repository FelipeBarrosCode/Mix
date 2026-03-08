import { useMemo } from "react";
import { NETWORKS, type NetworkConfig, type NetworkId } from "@/lib/algorand/network";
import { useNetworkStore } from "@/stores/network-store";

export function useActiveNetworkConfig(): NetworkConfig {
  const network = useNetworkStore((s) => s.network);
  const override = useNetworkStore((s) => s.overrides[network]);

  return useMemo(() => {
    const base = NETWORKS[network as NetworkId];
    return { ...base, ...(override ?? {}) };
  }, [network, override]);
}
