import { create } from "zustand";
import { DEFAULT_NETWORK, NETWORKS, NetworkConfig, NetworkId } from "@/lib/algorand/network";
import { readJson, writeJson } from "@/lib/storage/local";

type PersistedNetwork = {
  network: NetworkId;
  overrides: Partial<Record<NetworkId, Partial<NetworkConfig>>>;
};

type NetworkStore = {
  network: NetworkId;
  overrides: Partial<Record<NetworkId, Partial<NetworkConfig>>>;
  hydrated: boolean;
  hydrate: () => void;
  setNetwork: (network: NetworkId) => void;
  setOverrides: (network: NetworkId, patch: Partial<NetworkConfig>) => void;
  getActiveConfig: () => NetworkConfig;
};

const STORAGE_KEY = "Mix-network";

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  network: DEFAULT_NETWORK,
  overrides: {},
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const persisted = readJson<PersistedNetwork>(STORAGE_KEY, { network: DEFAULT_NETWORK, overrides: {} });
    set({ network: persisted.network, overrides: persisted.overrides, hydrated: true });
  },
  setNetwork: (network) => {
    set({ network });
    writeJson(STORAGE_KEY, { network, overrides: get().overrides });
  },
  setOverrides: (network, patch) => {
    const overrides = { ...get().overrides, [network]: { ...get().overrides[network], ...patch } };
    set({ overrides });
    writeJson(STORAGE_KEY, { network: get().network, overrides });
  },
  getActiveConfig: () => {
    const network = get().network;
    return { ...NETWORKS[network], ...get().overrides[network] };
  },
}));
