import { NetworkId } from "@/lib/algorand/network";
import { PaymentSource } from "@/lib/validation/payment";
import { create } from "zustand";

export type SendDraft = {
  rawRecipient: string;
  resolvedAddress: string;
  amount: string;
  assetId: number;
  networkId: NetworkId | "";
  source: PaymentSource;
  validated: boolean;
  note?: string;
};

type SendStore = {
  draft: SendDraft;
  setDraft: (patch: Partial<SendDraft>) => void;
  clear: () => void;
};

const initial: SendDraft = {
  rawRecipient: "",
  resolvedAddress: "",
  amount: "",
  assetId: 0,
  networkId: "",
  source: "manual",
  validated: false,
  note: "",
};

export const useSendStore = create<SendStore>((set) => ({
  draft: initial,
  setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  clear: () => set({ draft: initial }),
}));
