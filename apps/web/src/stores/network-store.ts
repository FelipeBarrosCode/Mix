import { create } from "zustand";
import { DEFAULT_NETWORK, NETWORKS, NetworkConfig, NetworkId } from "@/lib/algorand/network";
import { readJson, writeJson } from "@/lib/storage/local";

type PersistedNetwork = {
  overrides: Partial<Record<NetworkId, Partial<NetworkConfig>>>;
};

type NetworkStore = {
  network: NetworkId;
  overrides: Partial<Record<NetworkId, Partial<NetworkConfig>>>;
  hydrated: boolean;
  hydrate: () => void;
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
    const persisted = readJson<PersistedNetwork>(STORAGE_KEY, { overrides: {} });
    set({ network: DEFAULT_NETWORK, overrides: persisted.overrides, hydrated: true });
  },
  setOverrides: (network, patch) => {
    const overrides = { ...get().overrides, [network]: { ...get().overrides[network], ...patch } };
    set({ overrides });
    writeJson(STORAGE_KEY, { overrides });
  },
  getActiveConfig: () => {
    const network = get().network;
    return { ...NETWORKS[network], ...get().overrides[network] };
  },
}));
