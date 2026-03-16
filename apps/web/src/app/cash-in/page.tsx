"use client";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listProviders } from "@/features/cash/providers";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useWalletStore } from "@/stores/wallet-store";
import { useState } from "react";

function buildCashInCopy(t: (key: string) => string) {
  return {
    title: t("cashIn.title"),
    subtitle: t("cashIn.subtitle"),
    flowTitle: t("cashIn.flowTitle"),
    providersTitle: t("cashIn.providersTitle"),
    providersEmpty: t("cashIn.providersEmpty"),
    guideTitle: t("cashIn.guideTitle"),
    guideGoal: t("cashIn.guideGoal"),
    krakenFlowTitle: t("cashIn.krakenFlowTitle"),
    krakenFlowBody: t("cashIn.krakenFlowBody"),
    krakenStep1Title: t("cashIn.krakenStep1Title"),
    krakenStep1Body: t("cashIn.krakenStep1Body"),
    krakenStep1Cta: t("cashIn.krakenStep1Cta"),
    krakenStep2Title: t("cashIn.krakenStep2Title"),
    krakenStep2Body: t("cashIn.krakenStep2Body"),
    krakenStep2Cta: t("cashIn.krakenStep2Cta"),
    krakenAmountLabel: t("cashIn.krakenAmountLabel"),
    krakenAmountPlaceholder: t("cashIn.krakenAmountPlaceholder"),
    krakenAmountCopyCta: t("cashIn.krakenAmountCopyCta"),
    krakenAmountCopied: t("cashIn.krakenAmountCopied"),
    krakenAmountInvalid: t("cashIn.krakenAmountInvalid"),
    krakenStep3Title: t("cashIn.krakenStep3Title"),
    krakenStep3Body: t("cashIn.krakenStep3Body"),
    krakenStep3Cta: t("cashIn.krakenStep3Cta"),
    krakenStep3Empty: t("cashIn.krakenStep3Empty"),
    krakenStep3Copied: t("cashIn.krakenStep3Copied"),
    krakenStep4Title: t("cashIn.krakenStep4Title"),
    krakenStep4Body: t("cashIn.krakenStep4Body"),
    krakenStep4Cta: t("cashIn.krakenStep4Cta"),
    krakenStep5Title: t("cashIn.krakenStep5Title"),
    krakenStep5Body: t("cashIn.krakenStep5Body"),
    krakenStep5Cta: t("cashIn.krakenStep5Cta"),
    krakenSafety: t("cashIn.krakenSafety"),
    mistakesTitle: t("cashIn.mistakesTitle"),
    mistakes: [1, 2, 3, 4].map((index) => t(`cashIn.mistakes.${index}`)),
    noticeTitle: t("cashIn.noticeTitle"),
    notice1: t("cashIn.notice1"),
    notice2: t("cashIn.notice2"),
    steps: [1, 2, 3, 4, 5, 6, 7, 8].map((index) => t(`cashIn.steps.${index}`)),
  };
}

export default function CashInPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const walletAddress = useWalletStore((s) => s.activeAddress);
  const [krakenAmount, setKrakenAmount] = useState("");
  const copy = buildCashInCopy(t);
  const region = usePreferencesStore((s) => s.region);
  const usdcaProviders = listProviders("in", region).filter(
    (provider) => provider.methods.includes("cash.method.withdrawAlgorand") || provider.methods.includes("cash.method.usdcAlgorand"),
  );

  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="space-y-2">
          <h1 className="text-2xl font-bold">{copy.title}</h1>
          <p className="text-sm text-muted">{copy.subtitle}</p>
        </Card>

        <Card className="space-y-3 text-sm">
          <p className="text-base font-semibold">{copy.krakenFlowTitle}</p>
          <p className="text-muted">{copy.krakenFlowBody}</p>

          <Card className="space-y-2 border-border/70">
            <p className="font-medium">{copy.krakenStep1Title}</p>
            <p className="text-muted">{copy.krakenStep1Body}</p>
            <a href="https://www.kraken.com/c" target="_blank" rel="noreferrer">
              <Button className="w-full" variant="secondary">{copy.krakenStep1Cta}</Button>
            </a>
          </Card>

          <Card className="space-y-2 border-border/70">
            <p className="font-medium">{copy.krakenStep2Title}</p>
            <p className="text-muted">{copy.krakenStep2Body}</p>
            <a href="https://www.kraken.com/c" target="_blank" rel="noreferrer">
              <Button className="w-full" variant="secondary">{copy.krakenStep2Cta}</Button>
            </a>
          </Card>

          <Card className="space-y-2 border-border/70">
            <p className="font-medium">{copy.krakenStep3Title}</p>
            <p className="text-muted">{copy.krakenStep3Body}</p>
            <Button
              className="w-full"
              variant="secondary"
              disabled={!walletAddress}
              onClick={() => {
                if (!walletAddress) return;
                navigator.clipboard.writeText(walletAddress)
                  .then(() => toast({ title: copy.krakenStep3Copied }))
                  .catch(() => undefined);
              }}
            >
              {copy.krakenStep3Cta}
            </Button>
            {!walletAddress ? <p className="text-xs text-danger">{copy.krakenStep3Empty}</p> : null}
          </Card>

          <Card className="space-y-2 border-border/70">
            <p className="font-medium">{copy.krakenStep4Title}</p>
            <p className="text-muted">{copy.krakenStep4Body}</p>
            <Input
              value={krakenAmount}
              onChange={(e) => setKrakenAmount(e.target.value)}
              inputMode="decimal"
              placeholder={copy.krakenAmountPlaceholder}
              aria-label={copy.krakenAmountLabel}
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <a href="https://www.kraken.com/c" target="_blank" rel="noreferrer">
                <Button className="w-full" variant="secondary">{copy.krakenStep4Cta}</Button>
              </a>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  if (!/^\d+(?:[\.,]\d+)?$/.test(krakenAmount.trim())) {
                    toast({ title: copy.krakenAmountInvalid, variant: "danger" });
                    return;
                  }
                  navigator.clipboard.writeText(krakenAmount.trim())
                    .then(() => toast({ title: copy.krakenAmountCopied }))
                    .catch(() => undefined);
                }}
              >
                {copy.krakenAmountCopyCta}
              </Button>
            </div>
          </Card>

          <Card className="space-y-2 border-border/70">
            <p className="font-medium">{copy.krakenStep5Title}</p>
            <p className="text-muted">{copy.krakenStep5Body}</p>
            <a href="https://www.kraken.com/c" target="_blank" rel="noreferrer">
              <Button className="w-full" variant="secondary">{copy.krakenStep5Cta}</Button>
            </a>
          </Card>

          <p className="text-xs font-semibold text-danger">{copy.krakenSafety}</p>
        </Card>

        <details className="rounded-2xl border border-border bg-card p-4 shadow-sm" open>
          <summary className="cursor-pointer text-base font-semibold">{copy.flowTitle}</summary>
          <div className="mt-3 space-y-4">
            <Card className="space-y-2 text-sm">
              <p className="font-semibold">{copy.providersTitle}</p>
              {usdcaProviders.length === 0 ? (
                <p className="text-muted">{copy.providersEmpty}</p>
              ) : (
                <ul className="list-disc space-y-1 pl-5 text-muted">
                  {usdcaProviders.map((provider) => (
                    <li key={provider.id}>
                      <a className="underline" href={provider.url} target="_blank" rel="noreferrer">{provider.name}</a>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="space-y-3 text-sm">
              <p className="font-semibold">{copy.guideTitle}</p>
              <p className="text-muted">{copy.guideGoal}</p>
              <ol className="list-decimal space-y-2 pl-5 text-muted">
                {copy.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </Card>

            <Card className="space-y-3 text-sm">
              <p className="font-semibold">{copy.mistakesTitle}</p>
              <ul className="list-disc space-y-1 pl-5 text-muted">
                {copy.mistakes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>

            <Card className="space-y-2 text-sm">
              <p className="font-semibold">{copy.noticeTitle}</p>
              <p className="text-muted">{copy.notice1}</p>
              <p className="text-muted">{copy.notice2}</p>
            </Card>
          </div>
        </details>
      </div>
    </AppShell>
  );
}
