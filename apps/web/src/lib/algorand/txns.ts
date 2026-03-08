import algosdk from "algosdk";
import { getSuggestedParams } from "@/lib/algorand/algod";
import { useNetworkStore } from "@/stores/network-store";

export async function buildUsdcTransferTxn(input: {
  from: string;
  to: string;
  amount: bigint;
  note?: string;
}) {
  const { usdcAssetId } = useNetworkStore.getState().getActiveConfig();
  const sp = await getSuggestedParams();
  return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: input.from,
    receiver: input.to,
    amount: Number(input.amount),
    assetIndex: usdcAssetId,
    note: input.note ? new TextEncoder().encode(input.note) : undefined,
    suggestedParams: sp,
  });
}

export async function buildAssetOptInTxn(input: { address: string; assetId: number }) {
  const sp = await getSuggestedParams();
  return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    sender: input.address,
    receiver: input.address,
    amount: 0,
    assetIndex: input.assetId,
    suggestedParams: sp,
  });
}
