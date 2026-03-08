export type PossibleContact = {
  address: string;
  label: string;
  lastReceivedAt: string;
  txCount: number;
  updatedAt: string;
};

const DB_NAME = "mix-local-db";
const DB_VERSION = 1;
const STORE_NAME = "possible-contacts";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "address" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("Unable to open indexedDB"));
  });
}

async function getByAddress(address: string): Promise<PossibleContact | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(address);
    req.onsuccess = () => resolve(req.result as PossibleContact | undefined);
    req.onerror = () => reject(req.error ?? new Error("Unable to read possible contact"));
  });
}

export async function listPossibleContacts(): Promise<PossibleContact[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => {
      const rows = (req.result as PossibleContact[])
        .slice()
        .sort((a, b) => new Date(b.lastReceivedAt).getTime() - new Date(a.lastReceivedAt).getTime());
      resolve(rows);
    };
    req.onerror = () => reject(req.error ?? new Error("Unable to list possible contacts"));
  });
}

export async function upsertPossibleContact(input: {
  address: string;
  lastReceivedAt: string;
  txCount: number;
}) {
  const current = await getByAddress(input.address);
  const now = new Date().toISOString();

  const next: PossibleContact = {
    address: input.address,
    label: current?.label ?? "",
    lastReceivedAt:
      current && new Date(current.lastReceivedAt).getTime() > new Date(input.lastReceivedAt).getTime()
        ? current.lastReceivedAt
        : input.lastReceivedAt,
    txCount: Math.max(current?.txCount ?? 0, input.txCount),
    updatedAt: now,
  };

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(next);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("Unable to save possible contact"));
  });
}

export async function setPossibleContactLabel(address: string, label: string) {
  const current = await getByAddress(address);
  if (!current) return;

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put({
      ...current,
      label: label.trim(),
      updatedAt: new Date().toISOString(),
    } satisfies PossibleContact);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error("Unable to update possible contact label"));
  });
}
