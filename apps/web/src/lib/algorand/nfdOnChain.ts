import algosdk from "algosdk";
import { runWithAlgodFallback } from "@/lib/algorand/clients";
import { useNetworkStore } from "@/stores/network-store";
import { isAlgoName, isValidAlgorandAddress } from "@/lib/validation/address";
import { readJson, writeJson } from "@/lib/storage/local";

type CacheValue = { address: string; expiresAt: number };
const STORAGE_KEY = "Mix-nfd-cache-v1";
const REVERSE_STORAGE_KEY = "Mix-nfd-reverse-cache-v1";
const TTL_MS = 1000 * 60 * 30;

function normalize(name: string) {
  return name.trim().toLowerCase();
}

function decodeBoxValue(value: Uint8Array): string | null {
  const utf8 = new TextDecoder().decode(value);
  if (isValidAlgorandAddress(utf8)) return utf8;
  try {
    const msgPack = algosdk.decodeObj(value) as unknown;
    if (Array.isArray(msgPack)) {
      for (const item of msgPack) {
        if (typeof item === "string" && isValidAlgorandAddress(item)) return item;
      }
    }
    if (typeof msgPack === "object" && msgPack) {
      const flat = JSON.stringify(msgPack);
      const found = flat.match(/[A-Z2-7]{58}/)?.[0];
      return found && isValidAlgorandAddress(found) ? found : null;
    }
  } catch {
    return null;
  }
  return null;
}

function decodeAlgoNameFromValue(value: Uint8Array): string | null {
  const utf8 = new TextDecoder().decode(value);
  const direct = utf8.match(/[a-z0-9-]{1,27}\.algo/i)?.[0]?.toLowerCase();
  if (direct) return direct;

  try {
    const msgPack = algosdk.decodeObj(value) as unknown;
    const blob = JSON.stringify(msgPack);
    const nested = blob.match(/[a-z0-9-]{1,27}\.algo/i)?.[0]?.toLowerCase();
    return nested ?? null;
  } catch {
    return null;
  }
}

export async function resolveAlgoName(input: string): Promise<{ name: string; address: string }> {
  const name = normalize(input);
  if (!isAlgoName(name)) throw new Error("Invalid .algo format");

  const cache = readJson<Record<string, CacheValue>>(STORAGE_KEY, {});
  if (cache[name] && cache[name].expiresAt > Date.now()) {
    return { name, address: cache[name].address };
  }

  const appId = useNetworkStore.getState().getActiveConfig().nfdRegistryAppId;
  const boxName = new TextEncoder().encode(name);
  const result = await runWithAlgodFallback((client) => client.getApplicationBoxByName(appId, boxName).do());
  const address = decodeBoxValue(result.value);
  if (!address) throw new Error("Unable to resolve .algo on-chain");

  cache[name] = { address, expiresAt: Date.now() + TTL_MS };
  writeJson(STORAGE_KEY, cache);

  const reverseCache = readJson<Record<string, { name: string; expiresAt: number }>>(REVERSE_STORAGE_KEY, {});
  reverseCache[address] = { name, expiresAt: Date.now() + TTL_MS };
  writeJson(REVERSE_STORAGE_KEY, reverseCache);

  return { name, address };
}

export async function reverseLookupAlgoName(address: string): Promise<string | null> {
  if (!isValidAlgorandAddress(address)) return null;

  const reverseCache = readJson<Record<string, { name: string; expiresAt: number }>>(REVERSE_STORAGE_KEY, {});
  const cached = reverseCache[address];
  if (cached && cached.expiresAt > Date.now()) {
    return cached.name;
  }

  const appId = useNetworkStore.getState().getActiveConfig().nfdRegistryAppId;
  const candidates: Uint8Array[] = [
    new TextEncoder().encode(`addr/${address}`),
    new TextEncoder().encode(`address/${address}`),
    new TextEncoder().encode(`reverse/${address}`),
    new TextEncoder().encode(address),
  ];

  for (const boxName of candidates) {
    try {
      const result = await runWithAlgodFallback((client) => client.getApplicationBoxByName(appId, boxName).do());
      const name = decodeAlgoNameFromValue(result.value);
      if (name) {
        reverseCache[address] = { name, expiresAt: Date.now() + TTL_MS };
        writeJson(REVERSE_STORAGE_KEY, reverseCache);
        return name;
      }
    } catch {
      continue;
    }
  }

  return null;
}
