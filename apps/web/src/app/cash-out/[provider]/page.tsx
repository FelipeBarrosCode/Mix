"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProviderById } from "@/features/cash/providers";
import { useI18n } from "@/hooks/use-i18n";

function platformAssetHint(methods: string[]) {
  if (methods.includes("cash.method.lightning") || methods.includes("cash.method.p2pEscrow")) {
    return "cash.tutorial.assetHintP2P";
  }
  if (methods.includes("cash.method.swapAsas") || methods.includes("cash.method.swapLend")) {
    return "cash.tutorial.assetHintDex";
  }
  return "cash.tutorial.assetHintGeneric";
}

export default function CashOutProviderPage() {
  const { provider: providerId } = useParams<{ provider: string }>();
  const provider = getProviderById(providerId);
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
        </Card>

        <Card className="space-y-3 text-sm">
          <p className="font-semibold">{t("cash.tutorialOutTitle")}</p>
          <div className="space-y-1">
            <p className="font-medium">{t("cash.tutorialOutSection1Title")}</p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>{t("cash.tutorialOutSection1Step1Prefix")} {provider.name} {t("cash.tutorialOutSection1Step1Suffix")}</li>
              <li>{t("cash.tutorialOutSection1Step2")}</li>
              <li>{t("cash.tutorialOutSection1Step3")}</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="font-medium">{t("cash.tutorialOutSection2Title")}</p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>{t("cash.tutorialOutSection2Step1Prefix")} {t(platformAssetHint(provider.methods))} {t("cash.tutorialOutSection2Step1Suffix")}</li>
              <li>{t("cash.tutorialOutSection2Step2")}</li>
              <li>{t("cash.tutorialOutSection2Step3")}</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="font-medium">{t("cash.tutorialOutSection3Title")}</p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>{t("cash.tutorialOutSection3Step1")}</li>
              <li>{t("cash.tutorialOutSection3Step2")}</li>
              <li>{t("cash.tutorialOutSection3Step3")}</li>
            </ul>
          </div>
        </Card>

        <Card className="space-y-3 text-sm">
          <p className="font-semibold">{t("cash.prosConsTitle")}</p>
          <div className="space-y-1">
            <p className="font-medium">{t("cash.prosTitle")}</p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>{t("cash.outPros1")}</li>
              <li>{t("cash.outPros2")}</li>
              <li>{t("cash.outPros3")}</li>
            </ul>
          </div>
          <div className="space-y-1">
            <p className="font-medium">{t("cash.consTitle")}</p>
            <ul className="list-disc space-y-1 pl-5 text-muted">
              <li>{t("cash.outCons1")}</li>
              <li>{t("cash.outCons2")}</li>
              <li>{t("cash.outCons3")}</li>
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
      </div>
    </AppShell>
  );
}
