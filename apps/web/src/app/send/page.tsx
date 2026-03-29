"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { resolveAlgoName } from "@/lib/algorand/nfdOnChain";
import { isOptedIntoUsdc } from "@/lib/algorand/usdc";
import { buildAssetOptInTxn } from "@/lib/algorand/txns";
import { signAndSend } from "@/lib/algorand/wallet";
import { isAlgoName, isValidAlgorandAddress } from "@/lib/validation/address";
import { isPaymentRequestInput, PaymentSource, validatePaymentNote, validatePaymentRecipient } from "@/lib/validation/payment";
import { useSendStore } from "@/stores/send-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useToast } from "@/hooks/use-toast";
import { parseMixUri } from "@/features/qr/uri";
import { QrScannerView } from "@/features/qr/scanner";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";
import { useFxQuote } from "@/hooks/use-fx-quote";
import { convertUsdcToFiat } from "@/lib/fx/quotes";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useI18n } from "@/hooks/use-i18n";

export default function SendPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { toast } = useToast();
  const activeAddress = useWalletStore((s) => s.activeAddress);
  const setDraft = useSendStore((s) => s.setDraft);
  const network = useActiveNetworkConfig();
  const [loading, setLoading] = useState(false);
  const [needOptIn, setNeedOptIn] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [fiatAmount, setFiatAmount] = useState("");
  const [note, setNote] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scannedValue, setScannedValue] = useState("");
  const [recipientSource, setRecipientSource] = useState<PaymentSource>("manual");

  const fiatCurrency = usePreferencesStore((s) => s.fiatCurrency);
  const quote = useFxQuote();

  const usdcAmount = useMemo(() => {
    const numeric = Number(fiatAmount || 0);
    if (!quote.data || Number.isNaN(numeric)) return "";
    const raw = numeric / quote.data.usdToFiat;
    if (!Number.isFinite(raw) || raw <= 0) return "";
    return raw.toFixed(6).replace(/\.?(0+)$/, "");
  }, [fiatAmount, quote.data]);

  const parseOptions = useMemo(() => ({ usdcAssetId: network.usdcAssetId, networkId: network.id }), [network.id, network.usdcAssetId]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const queryRecipient = query.get("to") ?? "";
    try {
      setRecipient(validatePaymentRecipient(queryRecipient, { allowAlgoName: true, requireAddress: false }));
    } catch {
      setRecipient(queryRecipient.trim());
    }
    const requestedUsdc = query.get("amount") ?? "";
    if (requestedUsdc && quote.data) {
      const fiatValue = Number(requestedUsdc) * quote.data.usdToFiat;
      if (Number.isFinite(fiatValue)) {
        setFiatAmount(fiatValue.toFixed(2));
      }
    }
    try {
      setNote(validatePaymentNote(query.get("note") ?? "") ?? "");
    } catch {
      setNote("");
    }
  }, [quote.data]);

  async function onSubmit() {
    if (!/^\d+(\.\d+)?$/.test(fiatAmount || "")) {
      toast({ title: t("send.invalidAmountTitle"), description: t("send.invalidAmountDescription"), variant: "danger" });
      return;
    }
    const quoteAgeMs = Date.now() - quote.dataUpdatedAt;
    const freshQuote = quote.data && quoteAgeMs <= 2 * 60 * 1000
      ? quote.data
      : (await quote.refetch()).data;

    if (!freshQuote) {
      toast({ title: t("send.rateUnavailable"), variant: "danger" });
      return;
    }

    const fiatNumeric = Number(fiatAmount || 0);
    const quoteDerivedUsdc = (fiatNumeric / freshQuote.usdToFiat).toFixed(6).replace(/\.?(0+)$/, "");
    if (!quoteDerivedUsdc) {
      toast({ title: t("send.rateUnavailable"), variant: "danger" });
      return;
    }

    if (!activeAddress) {
      toast({ title: t("wallet.notConnected"), description: t("wallet.connectFirst"), variant: "danger" });
      return;
    }

    setLoading(true);
    try {
      let raw = recipient.trim();
      let amountUsdc = quoteDerivedUsdc;
      let draftNote = validatePaymentNote(note);
      let source: PaymentSource = recipientSource;
      let assetId = network.usdcAssetId;

      if (isPaymentRequestInput(raw)) {
        const parsed = parseMixUri(raw, parseOptions);
        if (parsed.type !== "pay") throw new Error(t("send.onlyPayPayload"));
        raw = parsed.to;
        source = parsed.source;
        assetId = parsed.assetId;
        if (parsed.amount) {
          amountUsdc = parsed.amount;
          const convertedFiat = convertUsdcToFiat(parsed.amount, quote.data);
          if (convertedFiat !== null) {
            setFiatAmount(convertedFiat.toFixed(2));
          }
        }
        if (parsed.note) {
          draftNote = parsed.note;
          setNote(parsed.note);
        }
      } else {
        raw = validatePaymentRecipient(raw, { allowAlgoName: true, requireAddress: false });
      }
      let resolvedAddress = "";

      if (isValidAlgorandAddress(raw)) {
        resolvedAddress = raw;
      } else if (isAlgoName(raw)) {
        resolvedAddress = (await resolveAlgoName(raw)).address;
      } else {
        throw new Error(t("send.invalidRecipient"));
      }

      const [senderOpted, receiverOpted] = await Promise.all([
        isOptedIntoUsdc(activeAddress),
        isOptedIntoUsdc(resolvedAddress),
      ]);

      if (!senderOpted) {
        setNeedOptIn(true);
        throw new Error(t("send.senderNotOpted"));
      }
      if (!receiverOpted) {
        throw new Error(t("send.receiverNotOpted"));
      }

      setDraft({
        rawRecipient: raw,
        resolvedAddress,
        amount: amountUsdc,
        assetId,
        networkId: network.id,
        source,
        validated: true,
        note: draftNote,
      });
      router.push("/confirm");
    } catch (error) {
      toast({
        title: t("send.preflightFailed"),
        description: error instanceof Error ? error.message : t("common.unknownError"),
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  async function optIn() {
    if (!activeAddress) return;
    try {
      setLoading(true);
      const txn = await buildAssetOptInTxn({ address: activeAddress, assetId: network.usdcAssetId });
      await signAndSend([{ txn }]);
      setNeedOptIn(false);
      toast({ title: t("send.optInSent") });
    } catch (error) {
      toast({
        title: t("send.optInFailed"),
        description: error instanceof Error ? error.message : t("common.unknownError"),
        variant: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <Card>
        <h1 className="text-xl font-bold">{t("send.title")}</h1>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>{t("send.scanField")}</Label>
            <Button className="w-full" type="button" variant="secondary" onClick={() => setShowScanner(true)}>
              {t("send.openScanner")}
            </Button>
            {scannedValue ? <p className="text-xs text-muted">{t("send.lastScanned")}: {scannedValue}</p> : null}
          </div>
          <div>
            <Label>{t("send.recipientLabel")}</Label>
            <Input placeholder={t("send.recipientPlaceholder")} value={recipient} onChange={(e) => {
              setRecipient(e.target.value);
              setRecipientSource("manual");
            }} />
          </div>
          <div>
            <Label>{t("send.amountFiatLabel")} ({fiatCurrency})</Label>
            <Input placeholder="10.50" inputMode="decimal" className="text-2xl font-bold" value={fiatAmount} onChange={(e) => setFiatAmount(e.target.value)} />
            <p className="mt-1 text-xs text-muted">
              {usdcAmount ? `${t("send.usdcEquivalent")}: ${usdcAmount} USDCa` : ""}
            </p>
            <p className="mt-1 text-[11px] text-muted">{t("settings.fiat")}: {fiatCurrency}</p>
          </div>
          <div>
            <Label>{t("send.referenceOptional")}</Label>
            <Textarea placeholder={t("send.referencePlaceholder")} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button className="w-full" disabled={loading} type="button" onClick={onSubmit}>
            {loading ? t("send.checking") : t("send.continue")}
          </Button>
          {needOptIn ? (
            <Button className="w-full" variant="secondary" type="button" onClick={optIn}>
              {t("send.optInButton")}
            </Button>
          ) : null}
        </div>
      </Card>
      {showScanner ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 md:items-center">
          <Card className="w-full max-w-md space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-base font-semibold">{t("send.scanField")}</p>
              <Button type="button" variant="outline" onClick={() => setShowScanner(false)}>
                {t("send.closeScanner")}
              </Button>
            </div>
            <QrScannerView
              onResult={(value) => {
                try {
                  const parsed = parseMixUri(value, parseOptions);
                  if (parsed.type !== "pay") {
                    throw new Error(t("send.onlyPayPayload"));
                  }
                  setRecipient(parsed.to);
                  if (parsed.amount && quote.data) {
                    const converted = convertUsdcToFiat(parsed.amount, quote.data);
                    setFiatAmount(converted === null ? "" : converted.toFixed(2));
                  } else {
                    setFiatAmount("");
                  }
                  setNote(parsed.note ?? "");
                  setScannedValue(value);
                  setRecipientSource("scan");
                  setShowScanner(false);
                } catch {
                  toast({ title: t("scan.invalidPayload"), variant: "danger" });
                }
              }}
            />
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}
