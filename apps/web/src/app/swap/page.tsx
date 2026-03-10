"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";
import { useFxQuote } from "@/hooks/use-fx-quote";
import { useI18n } from "@/hooks/use-i18n";
import { useWalletAssets } from "@/hooks/use-wallet-assets";
import { submitSignedTransactions, waitForConfirmation } from "@/lib/algorand/algod";
import { buildTinymanSwapTxns, getTinymanFixedInputRoute } from "@/lib/algorand/tinyman";
import { signTransactions } from "@/lib/algorand/wallet";
import { baseUnitsToDecimal, decimalToBaseUnits } from "@/lib/utils/amount";
import { formatCurrency } from "@/lib/utils/format";
import { qrToDataUrl } from "@/features/qr/generate";
import { fiatFromRegion, usePreferencesStore } from "@/stores/preferences-store";
import { useWalletStore } from "@/stores/wallet-store";

export default function SwapPage() {
  const { t, locale } = useI18n();
  const activeAddress = useWalletStore((s) => s.activeAddress);
  const connected = useWalletStore((s) => s.connected);
  const connect = useWalletStore((s) => s.connect);
  const { toast } = useToast();
  const region = usePreferencesStore((s) => s.region);
  const fiatCurrency = fiatFromRegion(region);
  const network = useActiveNetworkConfig();
  const quote = useFxQuote();
  const assetsQuery = useWalletAssets(activeAddress);

  const [amount, setAmount] = useState("");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [peraQr, setPeraQr] = useState("");
  const submissionLockRef = useRef(false);

  const peraDeepLink = useMemo(() => "perawallet://", []);

  useEffect(() => {
    if (selectedAssetId || !assetsQuery.data?.length) return;
    setSelectedAssetId(assetsQuery.data[0].id);
  }, [assetsQuery.data, selectedAssetId]);

  const selectedAsset = useMemo(
    () => assetsQuery.data?.find((asset) => asset.id === selectedAssetId),
    [assetsQuery.data, selectedAssetId],
  );

  const amountBaseUnits = useMemo(() => {
    if (!selectedAsset || !amount.trim()) return null;
    try {
      return decimalToBaseUnits(amount.trim(), selectedAsset.decimals);
    } catch {
      return null;
    }
  }, [amount, selectedAsset]);

  const routeQuery = useQuery({
    queryKey: ["tinyman-swap-route", network.id, selectedAssetId, amountBaseUnits?.toString() ?? "0"],
    enabled: Boolean(selectedAsset && amountBaseUnits && amountBaseUnits > 0n),
    queryFn: () =>
      getTinymanFixedInputRoute({
        networkId: network.id,
        assetInId: selectedAsset?.isAlgo ? 0 : Number(selectedAsset?.assetId ?? 0),
        assetOutId: network.usdcAssetId,
        amountBaseUnits: amountBaseUnits ?? 0n,
        slippage: "0.01",
      }),
  });

  const usdcFromRoute = useMemo(() => {
    if (!routeQuery.data?.output_amount) return "";
    try {
      return baseUnitsToDecimal(BigInt(routeQuery.data.output_amount), 6);
    } catch {
      return "";
    }
  }, [routeQuery.data]);

  const equivalents = useMemo(() => {
    const fx = quote.data?.usdToFiat;
    const usdcValue = Number(usdcFromRoute || 0);
    if (!usdcValue || Number.isNaN(usdcValue) || !fx) {
      return { usdc: "", fiat: "" };
    }
    const fiat = usdcValue * fx;
    return {
      usdc: usdcFromRoute,
      fiat: formatCurrency(fiat, fiatCurrency, locale),
    };
  }, [quote.data, fiatCurrency, locale, usdcFromRoute]);

  useEffect(() => {
    if (!connected || !routeQuery.data || !peraDeepLink) {
      setPeraQr("");
      return;
    }

    qrToDataUrl(peraDeepLink)
      .then(setPeraQr)
      .catch(() => setPeraQr(""));
  }, [connected, routeQuery.data, peraDeepLink]);

  async function openPeraSwap() {
    if (submissionLockRef.current || submitting) return;
    if (!activeAddress || !routeQuery.data || !selectedAsset || !amountBaseUnits || amountBaseUnits <= 0n) return;

    try {
      submissionLockRef.current = true;
      setSubmitting(true);

      const quoteAgeMs = Date.now() - quote.dataUpdatedAt;
      if (!quote.data || quoteAgeMs > 2 * 60 * 1000) {
        await quote.refetch();
      }

      const latestRouteResult = await routeQuery.refetch();
      const latestRoute = latestRouteResult.data;
      const outputAmount = latestRoute?.output_amount ? BigInt(latestRoute.output_amount) : 0n;
      if (!latestRoute || outputAmount <= 0n) {
        throw new Error(t("swap.priceUnavailable"));
      }

      const outputAmountArg = BigInt(latestRoute.output_amount_arg ?? "0");
      if (outputAmountArg <= 0n || outputAmount < outputAmountArg) {
        throw new Error("Route bounds check failed. Refresh quote and try again.");
      }

      const routeTimestamp = Date.parse(latestRoute.status?.round_datetime ?? "");
      if (!Number.isFinite(routeTimestamp) || Date.now() - routeTimestamp > 2 * 60 * 1000) {
        throw new Error("Swap route is stale. Please refresh and try again.");
      }

      const priceImpact = Number(latestRoute.price_impact ?? "0");
      if (!Number.isFinite(priceImpact) || priceImpact > 0.15) {
        throw new Error("Price impact is too high. Reduce amount and try again.");
      }

      const selectedBalanceBaseUnits = decimalToBaseUnits(selectedAsset.balance, selectedAsset.decimals);
      if (selectedBalanceBaseUnits < amountBaseUnits) {
        throw new Error(t("confirm.insufficientUsdc"));
      }

      const txGroup = await buildTinymanSwapTxns({
        initiatorAddr: activeAddress,
        route: latestRoute,
      });
      const signed = await signTransactions(txGroup);
      const { txid } = await submitSignedTransactions(signed);
      await waitForConfirmation(txid, 8);
      toast({ title: t("swap.swapSuccess"), description: txid });
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (/cancelled|rejected|declined/i.test(message)) {
        toast({ title: t("swap.signatureRejected"), variant: "danger" });
      } else {
        toast({ title: t("swap.swapFailed"), description: message || t("common.unknownError"), variant: "danger" });
      }
    } finally {
      submissionLockRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="space-y-2">
          <h1 className="text-2xl font-bold">{t("nav.swap")}</h1>
          <p className="text-sm text-muted">{t("swap.subtitle")}</p>
        </Card>

        {!connected ? (
          <Card className="space-y-3">
            <p className="text-sm text-muted">{t("swap.connectWalletPrompt")}</p>
            <Button className="w-full" onClick={() => connect()}>{t("wallet.connect")}</Button>
          </Card>
        ) : null}

        {connected ? (
          <Card className="space-y-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("swap.cryptoAmount")}</Label>
                <Input placeholder={t("swap.amountPlaceholder")} inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <Label>{t("swap.selectAsset")}</Label>
                {assetsQuery.isLoading ? <p className="text-xs text-muted">{t("swap.loadingAssets")}</p> : null}
                <select
                  className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  disabled={!assetsQuery.data?.length}
                >
                  {!assetsQuery.data?.length ? <option value="">{t("swap.noAssets")}</option> : null}
                  {(assetsQuery.data ?? []).map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.label} ({asset.balance})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>{t("swap.fiatAmount")} ({fiatCurrency})</Label>
                <Input readOnly value={equivalents.fiat} placeholder="--" />
                <p className="text-xs text-muted">
                  {t("swap.usdcEquivalent")}: {equivalents.usdc ? `${equivalents.usdc} USDCa` : "--"}
                </p>
                {routeQuery.isError ? <p className="text-xs text-danger">{t("swap.priceUnavailable")}</p> : null}
              </div>
            </div>

            <Button className="w-full" onClick={openPeraSwap} disabled={submitting || !amount || !selectedAsset || !equivalents.usdc || routeQuery.isLoading}>
              {submitting ? t("swap.signingInPera") : t("swap.openInPera")}
            </Button>

            {routeQuery.data && peraQr ? (
              <Card className="space-y-3 border-border/70 text-sm">
                <p className="text-xs text-muted">{t("swap.scanQrFallback")}</p>
                <Image
                  src={peraQr}
                  alt={t("swap.scanQrFallback")}
                  width={220}
                  height={220}
                  className="mx-auto rounded-xl border border-border"
                />
              </Card>
            ) : null}
          </Card>
        ) : null}

        <Card className="space-y-2 text-xs text-muted">
          <p>{t("swap.quoteNote")}</p>
        </Card>
      </div>
    </AppShell>
  );
}
