import { create } from "zustand";
import { readJson, writeJson } from "@/lib/storage/local";

export type Contact = {
  id: string;
  label: string;
  address: string;
  algoName?: string;
  notes?: string;
  lastUsedAt?: string;
};

type ContactsStore = {
  contacts: Contact[];
  add: (contact: Omit<Contact, "id">) => void;
  remove: (id: string) => void;
};

const STORAGE_KEY = "Mix-contacts";
const MAX_CONTACTS_AGE_MS = 1000 * 60 * 60 * 24 * 90;
const initial = readJson<Contact[]>(STORAGE_KEY, [], { maxAgeMs: MAX_CONTACTS_AGE_MS });

export const useContactsStore = create<ContactsStore>((set, get) => ({
  contacts: initial,
  add: (contact) => {
    const contacts = [...get().contacts, { ...contact, id: crypto.randomUUID() }];
    set({ contacts });
    writeJson(STORAGE_KEY, contacts, { maxAgeMs: MAX_CONTACTS_AGE_MS });
  },
  remove: (id) => {
    const contacts = get().contacts.filter((c) => c.id !== id);
    set({ contacts });
    writeJson(STORAGE_KEY, contacts, { maxAgeMs: MAX_CONTACTS_AGE_MS });
  },
}));
