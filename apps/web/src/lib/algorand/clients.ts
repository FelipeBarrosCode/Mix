import algosdk from "algosdk";
import { useNetworkStore } from "@/stores/network-store";

export async function withTimeout<T>(fn: Promise<T>, timeoutMs = 10_000): Promise<T> {
  return Promise.race([
    fn,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("RPC timeout")), timeoutMs)),
  ]);
}

export async function runWithAlgodFallback<T>(run: (client: algosdk.Algodv2) => Promise<T>) {
  const endpoints = useNetworkStore.getState().getActiveConfig().algodEndpoints;
  let lastError: unknown;
  for (const endpoint of endpoints) {
    try {
      return await withTimeout(run(new algosdk.Algodv2("", endpoint, "")));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("All algod endpoints failed");
}

export async function runWithIndexerFallback<T>(run: (client: algosdk.Indexer) => Promise<T>) {
  const endpoints = useNetworkStore.getState().getActiveConfig().indexerEndpoints;
  let lastError: unknown;
  for (const endpoint of endpoints) {
    try {
      return await withTimeout(run(new algosdk.Indexer("", endpoint, "")));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("All indexer endpoints failed");
}
