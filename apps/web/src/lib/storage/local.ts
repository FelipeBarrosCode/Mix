type LocalStorageOptions = {
  maxAgeMs?: number;
};

type StoredEnvelope<T> = {
  value: T;
  storedAt: number;
};

function isEnvelope<T>(value: unknown): value is StoredEnvelope<T> {
  return Boolean(value)
    && typeof value === "object"
    && "value" in (value as Record<string, unknown>)
    && typeof (value as Record<string, unknown>).storedAt === "number";
}

export function readJson<T>(key: string, fallback: T, options: LocalStorageOptions = {}): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T | StoredEnvelope<T>;
    if (isEnvelope<T>(parsed)) {
      if (options.maxAgeMs && Date.now() - parsed.storedAt > options.maxAgeMs) {
        localStorage.removeItem(key);
        return fallback;
      }
      return parsed.value;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T, _options: LocalStorageOptions = {}) {
  if (typeof window === "undefined") return;
  const payload: StoredEnvelope<T> = { value, storedAt: Date.now() };
  localStorage.setItem(key, JSON.stringify(payload));
}
