"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { qrToDataUrl } from "@/features/qr/generate";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";
import { decimalToBaseUnits } from "@/lib/utils/amount";
import { useWalletStore } from "@/stores/wallet-store";
import { useI18n } from "@/hooks/use-i18n";

export default function ReceivePage() {
  const { t } = useI18n();
  const activeAddress = useWalletStore((s) => s.activeAddress);
  const network = useActiveNetworkConfig();
  const [amount, setAmount] = useState("");
  const [qr, setQr] = useState("");

  const target = useMemo(() => activeAddress || "", [activeAddress]);
  const shareLink = useMemo(() => {
    if (!target) return "";
    const params = new URLSearchParams({ asset: String(network.usdcAssetId) });
    const normalizedAmount = amount.trim();
    if (normalizedAmount) {
      try {
        const baseUnits = decimalToBaseUnits(normalizedAmount, 6);
        params.set("amount", baseUnits.toString());
      } catch {
        return "";
      }
    } else {
      params.set("amount", "0");
    }
    return `perawallet://${target}?${params.toString()}`;
  }, [amount, network.usdcAssetId, target]);

  useEffect(() => {
    if (!target) {
      setQr("");
      return;
    }
    qrToDataUrl(shareLink)
      .then(setQr)
      .catch(() => setQr(""));
  }, [target, shareLink]);

  return (
    <AppShell>
      <Card className="space-y-4">
        <h1 className="text-xl font-bold">{t("receive.title")}</h1>
        <div>
          <Label>{t("send.amountLabel")}</Label>
          <Input placeholder="10.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        {!amount.trim() ? <p className="text-xs text-muted">{t("receive.fixedQrMode")}</p> : null}
        {qr ? (
          <div className="space-y-3 text-center">
            <Image src={qr} alt={t("receive.qrAlt")} width={280} height={280} className="mx-auto rounded-2xl border border-border" />
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => navigator.clipboard.writeText(shareLink)}
            >
              {t("receive.copyLink")}
            </Button>
            <a href={shareLink}>
              <Button className="w-full">{t("receive.openInPera")}</Button>
            </a>
          </div>
        ) : null}
      </Card>
    </AppShell>
  );
}
