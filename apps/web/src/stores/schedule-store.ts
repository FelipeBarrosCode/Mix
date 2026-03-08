import { create } from "zustand";
import { readJson, writeJson } from "@/lib/storage/local";

export type ScheduledDraft = {
  id: string;
  to: string;
  amount: string;
  remindAt: string;
  note?: string;
};

type ScheduleStore = {
  drafts: ScheduledDraft[];
  addDraft: (draft: Omit<ScheduledDraft, "id">) => void;
  removeDraft: (id: string) => void;
};

const STORAGE_KEY = "Mix-scheduled";
const initial = readJson<ScheduledDraft[]>(STORAGE_KEY, []);

export const useScheduleStore = create<ScheduleStore>((set, get) => ({
  drafts: initial,
  addDraft: (draft) => {
    const drafts = [...get().drafts, { ...draft, id: crypto.randomUUID() }];
    set({ drafts });
    writeJson(STORAGE_KEY, drafts);
  },
  removeDraft: (id) => {
    const drafts = get().drafts.filter((x) => x.id !== id);
    set({ drafts });
    writeJson(STORAGE_KEY, drafts);
  },
}));
