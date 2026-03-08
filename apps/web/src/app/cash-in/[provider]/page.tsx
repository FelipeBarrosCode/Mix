"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProviderById } from "@/features/cash/providers";
import { useI18n } from "@/hooks/use-i18n";
import { useWalletStore } from "@/stores/wallet-store";

function platformAssetHint(methods: string[]) {
  if (methods.includes("cash.method.lightning") || methods.includes("cash.method.p2pEscrow")) {
    return "cash.tutorial.assetHintP2P";
  }
  if (methods.includes("cash.method.swapAsas") || methods.includes("cash.method.swapLend")) {
    return "cash.tutorial.assetHintDex";
  }
  return "cash.tutorial.assetHintGeneric";
}

export default function CashInProviderPage() {
  const { provider: providerId } = useParams<{ provider: string }>();
  const provider = getProviderById(providerId);
  const wallet = useWalletStore((s) => s.activeAddress);
  const { t } = useI18n();

  if (!provider) {
    return (
      <AppShell>
        <Card>{t("cash.notFound")}</Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">{provider.name}</h1>
            <Badge>{t("cash.custodial")}</Badge>
          </div>
          <p className="text-sm text-muted">{t(provider.noteKey)}</p>
          <div className="flex flex-wrap gap-1">
            {provider.methods.map((method) => (
              <Badge key={method}>{t(method)}</Badge>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 text-sm">
          <p className="font-semibold">{t("cash.tutorialInTitle")}</p>
          <div className="space-y-1">
            <p className="font-medium">{t("cash.tutorialInSection1Title")}</p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>{t("cash.tutorialInSection1Step1Prefix")} {provider.name} {t("cash.tutorialInSection1Step1Suffix")}</li>
              <li>{t("cash.tutorialInSection1Step2")}</li>
              <li>{t("cash.tutorialInSection1Step3")}</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="font-medium">{t("cash.tutorialInSection2Title")}</p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>{t("cash.tutorialInSection2Step1Prefix")} {t(platformAssetHint(provider.methods))} {t("cash.tutorialInSection2Step1Suffix")}</li>
              <li>{t("cash.tutorialInSection2Step2")}</li>
              <li>{t("cash.tutorialInSection2Step3")}</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="font-medium">{t("cash.tutorialInSection3Title")}</p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>{t("cash.tutorialInSection3Step1")}</li>
              <li>{t("cash.tutorialInSection3Step2")}</li>
              <li>{t("cash.tutorialInSection3Step3")}</li>
            </ul>
          </div>
        </Card>

        <Card className="space-y-3 text-sm">
          <p className="font-semibold">{t("cash.prosConsTitle")}</p>
          <div className="space-y-1">
            <p className="font-medium">{t("cash.prosTitle")}</p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>{t("cash.inPros1")}</li>
              <li>{t("cash.inPros2")}</li>
              <li>{t("cash.inPros3")}</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="font-medium">{t("cash.consTitle")}</p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>{t("cash.inCons1")}</li>
              <li>{t("cash.inCons2")}</li>
              <li>{t("cash.inCons3")}</li>
            </ul>
          </div>
        </Card>

        <a href={provider.url} target="_blank" rel="noreferrer">
          <Button className="w-full">{t("cash.openProvider")}</Button>
        </a>
        {provider.walletConnectUrl ? (
          <a href={provider.walletConnectUrl} target="_blank" rel="noreferrer">
            <Button className="w-full" variant="secondary">{t("cash.walletConnect")}</Button>
          </a>
        ) : null}
        <Button
          className="w-full"
          variant="outline"
          onClick={() => wallet && navigator.clipboard.writeText(wallet)}
          disabled={!wallet}
        >
          {t("cash.copyAddress")}
        </Button>
      </div>
    </AppShell>
  );
}
