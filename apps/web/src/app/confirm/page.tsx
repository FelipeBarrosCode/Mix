"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { waitForConfirmation } from "@/lib/algorand/algod";
import { buildUsdcTransferTxn } from "@/lib/algorand/txns";
import { getAccount } from "@/lib/algorand/indexer";
import { signAndSend } from "@/lib/algorand/wallet";
import { decimalToBaseUnits } from "@/lib/utils/amount";
import { useToast } from "@/hooks/use-toast";
import { useSendStore } from "@/stores/send-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useHistoryStore } from "@/stores/history-store";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";
import { useFxQuote } from "@/hooks/use-fx-quote";
import { convertUsdcToFiat } from "@/lib/fx/quotes";
import { formatCurrency } from "@/lib/utils/format";
import { fiatFromRegion, usePreferencesStore } from "@/stores/preferences-store";
import { useI18n } from "@/hooks/use-i18n";

function short(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

export default function ConfirmPage() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const network = useActiveNetworkConfig();
  const draft = useSendStore((s) => s.draft);
  const clear = useSendStore((s) => s.clear);
  const sender = useWalletStore((s) => s.activeAddress);
  const { toast } = useToast();
  const pushHistory = useHistoryStore((s) => s.push);
  const [loading, setLoading] = useState(false);
  const region = usePreferencesStore((s) => s.region);
  const fiatCurrency = fiatFromRegion(region);
  const quote = useFxQuote();

  const amountBase = useMemo(() => decimalToBaseUnits(draft.amount || "0", 6), [draft.amount]);

  async function submit() {
    if (!sender) {
      toast({ title: t("wallet.notConnected"), variant: "danger" });
      return;
    }
    setLoading(true);
    try {
      const senderAccount = await getAccount(sender);
      const algoMicro = BigInt(senderAccount.account.amount ?? 0);
      if (algoMicro < 5_000n) {
        throw new Error(t("confirm.insufficientAlgoFees"));
      }
      const usdcHolding = (senderAccount.account.assets ?? []).find((a) => Number(a.assetId) === network.usdcAssetId)?.amount ?? 0;
      if (BigInt(usdcHolding) < amountBase) {
        throw new Error(t("confirm.insufficientUsdc"));
      }

      const txn = await buildUsdcTransferTxn({
        from: sender,
        to: draft.resolvedAddress,
        amount: amountBase,
        note: draft.note,
      });
      const txid = await signAndSend([{ txn }]);

      await waitForConfirmation(txid, 8);
      pushHistory({
        txid,
        type: "send",
        amount: draft.amount,
        to: draft.resolvedAddress,
        createdAt: new Date().toISOString(),
      });
      clear();
      router.push(`/receipt/${txid}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("confirm.unableToSubmit");
      const description = /cancelled|rejected|declined/i.test(message)
        ? t("confirm.signatureRejected")
        : message;
      toast({ title: t("confirm.paymentFailed"), description, variant: "danger" });
    } finally {
      setLoading(false);
    }
  }

  if (!draft.resolvedAddress) {
    return (
      <AppShell>
        <Card>
          <p className="text-sm text-muted">{t("confirm.noDraft")}</p>
          <Button className="mt-4 w-full" onClick={() => router.push("/send")}>{t("confirm.goToSend")}</Button>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Card className="space-y-3">
        <h1 className="text-xl font-bold">{t("confirm.title")}</h1>
        <div className="space-y-2 text-sm">
          <p>{t("confirm.enteredRecipient")}: {draft.rawRecipient}</p>
          <p>{t("confirm.resolvedAddress")}: {short(draft.resolvedAddress)}</p>
          <details>
            <summary className="cursor-pointer text-xs text-muted">{t("confirm.showFullAddress")}</summary>
            <p className="mt-2 break-all text-xs">{draft.resolvedAddress}</p>
          </details>
          <p>{t("confirm.amount")}: {draft.amount} USDC</p>
          <p>
            {t("confirm.fiatEquivalent")}: {(() => {
              const value = convertUsdcToFiat(draft.amount || "0", quote.data);
              return value === null ? "--" : formatCurrency(value, fiatCurrency, locale);
            })()}
          </p>
          <p>{t("confirm.asset")}: USDC (ASA {network.usdcAssetId})</p>
          <p>{t("confirm.estimatedFee")}: 0.001 ALGO</p>
          {draft.note ? <p>{t("confirm.reference")}: {draft.note}</p> : null}
          <div className="pt-1">
            <Badge>{network.label}</Badge>
          </div>
        </div>
        <p className="text-xs text-muted">
          {t("confirm.disclaimer")}
        </p>
        <Button className="w-full" onClick={submit} disabled={loading}>
          {loading ? t("confirm.waitingSignature") : t("confirm.signWithPera")}
        </Button>
      </Card>
    </AppShell>
  );
}
