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
import { CURRENCY_OPTIONS, LANGUAGE_OPTIONS } from "@/lib/i18n/locale";
import { AppLocale, AppRegion, usePreferencesStore } from "@/stores/preferences-store";
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
  const fiatCurrency = usePreferencesStore((s) => s.fiatCurrency);
  const setFiatCurrency = usePreferencesStore((s) => s.setFiatCurrency);

  async function saveEndpoints() {
    try {
      const nextAlgod = algodEndpoint
        ? validatePublicHttpsEndpoint(algodEndpoint, t("settings.algodLabel"))
        : null;
      const nextIndexer = indexerEndpoint
        ? validatePublicHttpsEndpoint(indexerEndpoint, t("settings.indexerLabel"))
        : null;

      const customTargets = [nextAlgod, nextIndexer].filter((item): item is string => Boolean(item));
      const hasUntrusted = customTargets.some((origin) => !isTrustedEndpoint(origin));
      if (hasUntrusted && !advancedMode) {
        throw new Error(t("settings.untrustedEndpoint"));
      }

      if (!nextAlgod && !nextIndexer) {
        toast({ title: t("settings.noEndpointChanges") });
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
        title: t("settings.invalidEndpointConfiguration"),
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
          <p className="text-xs text-muted">{t("settings.currentNetwork")}: {t(activeConfig.id === "mainnet" ? "settings.mainnet" : "settings.testnet")}</p>
        </Card>

        <Card className="space-y-3">
          <p className="text-sm font-semibold">{t("settings.language")}</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {LANGUAGE_OPTIONS.map((item) => (
              <Button key={item.code} variant={locale === item.code ? "default" : "secondary"} onClick={() => setLocale(item.code as AppLocale)}>
                {item.name}
              </Button>
            ))}
          </div>
          <p className="text-sm font-semibold">{t("settings.region")}</p>
          <div className="grid grid-cols-3 gap-2">
            {(["US", "BR", "EU", "LATAM", "GLOBAL"] as AppRegion[]).map((item) => (
              <Button key={item} variant={region === item ? "default" : "secondary"} onClick={() => setRegion(item)}>
                {t(`settings.region.${item}`)}
              </Button>
            ))}
          </div>
          <p className="text-sm font-semibold">{t("settings.fiat")}</p>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
            {CURRENCY_OPTIONS.map((item) => (
              <Button key={item.code} variant={fiatCurrency === item.code ? "default" : "secondary"} onClick={() => setFiatCurrency(item.code)}>
                {item.code}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted">{fiatCurrency}</p>
        </Card>

        <Card className="space-y-2">
          <p className="text-sm font-semibold">{t("settings.customEndpoints")}</p>
          <p className="text-xs text-muted">
            {t("settings.trustedHostsHint")}
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
            {t("settings.advancedModeHint")}
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
