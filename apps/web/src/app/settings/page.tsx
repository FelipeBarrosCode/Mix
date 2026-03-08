"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NetworkId } from "@/lib/algorand/network";
import { useNetworkStore } from "@/stores/network-store";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";
import { AppLocale, AppRegion, fiatFromRegion, usePreferencesStore } from "@/stores/preferences-store";
import { useI18n } from "@/hooks/use-i18n";

export default function SettingsPage() {
  const { t } = useI18n();
  const [algodEndpoint, setAlgodEndpoint] = useState("");
  const [indexerEndpoint, setIndexerEndpoint] = useState("");
  const network = useNetworkStore((s) => s.network);
  const setNetwork = useNetworkStore((s) => s.setNetwork);
  const activeConfig = useActiveNetworkConfig();
  const setOverrides = useNetworkStore((s) => s.setOverrides);
  const locale = usePreferencesStore((s) => s.locale);
  const setLocale = usePreferencesStore((s) => s.setLocale);
  const region = usePreferencesStore((s) => s.region);
  const setRegion = usePreferencesStore((s) => s.setRegion);

  return (
    <AppShell>
      <div className="space-y-4">
        <Card className="space-y-3">
          <h1 className="text-xl font-bold">{t("nav.settings")}</h1>
          <div className="flex gap-2">
            <Button variant={network === "testnet" ? "default" : "secondary"} onClick={() => setNetwork("testnet")}>{t("settings.testnet")}</Button>
            <Button variant={network === "mainnet" ? "default" : "secondary"} onClick={() => setNetwork("mainnet")}>{t("settings.mainnet")}</Button>
          </div>
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
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => {
              setOverrides(network as NetworkId, {
                algodEndpoints: algodEndpoint ? [algodEndpoint, ...activeConfig.algodEndpoints] : activeConfig.algodEndpoints,
                indexerEndpoints: indexerEndpoint ? [indexerEndpoint, ...activeConfig.indexerEndpoints] : activeConfig.indexerEndpoints,
              });
              setAlgodEndpoint("");
              setIndexerEndpoint("");
            }}
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
