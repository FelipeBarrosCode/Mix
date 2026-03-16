type StartMessage = {
  type: "start";
  payload: {
    indexerEndpoints: string[];
    receiver: string;
    assetId: number;
    expectedNote: string;
    startedAt: number;
    pollMs: number;
    timeoutMs: number;
  };
};

type StopMessage = {
  type: "stop";
};

type IncomingTransaction = {
  txid: string;
  sender: string;
  amountBase: string;
  receivedAt: string;
  confirmedRound: number;
};

type SearchTransaction = {
  id?: string;
  sender?: string;
  note?: string;
  "round-time"?: number;
  "confirmed-round"?: number;
  "asset-transfer-transaction"?: {
    amount?: number;
    receiver?: string;
  };
};

let intervalId: ReturnType<typeof setInterval> | null = null;
let timeoutId: ReturnType<typeof setTimeout> | null = null;
let running = false;

function clearTimers() {
  if (intervalId) clearInterval(intervalId);
  if (timeoutId) clearTimeout(timeoutId);
  intervalId = null;
  timeoutId = null;
}

function stopWatcher() {
  running = false;
  clearTimers();
}

function decodeBase64Utf8(value?: string) {
  if (!value) return "";
  try {
    const binary = atob(value);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return "";
  }
}

async function fetchLatestTransactions(input: StartMessage["payload"]) {
  let lastError: Error | null = null;

  for (const endpoint of input.indexerEndpoints) {
    try {
      const url = new URL("/v2/transactions", endpoint);
      url.searchParams.set("address", input.receiver);
      url.searchParams.set("address-role", "receiver");
      url.searchParams.set("tx-type", "axfer");
      url.searchParams.set("asset-id", String(input.assetId));
      url.searchParams.set("limit", "10");
      const res = await fetch(url.toString(), {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Indexer request failed with ${res.status}`);
      }
      const data = (await res.json()) as { transactions?: SearchTransaction[] };
      return data.transactions ?? [];
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Indexer request failed");
    }
  }

  throw lastError ?? new Error("No indexer endpoint available");
}

function toIso(roundTime?: number) {
  return roundTime ? new Date(roundTime * 1000).toISOString() : new Date().toISOString();
}

async function pollOnce(input: StartMessage["payload"]) {
  if (!running) return;
  try {
    const transactions = await fetchLatestTransactions(input);
    const match = transactions.find((tx) => {
      const note = decodeBase64Utf8(tx.note);
      const amount = tx["asset-transfer-transaction"]?.amount;
      const receiver = tx["asset-transfer-transaction"]?.receiver;
      const receivedAtMs = (tx["round-time"] ?? 0) * 1000;
      return Boolean(tx.id)
        && receiver === input.receiver
        && typeof amount === "number"
        && amount > 0
        && note === input.expectedNote
        && receivedAtMs >= input.startedAt - 5_000;
    });

    if (match?.id && match.sender) {
      const payload: IncomingTransaction = {
        txid: match.id,
        sender: match.sender,
        amountBase: String(match["asset-transfer-transaction"]?.amount ?? 0),
        receivedAt: toIso(match["round-time"]),
        confirmedRound: match["confirmed-round"] ?? 0,
      };
      (self as DedicatedWorkerGlobalScope).postMessage({ type: "payment_detected", payload });
      stopWatcher();
      return;
    }

    (self as DedicatedWorkerGlobalScope).postMessage({ type: "poll_ok" });
  } catch (error) {
    (self as DedicatedWorkerGlobalScope).postMessage({
      type: "poll_error",
      payload: error instanceof Error ? error.message : "Payment watch failed",
    });
    stopWatcher();
  }
}

self.onmessage = (event: MessageEvent<StartMessage | StopMessage>) => {
  if (event.data.type === "stop") {
    stopWatcher();
    return;
  }

  stopWatcher();
  running = true;
  const input = event.data.payload;
  (self as DedicatedWorkerGlobalScope).postMessage({ type: "started", payload: { startedAt: input.startedAt } });
  void pollOnce(input);
  intervalId = setInterval(() => {
    void pollOnce(input);
  }, input.pollMs);
  timeoutId = setTimeout(() => {
    if (!running) return;
    (self as DedicatedWorkerGlobalScope).postMessage({ type: "timeout" });
    stopWatcher();
  }, input.timeoutMs);
};

export {};
