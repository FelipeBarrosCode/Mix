"use client";

import Link from "next/link";
import { CashProvider } from "@/features/cash/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";

export function ProviderCard({
  provider,
  href,
}: {
  provider: CashProvider;
  href: string;
}) {
  const { t } = useI18n();
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold">{provider.name}</p>
          <p className="text-xs text-muted">{t(provider.noteKey)}</p>
        </div>
        <Badge className="capitalize">{t("cash.custodial")}</Badge>
      </div>
      <div className="flex flex-wrap gap-1">
        {provider.methods.slice(0, 3).map((method) => (
          <Badge key={method}>{t(method)}</Badge>
        ))}
      </div>
      <p className="text-xs text-muted">
        {t("cash.subpageUrl")} <span className="font-mono">{href}</span>
      </p>
      <Link href={href}>
        <Button className="w-full" variant="secondary">{t("cash.viewGuide")}</Button>
      </Link>
    </Card>
  );
}
