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

function buildCashOutCopy(t: (key: string) => string) {
  return {
    title: t("cashOut.title"),
    subtitle: t("cashOut.subtitle"),
    flowTitle: t("cashOut.flowTitle"),
    providersTitle: t("cashOut.providersTitle"),
    providersEmpty: t("cashOut.providersEmpty"),
    guideTitle: t("cashOut.guideTitle"),
    guideGoal: t("cashOut.guideGoal"),
    krakenFlowTitle: t("cashOut.krakenFlowTitle"),
    krakenFlowBody: t("cashOut.krakenFlowBody"),
    krakenStep1Title: t("cashOut.krakenStep1Title"),
    krakenStep1Body: t("cashOut.krakenStep1Body"),
    krakenStep1Cta: t("cashOut.krakenStep1Cta"),
    krakenStep1CopyCta: t("cashOut.krakenStep1CopyCta"),
    krakenStep1Empty: t("cashOut.krakenStep1Empty"),
    krakenStep1Copied: t("cashOut.krakenStep1Copied"),
    krakenStep2Title: t("cashOut.krakenStep2Title"),
    krakenStep2Body: t("cashOut.krakenStep2Body"),
    krakenAmountLabel: t("cashOut.krakenAmountLabel"),
    krakenAmountPlaceholder: t("cashOut.krakenAmountPlaceholder"),
    krakenAmountCopyCta: t("cashOut.krakenAmountCopyCta"),
    krakenAmountCopied: t("cashOut.krakenAmountCopied"),
    krakenAmountInvalid: t("cashOut.krakenAmountInvalid"),
    krakenOptionTitle: t("cashOut.krakenOptionTitle"),
    krakenOptionA: t("cashOut.krakenOptionA"),
    krakenOptionADesc: t("cashOut.krakenOptionADesc"),
    krakenOptionACta: t("cashOut.krakenOptionACta"),
    krakenOptionB: t("cashOut.krakenOptionB"),
    krakenOptionBDesc: t("cashOut.krakenOptionBDesc"),
    krakenOptionBCta: t("cashOut.krakenOptionBCta"),
    krakenSafety: t("cashOut.krakenSafety"),
    mistakesTitle: t("cashOut.mistakesTitle"),
    mistakes: [1, 2, 3, 4].map((index) => t(`cashOut.mistakes.${index}`)),
    noticeTitle: t("cashOut.noticeTitle"),
    notice1: t("cashOut.notice1"),
    notice2: t("cashOut.notice2"),
    steps: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((index) => t(`cashOut.steps.${index}`)),
  };
}

export default function CashOutPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const walletAddress = useWalletStore((s) => s.activeAddress);
  const [krakenAmount, setKrakenAmount] = useState("");
  const copy = buildCashOutCopy(t);
  const region = usePreferencesStore((s) => s.region);
  const usdcaProviders = listProviders("out", region).filter(
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
            <div className="grid gap-2 sm:grid-cols-2">
              <a href="https://www.kraken.com/c" target="_blank" rel="noreferrer">
                <Button className="w-full" variant="secondary">{copy.krakenStep1Cta}</Button>
              </a>
              <Button
                className="w-full"
                variant="outline"
                disabled={!walletAddress}
                onClick={() => {
                  if (!walletAddress) return;
                  navigator.clipboard.writeText(walletAddress)
                    .then(() => toast({ title: copy.krakenStep1Copied }))
                    .catch(() => undefined);
                }}
              >
                {copy.krakenStep1CopyCta}
              </Button>
            </div>
            {!walletAddress ? <p className="text-xs text-danger">{copy.krakenStep1Empty}</p> : null}
          </Card>

          <Card className="space-y-2 border-border/70">
            <p className="font-medium">{copy.krakenStep2Title}</p>
            <p className="text-muted">{copy.krakenStep2Body}</p>
            <Input
              value={krakenAmount}
              onChange={(e) => setKrakenAmount(e.target.value)}
              inputMode="decimal"
              placeholder={copy.krakenAmountPlaceholder}
              aria-label={copy.krakenAmountLabel}
            />
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
          </Card>

          <Card className="space-y-3 border-border/70">
            <p className="font-medium">{copy.krakenOptionTitle}</p>
            <div className="space-y-2 rounded-xl border border-border p-3">
              <p className="font-semibold">{copy.krakenOptionA}</p>
              <p className="text-muted">{copy.krakenOptionADesc}</p>
              <a href="https://www.kraken.com/c" target="_blank" rel="noreferrer">
                <Button className="w-full" variant="secondary">{copy.krakenOptionACta}</Button>
              </a>
            </div>
            <div className="space-y-2 rounded-xl border border-border p-3">
              <p className="font-semibold">{copy.krakenOptionB}</p>
              <p className="text-muted">{copy.krakenOptionBDesc}</p>
              <a href="https://perawallet.app/" target="_blank" rel="noreferrer">
                <Button className="w-full" variant="secondary">{copy.krakenOptionBCta}</Button>
              </a>
            </div>
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
