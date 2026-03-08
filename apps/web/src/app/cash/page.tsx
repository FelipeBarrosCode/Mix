"use client";

import Link from "next/link";
import { ArrowDownToLine, ArrowUpToLine } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";

export default function CashPage() {
  const { t } = useI18n();

  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="space-y-2">
          <h1 className="text-2xl font-bold">{t("cash.pageTitle")}</h1>
          <p className="text-sm text-muted">{t("cash.pageSubtitle")}</p>
        </Card>

        <Link href="/cash-in">
          <Button className="w-full" variant="secondary">
            <ArrowDownToLine className="mr-2" size={16} />
            {t("nav.cashIn")}
          </Button>
        </Link>

        <Link href="/cash-out">
          <Button className="w-full" variant="secondary">
            <ArrowUpToLine className="mr-2" size={16} />
            {t("nav.cashOut")}
          </Button>
        </Link>
      </div>
    </AppShell>
  );
}
