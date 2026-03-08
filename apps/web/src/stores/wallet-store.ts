import { create } from "zustand";
import { connectWallet, disconnectWallet, reconnectWallet } from "@/lib/algorand/wallet";

type WalletStore = {
  accounts: string[];
  connected: boolean;
  activeAddress?: string;
  loading: boolean;
  connect: () => Promise<void>;
  reconnect: () => Promise<void>;
  disconnect: () => Promise<void>;
};

export const useWalletStore = create<WalletStore>((set) => ({
  accounts: [],
  connected: false,
  activeAddress: undefined,
  loading: false,
  connect: async () => {
    set({ loading: true });
    const accounts = await connectWallet();
    set({ accounts, connected: accounts.length > 0, activeAddress: accounts[0], loading: false });
  },
  reconnect: async () => {
    set({ loading: true });
    try {
      const accounts = await reconnectWallet();
      set({ accounts, connected: accounts.length > 0, activeAddress: accounts[0], loading: false });
    } catch {
      set({ accounts: [], connected: false, activeAddress: undefined, loading: false });
    }
  },
  disconnect: async () => {
    await disconnectWallet();
    set({ accounts: [], connected: false, activeAddress: undefined });
  },
}));
