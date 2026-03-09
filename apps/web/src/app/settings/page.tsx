"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_NETWORK, NetworkId } from "@/lib/algorand/network";
import {
  isTrustedEndpoint,
  probeAlgodEndpoint,
  probeIndexerEndpoint,
  validatePublicHttpsEndpoint,
} from "@/lib/algorand/endpoint-validation";
import { useNetworkStore } from "@/stores/network-store";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";
import { AppLocale, AppRegion, fiatFromRegion, usePreferencesStore } from "@/stores/preferences-store";
import { useI18n } from "@/hooks/use-i18n";

export default function SettingsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [algodEndpoint, setAlgodEndpoint] = useState("");
  const [indexerEndpoint, setIndexerEndpoint] = useState("");
  const [advancedMode, setAdvancedMode] = useState(false);
  const activeConfig = useActiveNetworkConfig();
  const setOverrides = useNetworkStore((s) => s.setOverrides);
  const locale = usePreferencesStore((s) => s.locale);
  const setLocale = usePreferencesStore((s) => s.setLocale);
  const region = usePreferencesStore((s) => s.region);
  const setRegion = usePreferencesStore((s) => s.setRegion);

  async function saveEndpoints() {
    try {
      const nextAlgod = algodEndpoint
        ? validatePublicHttpsEndpoint(algodEndpoint, "Algod")
        : null;
      const nextIndexer = indexerEndpoint
        ? validatePublicHttpsEndpoint(indexerEndpoint, "Indexer")
        : null;

      const customTargets = [nextAlgod, nextIndexer].filter((item): item is string => Boolean(item));
      const hasUntrusted = customTargets.some((origin) => !isTrustedEndpoint(origin));
      if (hasUntrusted && !advancedMode) {
        throw new Error("Custom endpoint host is not in trusted list. Enable advanced mode to continue.");
      }

      if (!nextAlgod && !nextIndexer) {
        toast({ title: "No endpoint changes to save" });
        return;
      }

      if (nextAlgod) {
        await probeAlgodEndpoint(nextAlgod);
      }
      if (nextIndexer) {
        await probeIndexerEndpoint(nextIndexer);
      }

      setOverrides(DEFAULT_NETWORK as NetworkId, {
        algodEndpoints: nextAlgod ? [nextAlgod, ...activeConfig.algodEndpoints] : activeConfig.algodEndpoints,
        indexerEndpoints: nextIndexer ? [nextIndexer, ...activeConfig.indexerEndpoints] : activeConfig.indexerEndpoints,
      });

      setAlgodEndpoint("");
      setIndexerEndpoint("");
      toast({ title: t("settings.saveEndpoints") });
    } catch (error) {
      toast({
        title: "Invalid endpoint configuration",
        description: error instanceof Error ? error.message : t("common.unknownError"),
        variant: "danger",
      });
    }
  }

  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="space-y-3">
          <h1 className="text-xl font-bold">{t("nav.settings")}</h1>
          <p className="text-xs text-muted">{t("settings.currentNetwork")}: {activeConfig.label}</p>
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-semibold">{t("settings.language")}</p>
          <div className="grid grid-cols-3 gap-2">
            {(["en", "pt-BR", "es"] as AppLocale[]).map((item) => (
              <Button key={item} variant={locale === item ? "default" : "secondary"} onClick={() => setLocale(item)}>
                {item}
              </Button>
            ))}
          </div>
          <p className="text-sm font-semibold">{t("settings.region")}</p>
          <div className="grid grid-cols-3 gap-2">
            {(["US", "BR", "EU", "LATAM", "GLOBAL"] as AppRegion[]).map((item) => (
              <Button key={item} variant={region === item ? "default" : "secondary"} onClick={() => setRegion(item)}>
                {item}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted">{t("settings.fiat")}: {fiatFromRegion(region)}</p>
        </Card>

        <Card className="space-y-2">
          <p className="text-sm font-semibold">{t("settings.customEndpoints")}</p>
          <p className="text-xs text-muted">
            Trusted hosts: algonode.cloud and nodely.dev. Use advanced mode for any other host.
          </p>
          <Input
            placeholder={activeConfig.algodEndpoints[0]}
            value={algodEndpoint}
            onChange={(e) => setAlgodEndpoint(e.target.value)}
          />
          <Input
            placeholder={activeConfig.indexerEndpoints[0]}
            value={indexerEndpoint}
            onChange={(e) => setIndexerEndpoint(e.target.value)}
          />
          <label className="flex items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={advancedMode}
              onChange={(e) => setAdvancedMode(e.target.checked)}
            />
            Advanced mode: allow non-trusted RPC hosts (higher risk)
          </label>
          <Button
            className="w-full"
            variant="secondary"
            onClick={saveEndpoints}
          >
            {t("settings.saveEndpoints")}
          </Button>
        </Card>

        <Card className="space-y-2 text-sm text-muted">
          <p className="font-semibold text-fg">{t("settings.important")}</p>
          <p>{t("settings.disclaimer1")}</p>
          <p>{t("settings.disclaimer2")}</p>
          <p>{t("settings.disclaimer3")}</p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Link href="/cash-in"><Button className="w-full" variant="secondary">{t("settings.cashInOptions")}</Button></Link>
            <Link href="/cash-out"><Button className="w-full" variant="secondary">{t("settings.cashOutOptions")}</Button></Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
