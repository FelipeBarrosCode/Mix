"use client";

import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { CASH_OUT_AI_PROMPT } from "@/features/cash/ai-prompts";
import { useI18n } from "@/hooks/use-i18n";
import { useToast } from "@/hooks/use-toast";
import { usePreferencesStore } from "@/stores/preferences-store";

export default function CashOutPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const region = usePreferencesStore((s) => s.region);
  const fiatCurrency = usePreferencesStore((s) => s.fiatCurrency);

  const prompt = useMemo(() => {
    return `${CASH_OUT_AI_PROMPT}\n\nUser context from this app:\n- Preferred language: ${locale}\n- Selected region: ${region}\n- Fiat currency: ${fiatCurrency}`;
  }, [fiatCurrency, locale, region]);

  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="space-y-2">
          <h1 className="text-2xl font-bold">{t("cashOut.title")}</h1>
          <p className="text-sm text-muted">{t("cashOut.subtitle")}</p>
        </Card>

        <Card className="space-y-3 text-sm">
          <p className="text-base font-semibold">{t("cashOut.aiPromptTitle")}</p>
          <p className="text-muted">
            {t("cashOut.aiPromptBody")}
          </p>
          <Textarea className="min-h-[28rem] font-mono text-xs leading-5" readOnly value={prompt} />
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => {
              navigator.clipboard.writeText(prompt)
                .then(() => toast({ title: t("cashOut.aiPromptCopied") }))
                .catch(() => undefined);
            }}
          >
            {t("cashOut.aiPromptCopy")}
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
