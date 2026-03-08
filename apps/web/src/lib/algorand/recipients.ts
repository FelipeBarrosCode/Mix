import { reverseLookupAlgoName } from "@/lib/algorand/nfdOnChain";
import { searchSenderTransactions } from "@/lib/algorand/indexer";

export type DiscoveredRecipient = {
  address: string;
  algoName: string | null;
  lastSentAt: string;
  txCount: number;
};

type RawTxn = {
  "round-time"?: number;
  "payment-transaction"?: { receiver?: string };
  "asset-transfer-transaction"?: { receiver?: string; "asset-id"?: number };
};

function toIsoFromRoundTime(value?: number) {
  if (!value) return new Date(0).toISOString();
  return new Date(value * 1000).toISOString();
}

function maxIso(a: string, b: string) {
  return new Date(a).getTime() > new Date(b).getTime() ? a : b;
}

export async function discoverRecipientsFromHistory(input: {
  sender: string;
  usdcAssetId?: number;
  limitPages?: number;
  reverseLookup?: boolean;
}) {
  const map = new Map<string, { lastSentAt: string; txCount: number }>();
  let nextToken: string | undefined;
  const pages = input.limitPages ?? 5;

  for (let page = 0; page < pages; page += 1) {
    const res = (await searchSenderTransactions({
      sender: input.sender,
      limit: 100,
      nextToken,
    })) as {
      transactions?: RawTxn[];
      "next-token"?: string;
      nextToken?: string;
    };

    const txns = res.transactions ?? [];

    for (const tx of txns) {
      const sentAt = toIsoFromRoundTime(tx["round-time"]);
      const paymentReceiver = tx["payment-transaction"]?.receiver;
      const assetTx = tx["asset-transfer-transaction"];
      const assetReceiver = assetTx?.receiver;
      const isUsdcAsset = typeof input.usdcAssetId === "number" ? assetTx?.["asset-id"] === input.usdcAssetId : true;

      const recipients = [paymentReceiver, isUsdcAsset ? assetReceiver : undefined].filter(Boolean) as string[];

      for (const receiver of recipients) {
        const current = map.get(receiver);
        if (!current) {
          map.set(receiver, { lastSentAt: sentAt, txCount: 1 });
        } else {
          map.set(receiver, {
            lastSentAt: maxIso(current.lastSentAt, sentAt),
            txCount: current.txCount + 1,
          });
        }
      }
    }

    nextToken = res["next-token"] ?? res.nextToken;
    if (!nextToken) break;
  }

  const recipients: DiscoveredRecipient[] = [];
  for (const [address, stats] of map.entries()) {
    recipients.push({
      address,
      algoName: input.reverseLookup ? await reverseLookupAlgoName(address) : null,
      lastSentAt: stats.lastSentAt,
      txCount: stats.txCount,
    });
  }

  recipients.sort((a, b) => {
    const time = new Date(b.lastSentAt).getTime() - new Date(a.lastSentAt).getTime();
    if (time !== 0) return time;
    return b.txCount - a.txCount;
  });

  return recipients;
}
