"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";
import { useI18n } from "@/hooks/use-i18n";
import { decimalToBaseUnits } from "@/lib/utils/amount";
import { validateParsedPayment } from "@/lib/validation/payment";

function PayRouteInner() {
  const { t } = useI18n();
  const network = useActiveNetworkConfig();
  const searchParams = useSearchParams();

  const parsedPayment = useMemo(() => {
    try {
      return validateParsedPayment({
        to: searchParams.get("to"),
        amount: searchParams.get("amount") ?? undefined,
        note: searchParams.get("note") ?? undefined,
        asset: searchParams.get("asset") ?? String(network.usdcAssetId),
        network: searchParams.get("network") ?? undefined,
        source: "app_link",
      }, { usdcAssetId: network.usdcAssetId, networkId: network.id, requireAddress: true });
    } catch {
      return null;
    }
  }, [network.id, network.usdcAssetId, searchParams]);

  const deepLink = useMemo(() => {
    if (!parsedPayment) return "";
    const params = new URLSearchParams({ asset: String(parsedPayment.assetId) });
    if (parsedPayment.amount) params.set("amount", decimalToBaseUnits(parsedPayment.amount, 6).toString());
    if (parsedPayment.note) params.set("note", parsedPayment.note);
    return `perawallet://${parsedPayment.to}?${params.toString()}`;
  }, [parsedPayment]);

  const androidIntentLink = useMemo(() => {
    if (!parsedPayment) return "";
    const params = new URLSearchParams({ asset: String(parsedPayment.assetId) });
    if (parsedPayment.amount) params.set("amount", decimalToBaseUnits(parsedPayment.amount, 6).toString());
    if (parsedPayment.note) params.set("note", parsedPayment.note);
    const fallback = encodeURIComponent("https://play.google.com/store/apps/details?id=com.algorand.android");
    return `intent://${parsedPayment.to}?${params.toString()}#Intent;scheme=perawallet;package=com.algorand.android;S.browser_fallback_url=${fallback};end`;
  }, [parsedPayment]);

  const launchLink = useMemo(() => {
    if (typeof navigator === "undefined") return deepLink;
    const ua = navigator.userAgent;
    const isAndroidChrome = /Android/i.test(ua) && /Chrome/i.test(ua) && !/EdgA|OPR|SamsungBrowser/i.test(ua);
    return isAndroidChrome ? androidIntentLink : deepLink;
  }, [androidIntentLink, deepLink]);

  if (!parsedPayment) {
    return (
      <AppShell>
        <Card className="space-y-3">
          <h1 className="text-xl font-bold">{t("pay.invalidTitle")}</h1>
          <p className="text-sm text-muted">{t("pay.invalidSecureLink")}</p>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <Card className="space-y-3">
        <h1 className="text-xl font-bold">{t("pay.openWalletTitle")}</h1>
        <p className="text-sm text-muted">{t("pay.openWalletSubtitle")}</p>
        <a href={launchLink}>
          <Button className="w-full">{t("pay.openInPera")}</Button>
        </a>
        {launchLink !== deepLink ? (
          <a href={deepLink}>
            <Button className="w-full" variant="secondary">{t("pay.openDirectLink")}</Button>
          </a>
        ) : null}
        <p className="text-xs text-muted">{t("pay.installHint")}</p>
      </Card>
    </AppShell>
  );
}

function PayFallback() {
  const { t } = useI18n();

  return (
    <AppShell>
      <Card className="space-y-3">
        <h1 className="text-xl font-bold">{t("pay.openWalletTitle")}</h1>
        <p className="text-sm text-muted">{t("pay.preparing")}</p>
      </Card>
    </AppShell>
  );
}

export default function PayRoutePage() {
  return (
    <Suspense fallback={<PayFallback />}>
      <PayRouteInner />
    </Suspense>
  );
}
