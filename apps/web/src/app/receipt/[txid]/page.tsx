"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { resolveExplorerTxUrl } from "@/lib/algorand/network";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";
import { useHistoryStore } from "@/stores/history-store";
import { useFxQuote } from "@/hooks/use-fx-quote";
import { convertUsdcToFiat } from "@/lib/fx/quotes";
import { formatCurrency } from "@/lib/utils/format";
import { fiatFromRegion, usePreferencesStore } from "@/stores/preferences-store";
import { useI18n } from "@/hooks/use-i18n";

export default function ReceiptPage() {
  const { locale, t } = useI18n();
  const { txid } = useParams<{ txid: string }>();
  const network = useActiveNetworkConfig();
  const explorerUrl = resolveExplorerTxUrl(network, txid);
  const history = useHistoryStore((s) => s.items);
  const item = history.find((x) => x.txid === txid);
  const region = usePreferencesStore((s) => s.region);
  const fiatCurrency = fiatFromRegion(region);
  const quote = useFxQuote();

  return (
    <AppShell>
      <Card className="space-y-3">
        <h1 className="text-xl font-bold">{t("receipt.title")}</h1>
        <p className="text-sm text-muted">{t("receipt.submitted")}</p>
        {item?.amount ? (
          <p className="text-sm font-semibold">
            {(() => {
              const value = convertUsdcToFiat(item.amount, quote.data);
              return value === null ? `${item.amount} USDCa` : `${formatCurrency(value, fiatCurrency, locale)} (${item.amount} USDCa)`;
            })()}
          </p>
        ) : null}
        <p className="break-all rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-900">{txid}</p>
        <a className="text-sm text-accent underline" href={explorerUrl} target="_blank" rel="noreferrer">
          {t("receipt.openExplorer")} {t(network.id === "mainnet" ? "settings.mainnet" : "settings.testnet")}
        </a>
        <Link href="/home">
          <Button className="w-full">{t("receipt.backHome")}</Button>
        </Link>
      </Card>
    </AppShell>
  );
}
