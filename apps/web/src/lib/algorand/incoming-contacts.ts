import { searchReceiverAssetTransactions } from "@/lib/algorand/indexer";

type RawTxn = {
  id?: string;
  "round-time"?: number;
  sender?: string;
};

export type IncomingSender = {
  address: string;
  lastReceivedAt: string;
  txCount: number;
};

function toIsoFromRoundTime(value?: number) {
  if (!value) return new Date(0).toISOString();
  return new Date(value * 1000).toISOString();
}

function maxIso(a: string, b: string) {
  return new Date(a).getTime() > new Date(b).getTime() ? a : b;
}

export async function discoverIncomingUsdcSenders(input: {
  receiver: string;
  usdcAssetId: number;
  limitPages?: number;
}) {
  const map = new Map<string, { lastReceivedAt: string; txCount: number }>();
  let nextToken: string | undefined;
  const pages = input.limitPages ?? 4;

  for (let page = 0; page < pages; page += 1) {
    const res = (await searchReceiverAssetTransactions({
      receiver: input.receiver,
      assetId: input.usdcAssetId,
      limit: 100,
      nextToken,
    })) as {
      transactions?: RawTxn[];
      "next-token"?: string;
      nextToken?: string;
    };

    const txns = res.transactions ?? [];
    for (const tx of txns) {
      const sender = tx.sender;
      if (!sender || sender === input.receiver) continue;
      const receivedAt = toIsoFromRoundTime(tx["round-time"]);
      const current = map.get(sender);
      if (!current) {
        map.set(sender, { lastReceivedAt: receivedAt, txCount: 1 });
      } else {
        map.set(sender, {
          lastReceivedAt: maxIso(current.lastReceivedAt, receivedAt),
          txCount: current.txCount + 1,
        });
      }
    }

    nextToken = res["next-token"] ?? res.nextToken;
    if (!nextToken) break;
  }

  const rows: IncomingSender[] = [];
  for (const [address, stats] of map.entries()) {
    rows.push({ address, lastReceivedAt: stats.lastReceivedAt, txCount: stats.txCount });
  }

  rows.sort((a, b) => {
    const time = new Date(b.lastReceivedAt).getTime() - new Date(a.lastReceivedAt).getTime();
    if (time !== 0) return time;
    return b.txCount - a.txCount;
  });

  return rows;
}
