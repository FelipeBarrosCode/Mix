"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";

function PayRouteInner() {
  const { t } = useI18n();
  const searchParams = useSearchParams();

  const to = searchParams.get("to") ?? "";
  const amount = searchParams.get("amount") ?? "";
  const note = searchParams.get("note") ?? "";
  const assetInput = searchParams.get("asset") ?? "31566704";
  const normalizedAsset = assetInput.toUpperCase();
  const asset = normalizedAsset === "USDC" || normalizedAsset === "USDCA" ? "31566704" : assetInput;

  const deepLink = useMemo(() => {
    const params = new URLSearchParams({ asset });
    if (amount) params.set("amount", amount);
    if (note) params.set("note", note);
    return `perawallet://${to}?${params.toString()}`;
  }, [asset, to, amount, note]);

  const androidIntentLink = useMemo(() => {
    const params = new URLSearchParams({ asset });
    if (amount) params.set("amount", amount);
    if (note) params.set("note", note);
    const fallback = encodeURIComponent("https://play.google.com/store/apps/details?id=com.algorand.android");
    return `intent://${to}?${params.toString()}#Intent;scheme=perawallet;package=com.algorand.android;S.browser_fallback_url=${fallback};end`;
  }, [asset, to, amount, note]);

  const launchLink = useMemo(() => {
    if (typeof navigator === "undefined") return deepLink;
    const ua = navigator.userAgent;
    const isAndroidChrome = /Android/i.test(ua) && /Chrome/i.test(ua) && !/EdgA|OPR|SamsungBrowser/i.test(ua);
    return isAndroidChrome ? androidIntentLink : deepLink;
  }, [androidIntentLink, deepLink]);

  if (!to) {
    return (
      <AppShell>
        <Card className="space-y-3">
          <h1 className="text-xl font-bold">{t("pay.invalidTitle")}</h1>
          <p className="text-sm text-muted">{t("pay.invalidLink")}</p>
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
