import { create } from "zustand";

export type SendDraft = {
  rawRecipient: string;
  resolvedAddress: string;
  amount: string;
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
  note: "",
};

export const useSendStore = create<SendStore>((set) => ({
  draft: initial,
  setDraft: (patch) => set((s) => ({ draft: { ...s.draft, ...patch } })),
  clear: () => set({ draft: initial }),
}));
