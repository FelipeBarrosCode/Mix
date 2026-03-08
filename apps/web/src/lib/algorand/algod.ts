import algosdk from "algosdk";
import { runWithAlgodFallback } from "@/lib/algorand/clients";

export async function getSuggestedParams() {
  return runWithAlgodFallback((client) => client.getTransactionParams().do());
}

export async function waitForConfirmation(txId: string, rounds = 6) {
  return runWithAlgodFallback((client) => algosdk.waitForConfirmation(client, txId, rounds));
}

export async function submitSignedTransactions(signed: Uint8Array[]) {
  return runWithAlgodFallback((client) => client.sendRawTransaction(signed).do());
}
