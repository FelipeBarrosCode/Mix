"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";
import { useI18n } from "@/hooks/use-i18n";
import { decimalToBaseUnits } from "@/lib/utils/amount";
import { buildPeraDeepLink, buildPeraRedirectLink } from "@/lib/utils/pera-link";
import { validateParsedPayment } from "@/lib/validation/payment";

function PayRouteInner() {
  const { t } = useI18n();
  const network = useActiveNetworkConfig();
  const searchParams = useSearchParams();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOrigin(window.location.origin);
  }, []);

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
    const amountBaseUnits = parsedPayment.amount ? decimalToBaseUnits(parsedPayment.amount, 6).toString() : undefined;
    return buildPeraDeepLink({
      address: parsedPayment.to,
      assetId: parsedPayment.assetId,
      amountBaseUnits,
      note: parsedPayment.note,
    });
  }, [parsedPayment]);

  const canonicalRedirectLink = useMemo(() => {
    if (!deepLink) return "";
    const resolvedOrigin = origin || (typeof window !== "undefined" ? window.location.origin : undefined);
    return buildPeraRedirectLink({ deepLink, origin: resolvedOrigin });
  }, [deepLink, origin]);

  useEffect(() => {
    if (!canonicalRedirectLink) return;
    window.location.replace(canonicalRedirectLink);
  }, [canonicalRedirectLink]);

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
        <p className="text-sm text-muted">{t("pay.preparing")}</p>
        <a href={canonicalRedirectLink || "#"}>
          <Button className="w-full">{t("pay.openInPera")}</Button>
        </a>
        <a href={deepLink || "#"}>
          <Button className="w-full" variant="secondary">{t("pay.openDirectLink")}</Button>
        </a>
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
