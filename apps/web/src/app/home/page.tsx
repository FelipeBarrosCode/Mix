"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowDownToLine, ArrowLeftRight, ArrowUpToLine, LineChart } from "lucide-react";
import { useWalletStore } from "@/stores/wallet-store";
import { useAccountSummary } from "@/hooks/use-account-summary";
import { baseUnitsToDecimal } from "@/lib/utils/amount";
import { useScheduleStore } from "@/stores/schedule-store";
import { useHistoryStore } from "@/stores/history-store";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";
import { useFxQuote } from "@/hooks/use-fx-quote";
import { convertUsdcToFiat } from "@/lib/fx/quotes";
import { formatCurrency, formatDateTimeIso } from "@/lib/utils/format";
import { fiatFromRegion, usePreferencesStore } from "@/stores/preferences-store";
import { useI18n } from "@/hooks/use-i18n";
import { qrToDataUrl } from "@/features/qr/generate";

function short(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}

export default function HomePage() {
  const { t, locale } = useI18n();
  const connected = useWalletStore((s) => s.connected);
  const activeAddress = useWalletStore((s) => s.activeAddress);
  const connect = useWalletStore((s) => s.connect);
  const disconnect = useWalletStore((s) => s.disconnect);
  const summary = useAccountSummary(activeAddress);
  const network = useActiveNetworkConfig();
  const drafts = useScheduleStore((s) => s.drafts);
  const history = useHistoryStore((s) => s.items);
  const region = usePreferencesStore((s) => s.region);
  const fiatCurrency = fiatFromRegion(region);
  const quote = useFxQuote();
  const [fixedQr, setFixedQr] = useState("");

  const usdcAmount = baseUnitsToDecimal(summary.data?.usdcMicro ?? 0n, 6);
  const fiatBalance = convertUsdcToFiat(usdcAmount, quote.data);
  const receiveAnyAmountLink = useMemo(() => {
    if (!activeAddress) return "";
    const params = new URLSearchParams({ asset: String(network.usdcAssetId), amount: "0" });
    return `perawallet://${activeAddress}?${params.toString()}`;
  }, [activeAddress, network.usdcAssetId]);

  useEffect(() => {
    if (!receiveAnyAmountLink) {
      setFixedQr("");
      return;
    }
    qrToDataUrl(receiveAnyAmountLink)
      .then(setFixedQr)
      .catch(() => setFixedQr(""));
  }, [receiveAnyAmountLink]);

  function buildIcs(dateIso: string, title: string, description: string) {
    const dt = new Date(dateIso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${dt}\nSUMMARY:${title}\nDESCRIPTION:${description}\nEND:VEVENT\nEND:VCALENDAR`;
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="space-y-3 lg:grid lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold">Mix</h1>
          </div>
          <p className="text-sm text-muted">
            {t("home.subtitle")}
          </p>
          {connected ? (
            <div className="space-y-2">
              <p className="text-sm">{t("home.connected")}: {short(activeAddress)}</p>
              <Button variant="secondary" className="w-full" onClick={() => disconnect()}>
                {t("wallet.disconnect")}
              </Button>
            </div>
          ) : (
            <Button className="w-full" onClick={() => connect()}>
              {t("wallet.connect")}
            </Button>
          )}
        </Card>

        <Card className="space-y-2">
          <p className="text-xs text-muted">{t("home.balance")}</p>
          <p className="text-3xl font-bold lg:text-4xl">
            {fiatBalance === null ? "--" : formatCurrency(fiatBalance, fiatCurrency, locale)}
          </p>
          <p className="text-xs text-muted">
            {t("home.usdcBalance")}: {usdcAmount} USDC
          </p>
          <p className="text-xs text-muted">
            {t("home.rateUpdated")}: {quote.data ? formatDateTimeIso(quote.data.updatedAt, locale) : "--"}
          </p>
          <p className="text-sm text-muted">{t("home.feeBalance")}: {baseUnitsToDecimal(summary.data?.algoMicro ?? 0n, 6)} ALGO</p>
        </Card>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <Link href="/send"><Button className="w-full">{t("nav.send")}</Button></Link>
          <Link href="/receive"><Button className="w-full" variant="secondary">{t("home.request")}</Button></Link>
          <Link href="/scan"><Button className="w-full" variant="secondary">{t("home.scan")}</Button></Link>
          <Link href="/contacts"><Button className="w-full" variant="secondary">{t("nav.contacts")}</Button></Link>
          <Link href="/swap"><Button className="w-full" variant="secondary"><ArrowLeftRight className="mr-2" size={16} />{t("nav.swap")}</Button></Link>
          <Link href="/cash-in"><Button className="w-full" variant="secondary"><ArrowDownToLine className="mr-2" size={16} />{t("home.cashIn")}</Button></Link>
          <Link href="/cash-out"><Button className="w-full" variant="secondary"><ArrowUpToLine className="mr-2" size={16} />{t("home.cashOut")}</Button></Link>
          <Link href="/investments"><Button className="w-full" variant="secondary"><LineChart className="mr-2" size={16} />{t("nav.investments")}</Button></Link>
        </div>

        {connected && fixedQr ? (
          <Card className="space-y-3">
            <p className="text-sm font-semibold">{t("home.fixedQrTitle")}</p>
            <p className="text-xs text-muted">{t("home.fixedQrSubtitle")}</p>
            <Image src={fixedQr} alt={t("home.fixedQrAlt")} width={240} height={240} className="mx-auto rounded-2xl border border-border" />
            <Button className="w-full" variant="secondary" onClick={() => navigator.clipboard.writeText(receiveAnyAmountLink)}>
              {t("receive.copyLink")}
            </Button>
          </Card>
        ) : null}

        {drafts.length > 0 ? (
          <Card className="space-y-2">
            <p className="text-sm font-semibold">{t("home.scheduled")}</p>
            {drafts.slice(0, 3).map((draft) => (
              <div key={draft.id} className="rounded-xl border border-border p-2 text-xs">
                <p>{draft.amount} USDC {t("home.to")} {short(draft.to)}</p>
                <p className="text-muted">{formatDateTimeIso(draft.remindAt, locale)}</p>
                <a
                  className="text-accent underline"
                  href={`data:text/calendar;charset=utf-8,${encodeURIComponent(
                    buildIcs(draft.remindAt, "Mix payment reminder", `Pay ${draft.amount} USDC to ${draft.to}`),
                  )}`}
                  download="Mix-reminder.ics"
                >
                  {t("home.downloadReminder")}
                </a>
              </div>
            ))}
          </Card>
        ) : null}

        {history.length > 0 ? (
          <Card className="space-y-2">
            <p className="text-sm font-semibold">{t("home.recentLocal")}</p>
            {history.slice(0, 5).map((item) => (
              <div key={item.txid} className="rounded-xl border border-border p-2 text-xs">
                <p className="font-medium">{item.type.replace("_", " ")}</p>
                {item.amount ? <p>{item.amount} USDC</p> : null}
                <p className="text-muted">{formatDateTimeIso(item.createdAt, locale)}</p>
              </div>
            ))}
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
