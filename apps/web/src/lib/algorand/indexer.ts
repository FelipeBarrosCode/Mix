import { runWithIndexerFallback } from "@/lib/algorand/clients";

export async function getAccount(address: string) {
  return runWithIndexerFallback((client) => client.lookupAccountByID(address).do());
}

export async function getAsset(assetId: number) {
  return runWithIndexerFallback((client) => client.lookupAssetByID(assetId).do());
}

export async function lookupAsset(address: string, assetId: number) {
  return runWithIndexerFallback((client) => client.lookupAccountAssets(address).assetId(assetId).do());
}

export async function getTransaction(txid: string) {
  return runWithIndexerFallback((client) => client.lookupTransactionByID(txid).do());
}

export type SenderTxSearchParams = {
  sender: string;
  limit?: number;
  nextToken?: string;
};

export type ReceiverAssetTxSearchParams = {
  receiver: string;
  assetId: number;
  limit?: number;
  nextToken?: string;
};

export async function searchSenderTransactions(params: SenderTxSearchParams) {
  return runWithIndexerFallback((client) => {
    let req = client
      .searchForTransactions()
      .address(params.sender)
      .addressRole("sender")
      .limit(params.limit ?? 100);

    if (params.nextToken) req = req.nextToken(params.nextToken);
    return req.do();
  });
}

export async function searchReceiverAssetTransactions(params: ReceiverAssetTxSearchParams) {
  return runWithIndexerFallback((client) => {
    let req = client
      .searchForTransactions()
      .txType("axfer")
      .assetID(params.assetId)
      .address(params.receiver)
      .addressRole("receiver")
      .limit(params.limit ?? 100);

    if (params.nextToken) req = req.nextToken(params.nextToken);
    return req.do();
  });
}
