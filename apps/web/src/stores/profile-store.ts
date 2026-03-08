import { create } from "zustand";
import { readJson, writeJson } from "@/lib/storage/local";

type ProfileState = {
  hydrated: boolean;
  hasSeenIntro: boolean;
  algoName?: string;
  algoVerifiedAddress?: string;
  hydrate: () => void;
  setSeenIntro: (value: boolean) => void;
  setAlgoVerified: (algoName: string, address: string) => void;
  clearAlgoVerified: () => void;
};

const STORAGE_KEY = "mix-profile";

export const useProfileStore = create<ProfileState>((set, get) => ({
  hydrated: false,
  hasSeenIntro: false,
  algoName: undefined,
  algoVerifiedAddress: undefined,
  hydrate: () => {
    if (get().hydrated) return;
    const persisted = readJson<{
      hasSeenIntro?: boolean;
      algoName?: string;
      algoVerifiedAddress?: string;
    }>(STORAGE_KEY, {});
    set({
      hydrated: true,
      hasSeenIntro: Boolean(persisted.hasSeenIntro),
      algoName: persisted.algoName,
      algoVerifiedAddress: persisted.algoVerifiedAddress,
    });
  },
  setSeenIntro: (value) => {
    const next = {
      hasSeenIntro: value,
      algoName: get().algoName,
      algoVerifiedAddress: get().algoVerifiedAddress,
    };
    set({ hasSeenIntro: value });
    writeJson(STORAGE_KEY, next);
  },
  setAlgoVerified: (algoName, address) => {
    const next = {
      hasSeenIntro: get().hasSeenIntro,
      algoName,
      algoVerifiedAddress: address,
    };
    set({ algoName, algoVerifiedAddress: address });
    writeJson(STORAGE_KEY, next);
  },
  clearAlgoVerified: () => {
    const next = { hasSeenIntro: get().hasSeenIntro };
    set({ algoName: undefined, algoVerifiedAddress: undefined });
    writeJson(STORAGE_KEY, next);
  },
}));
