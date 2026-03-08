"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDownToLine, ArrowUpToLine, BookUser, Home, LineChart, QrCode, Send, Settings } from "lucide-react";
import { PropsWithChildren, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/stores/wallet-store";
import { useNetworkStore } from "@/stores/network-store";
import { usePreferencesStore } from "@/stores/preferences-store";
import { useI18n } from "@/hooks/use-i18n";
import { useActiveNetworkConfig } from "@/hooks/use-active-network";
import { useProfileStore } from "@/stores/profile-store";
import { WalletAccessGate } from "@/components/wallet-access-gate";
import { useTrackIncomingUsdc } from "@/hooks/use-track-incoming-usdc";

const mobileNav = [
  { href: "/home", key: "nav.home", icon: Home },
  { href: "/send", key: "nav.send", icon: Send },
  { href: "/receive", key: "nav.receive", icon: QrCode },
  { href: "/contacts", key: "nav.contacts", icon: BookUser },
  { href: "/cash", key: "nav.cash", icon: ArrowDownToLine },
  { href: "/investments", key: "nav.investments", icon: LineChart },
];

const desktopNav = [
  { href: "/home", key: "nav.home", icon: Home },
  { href: "/send", key: "nav.send", icon: Send },
  { href: "/receive", key: "nav.receive", icon: QrCode },
  { href: "/contacts", key: "nav.contacts", icon: BookUser },
  { href: "/cash-in", key: "nav.cashIn", icon: ArrowDownToLine },
  { href: "/cash-out", key: "nav.cashOut", icon: ArrowUpToLine },
  { href: "/investments", key: "nav.investments", icon: LineChart },
  { href: "/settings", key: "nav.settings", icon: Settings },
];

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const reconnect = useWalletStore((s) => s.reconnect);
  const walletLoading = useWalletStore((s) => s.loading);
  const hydrateNetwork = useNetworkStore((s) => s.hydrate);
  const hydratePreferences = usePreferencesStore((s) => s.hydrate);
  const activeAddress = useWalletStore((s) => s.activeAddress);
  const connected = useWalletStore((s) => s.connected);
  const hydrateProfile = useProfileStore((s) => s.hydrate);
  const hasSeenIntro = useProfileStore((s) => s.hasSeenIntro);
  const network = useActiveNetworkConfig();
  const { t, helpVideoUrl } = useI18n();
  const [helpOpen, setHelpOpen] = useState(false);

  const helpEmbedUrl = useMemo(() => {
    try {
      const url = new URL(helpVideoUrl);
      if (url.hostname === "youtu.be") {
        const id = url.pathname.replace(/^\//, "");
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.hostname.includes("youtube.com")) {
        const id = url.searchParams.get("v");
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      return helpVideoUrl;
    } catch {
      return helpVideoUrl;
    }
  }, [helpVideoUrl]);

  function openHelp() {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    if (isMobile) {
      window.location.href = helpVideoUrl;
      return;
    }
    setHelpOpen(true);
  }

  useTrackIncomingUsdc({ address: activeAddress, usdcAssetId: network.usdcAssetId });

  useEffect(() => {
    hydrateNetwork();
    hydratePreferences();
    hydrateProfile();
    reconnect().catch(() => undefined);
  }, [reconnect, hydrateNetwork, hydratePreferences, hydrateProfile]);

  const shortWallet = activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-6)}` : "Not connected";
  const gateLocked = !connected || !hasSeenIntro;

  return (
    <div className="min-h-screen pb-20 lg:pb-0">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col lg:max-w-7xl lg:flex-row lg:gap-6 lg:px-6">
        <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-64 lg:flex-col lg:gap-2 lg:border-r lg:border-border lg:py-8">
          <div className="mb-4 px-3">
            <p className="text-2xl font-extrabold">Mix</p>
            <p className="text-xs text-muted">{t("shell.subtitle")}</p>
          </div>
          {desktopNav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "mx-2 flex items-center gap-3 rounded-xl px-3 py-2 text-sm",
                  active ? "bg-accent/15 text-accent" : "text-muted hover:bg-card hover:text-fg",
                )}
              >
                <Icon size={18} />
                {t(item.key)}
              </Link>
            );
          })}
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="hidden items-center justify-between border-b border-border py-4 lg:flex">
            <p className="text-sm text-muted">{network.label}</p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openHelp}
                className="rounded-full border border-border px-2 py-1 text-sm text-muted hover:text-fg"
                aria-label={t("help.open")}
              >
                ?
              </button>
              <p className="text-sm font-medium">{activeAddress ? shortWallet : t("wallet.notConnected")}</p>
            </div>
          </header>
          <main className="flex-1 p-4 pt-16 lg:p-8 lg:pt-8">
            {walletLoading ? null : gateLocked ? <WalletAccessGate /> : children}
          </main>
        </div>
      </div>

      <Link
        href="/settings"
        className={cn(
          "fixed right-4 top-4 z-40 rounded-full border border-border bg-card/95 p-2 text-muted shadow-sm backdrop-blur lg:hidden",
          pathname.startsWith("/settings") ? "text-accent" : "",
          gateLocked && "hidden",
        )}
        aria-label={t("nav.settings")}
      >
        <Settings size={18} />
      </Link>

      <button
        type="button"
        onClick={openHelp}
        className={cn(
          "fixed left-4 top-4 z-40 rounded-full border border-border bg-card/95 p-2 text-muted shadow-sm backdrop-blur lg:hidden",
          gateLocked && "hidden",
        )}
        aria-label={t("help.open")}
      >
        <span className="block w-[18px] text-center text-sm font-semibold leading-none">?</span>
      </button>

      <nav className={cn("fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden", gateLocked && "hidden")}> 
        <div className="mx-auto grid max-w-md grid-cols-6">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2 text-xs",
                  active ? "text-accent" : "text-muted",
                )}
              >
                <Icon size={18} />
                {t(item.key)}
              </Link>
            );
          })}
        </div>
      </nav>

      {helpOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-3xl space-y-3 rounded-2xl border border-border bg-card p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{t("help.videoTitle")}</p>
              <Button variant="outline" onClick={() => setHelpOpen(false)}>{t("help.close")}</Button>
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
              <iframe
                className="h-full w-full"
                src={helpEmbedUrl}
                title={t("help.videoTitle")}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
