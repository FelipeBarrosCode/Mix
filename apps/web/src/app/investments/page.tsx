"use client";

import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { listInvestmentsBySafety } from "@/features/investments/data";
import { useI18n } from "@/hooks/use-i18n";

function riskBadgeClass(risk: string) {
  const normalized = risk.toLowerCase();
  if (normalized.includes("low") || normalized.includes("baixo") || normalized.includes("bajo")) return "bg-emerald-100 text-emerald-800";
  if (normalized.includes("high") || normalized.includes("alto")) return "bg-red-100 text-red-800";
  return "bg-amber-100 text-amber-800";
}

export default function InvestmentsPage() {
  const { t, locale } = useI18n();
  const methods = listInvestmentsBySafety(locale);

  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="space-y-2">
          <h1 className="text-2xl font-bold">{t("invest.title")}</h1>
          <p className="text-sm text-muted">{t("invest.subtitle")}</p>
        </Card>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {methods.map((method, index) => (
            <Card key={method.slug} className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted">{t("invest.rankPrefix")} #{index + 1} ({t("invest.rankSuffix")})</p>
                  <Badge className={riskBadgeClass(method.riskLevel)}>{method.riskLevel}</Badge>
                </div>
                <p className="text-base font-semibold">{method.title}</p>
                <p className="text-sm text-muted">{method.shortDescription}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted">
                <p>{t("invest.yieldLabel")}: {method.yearlyYield}</p>
                <p>{t("invest.platformsLabel")}: {method.algorandPlatforms.length}</p>
              </div>
              <Link href={`/investments/${method.slug}`}>
                <Button className="w-full" variant="secondary">{t("invest.openDetails")}</Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
