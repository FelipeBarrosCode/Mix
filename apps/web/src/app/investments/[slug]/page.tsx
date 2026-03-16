"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getInvestmentBySlug } from "@/features/investments/data";
import { useI18n } from "@/hooks/use-i18n";

function riskBadgeClass(risk: string) {
  const normalized = risk.toLowerCase();
  if (normalized.includes("low") || normalized.includes("baixo") || normalized.includes("bajo")) return "bg-emerald-100 text-emerald-800";
  if (normalized.includes("high") || normalized.includes("alto")) return "bg-red-100 text-red-800";
  return "bg-amber-100 text-amber-800";
}

export default function InvestmentDetailsPage() {
  const { t, locale } = useI18n();
  const params = useParams<{ slug: string }>();
  const investment = getInvestmentBySlug(params.slug ?? "", locale);

  if (!investment) {
    return (
      <AppShell>
        <Card className="space-y-2">
          <h1 className="text-xl font-bold">{t("invest.notFoundTitle")}</h1>
          <Link href="/investments">
            <Button className="w-full" variant="outline">{t("invest.back")}</Button>
          </Link>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h1 className="text-2xl font-bold">{investment.title}</h1>
            <Badge className={riskBadgeClass(investment.riskLevel)}>{investment.riskLevel}</Badge>
          </div>
          <p className="text-sm text-muted">{investment.shortDescription}</p>
        </Card>

        <Card className="space-y-2 text-sm">
          <p className="font-semibold">{t("invest.basedOn")}</p>
          <p className="text-muted">{investment.basedOn}</p>
        </Card>

        <Card className="space-y-2 text-sm">
          <p className="font-semibold">{t("invest.yearlyYield")}</p>
          <p className="text-muted">{investment.yearlyYield}</p>
        </Card>

        <Card className="space-y-2 text-sm">
          <p className="font-semibold">{t("invest.vsBanks")}</p>
          <p className="text-muted">{t("invest.traditionalOption")}: {investment.traditionalOption}</p>
          <p className="text-muted">{t("invest.comparison")}: {investment.comparesToBanks}</p>
          <p className="text-muted">{t("invest.summary")}: {investment.apyComparison}</p>
        </Card>

        <Card className="space-y-2 text-sm">
          <p className="font-semibold">{t("invest.platformsAlgorand")}</p>
          <ul className="list-disc space-y-2 pl-5 text-muted">
            {investment.algorandPlatforms.map((platform) => (
              <li key={platform.name}>
                <a className="underline" href={platform.url} target="_blank" rel="noreferrer">{platform.name}</a>
                {platform.notes ? ` - ${platform.notes}` : ""}
              </li>
            ))}
          </ul>
        </Card>

        <details className="rounded-2xl border border-border bg-card p-4 shadow-sm" open>
          <summary className="cursor-pointer text-base font-semibold">{t("invest.howToNavigate")}</summary>
          <div className="mt-3 space-y-3">
            <Card className="space-y-2 text-sm">
              <ol className="list-decimal space-y-2 pl-5 text-muted">
                {investment.navigationSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Card>
          </div>
        </details>

        <details className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <summary className="cursor-pointer text-base font-semibold">{t("invest.connectWallet")}</summary>
          <div className="mt-3 space-y-3">
            {investment.algorandPlatforms.map((platform) => (
              <Card key={`${platform.name}-actions`} className="space-y-2 text-sm">
                <p className="font-semibold">{platform.name}</p>
                {platform.walletConnectUrl ? (
                  <a href={platform.walletConnectUrl} target="_blank" rel="noreferrer">
                    <Button className="w-full">{t("invest.openWalletConnect")}</Button>
                  </a>
                ) : (
                  <a href={platform.url} target="_blank" rel="noreferrer">
                    <Button className="w-full" variant="secondary">{t("invest.openPlatform")}</Button>
                  </a>
                )}
              </Card>
            ))}
          </div>
        </details>

        <Link href="/investments">
          <Button className="w-full" variant="outline">{t("invest.back")}</Button>
        </Link>
      </div>
    </AppShell>
  );
}
