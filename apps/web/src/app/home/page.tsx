"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowDownToLine, ArrowLeftRight, ArrowUpToLine, LineChart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWalletStore } from "@/stores/wallet-store";
import { useAccountSummary } from "@/hooks/use-account-summary";
import { baseUnitsToDecimal } from "@/lib/utils/amount";
import { useScheduleStore } from "@/stores/schedule-store";
import { useHistoryStore } from "@/stores/history-store";
import { buildHomeReceiveRequestNote, useHomeQrPaymentWatch } from "@/hooks/use-home-qr-payment-watch";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";
import { useFxQuote } from "@/hooks/use-fx-quote";
import { convertUsdcToFiat } from "@/lib/fx/quotes";
import { formatCurrency, formatDateTimeIso } from "@/lib/utils/format";
import { resolveExplorerTxUrl } from "@/lib/algorand/network";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useI18n } from "@/hooks/use-i18n";
import { qrToDataUrl } from "@/features/qr/generate";
import { buildPeraDeepLink, buildPeraRedirectLink } from "@/lib/utils/pera-link";

function short(addr?: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
}

export default function HomePage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const connected = useWalletStore((s) => s.connected);
  const activeAddress = useWalletStore((s) => s.activeAddress);
  const connect = useWalletStore((s) => s.connect);
  const disconnect = useWalletStore((s) => s.disconnect);
  const summary = useAccountSummary(activeAddress);
  const network = useActiveNetworkConfig();
  const drafts = useScheduleStore((s) => s.drafts);
  const history = useHistoryStore((s) => s.items);
  const fiatCurrency = usePreferencesStore((s) => s.fiatCurrency);
  const quote = useFxQuote();
  const [fixedQr, setFixedQr] = useState("");
  const [homeQrRequestId, setHomeQrRequestId] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!activeAddress) {
      setHomeQrRequestId("");
      return;
    }
    setHomeQrRequestId(crypto.randomUUID());
  }, [activeAddress, network.id]);

  const usdcAmount = baseUnitsToDecimal(summary.data?.usdcMicro ?? 0n, 6);
  const fiatBalance = convertUsdcToFiat(usdcAmount, quote.data);
  const homeQrRequestNote = useMemo(() => (homeQrRequestId ? buildHomeReceiveRequestNote(homeQrRequestId) : ""), [homeQrRequestId]);
  const receiveAnyAmountDeepLink = useMemo(() => {
    if (!activeAddress || !homeQrRequestNote) return "";
    return buildPeraDeepLink({
      address: activeAddress,
      assetId: network.usdcAssetId,
      amountBaseUnits: "0",
      note: homeQrRequestNote,
    });
  }, [activeAddress, homeQrRequestNote, network.usdcAssetId]);

  const receiveAnyAmountLink = useMemo(() => {
    if (!receiveAnyAmountDeepLink) return "";
    const resolvedOrigin = origin || (typeof window !== "undefined" ? window.location.origin : undefined);
    return buildPeraRedirectLink({ deepLink: receiveAnyAmountDeepLink, origin: resolvedOrigin });
  }, [origin, receiveAnyAmountDeepLink]);

  const watch = useHomeQrPaymentWatch({
    enabled: connected,
    qrReady: Boolean(fixedQr),
    receiver: activeAddress,
    assetId: network.usdcAssetId,
    requestNote: homeQrRequestNote,
    indexerEndpoints: network.indexerEndpoints,
  });

  useEffect(() => {
    if (watch.status !== "detected" || !watch.payment) return;
    toast({
      title: t("home.paymentWatchDetectedTitle"),
      description: `${watch.payment.amount} USDCa`,
    });
  }, [t, toast, watch.payment, watch.status]);

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
            {t("home.usdcBalance")}: {usdcAmount} USDCa
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

        {connected && fixedQr ? (
          <Card className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{t("home.paymentWatchTitle")}</p>
              <Badge className={watch.status === "detected" ? "bg-emerald-100 text-emerald-700" : undefined}>{t(`home.paymentWatchStatus.${watch.status}`)}</Badge>
            </div>
            <p className="text-xs text-muted">{t("home.paymentWatchSubtitle")}</p>
            {watch.status === "watching" ? (
              <p className="text-xs text-muted">
                {t("home.paymentWatchWatching")} {watch.secondsRemaining} {t("home.paymentWatchSeconds")} - {watch.pollCount} {t("home.paymentWatchChecks")}
              </p>
            ) : null}
            {watch.status === "timed_out" ? <p className="text-xs text-muted">{t("home.paymentWatchTimedOut")}</p> : null}
            {watch.status === "error" ? <p className="text-xs text-danger">{watch.lastError === watch.unsupportedErrorCode ? t("home.paymentWatchUnsupported") : watch.lastError ?? t("home.paymentWatchError")}</p> : null}
            {watch.payment ? (
              <div className="rounded-xl border border-border p-3 text-sm">
                <p className="font-medium">{watch.payment.amount} USDCa</p>
                <p className="text-xs text-muted">{t("home.paymentWatchFrom")}: {short(watch.payment.sender)}</p>
                <p className="text-xs text-muted">{t("home.paymentWatchReceivedAt")}: {formatDateTimeIso(watch.payment.receivedAt, locale)}</p>
                <p className="break-all text-xs text-muted">{t("home.paymentWatchTxid")}: {watch.payment.txid}</p>
                <a className="text-xs text-accent underline" href={resolveExplorerTxUrl(network, watch.payment.txid)} rel="noreferrer" target="_blank">
                  {t("receipt.openExplorer")} {watch.payment.txid.slice(0, 10)}...
                </a>
              </div>
            ) : null}
          </Card>
        ) : null}

        {drafts.length > 0 ? (
          <Card className="space-y-2">
            <p className="text-sm font-semibold">{t("home.scheduled")}</p>
            {drafts.slice(0, 3).map((draft) => (
              <div key={draft.id} className="rounded-xl border border-border p-2 text-xs">
                <p>{draft.amount} USDCa {t("home.to")} {short(draft.to)}</p>
                <p className="text-muted">{formatDateTimeIso(draft.remindAt, locale)}</p>
                <a
                  className="text-accent underline"
                  href={`data:text/calendar;charset=utf-8,${encodeURIComponent(
                    buildIcs(draft.remindAt, t("home.reminderTitle"), t("home.reminderDescription").replace("{amount}", draft.amount).replace("{to}", draft.to)),
                  )}`}
                  download={t("home.downloadReminderFile")}
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
                <p className="font-medium">{t(`history.type.${item.type}`)}</p>
                {item.amount ? <p>{item.amount} USDCa</p> : null}
                <p className="text-muted">{formatDateTimeIso(item.createdAt, locale)}</p>
              </div>
            ))}
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
