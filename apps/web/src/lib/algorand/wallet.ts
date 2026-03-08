import { PeraWalletConnect } from "@perawallet/connect";
import algosdk from "algosdk";
import { submitSignedTransactions } from "@/lib/algorand/algod";

let peraClient: PeraWalletConnect | null = null;

function getPeraClient() {
  if (typeof window === "undefined") {
    throw new Error("Wallet integration is only available in browser");
  }
  if (!peraClient) {
    peraClient = new PeraWalletConnect({ shouldShowSignTxnToast: false });
  }
  return peraClient;
}

export type SignableTxn = {
  txn: algosdk.Transaction;
  signers?: string[];
};

export async function connectWallet() {
  const pera = getPeraClient();
  const accounts = await pera.connect();
  return accounts;
}

export async function reconnectWallet() {
  const pera = getPeraClient();
  const accounts = await pera.reconnectSession();
  return accounts ?? [];
}

export async function disconnectWallet() {
  const pera = getPeraClient();
  await pera.disconnect();
}

export async function signTransactions(txns: SignableTxn[]) {
  const pera = getPeraClient();
  const grouped = txns.map(({ txn, signers }) => ({ txn, signers }));
  const signed = await pera.signTransaction([grouped]);
  return signed as Uint8Array[];
}

export async function signAndSend(txns: SignableTxn[]) {
  const signed = await signTransactions(txns);
  const { txid } = await submitSignedTransactions(signed);
  return txid;
}
