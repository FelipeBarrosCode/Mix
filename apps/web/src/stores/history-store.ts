import { create } from "zustand";
import { readJson, writeJson } from "@/lib/storage/local";

export type HistoryItem = {
  txid: string;
  type: "send" | "pay_invoice" | "create_invoice";
  amount?: string;
  to?: string;
  createdAt: string;
};

type HistoryStore = {
  items: HistoryItem[];
  push: (item: HistoryItem) => void;
};

const STORAGE_KEY = "Mix-history";
const MAX_HISTORY_AGE_MS = 1000 * 60 * 60 * 24 * 30;
const initial = readJson<HistoryItem[]>(STORAGE_KEY, [], { maxAgeMs: MAX_HISTORY_AGE_MS });

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  items: initial,
  push: (item) => {
    const items = [item, ...get().items].slice(0, 50);
    set({ items });
    writeJson(STORAGE_KEY, items, { maxAgeMs: MAX_HISTORY_AGE_MS });
  },
}));
