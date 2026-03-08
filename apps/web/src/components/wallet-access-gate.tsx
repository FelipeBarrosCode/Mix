"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/hooks/use-i18n";
import { resolveAlgoName } from "@/lib/algorand/nfdOnChain";
import { useToast } from "@/hooks/use-toast";
import { useProfileStore } from "@/stores/profile-store";
import { useWalletStore } from "@/stores/wallet-store";

export function WalletAccessGate() {
  const { t } = useI18n();
  const { toast } = useToast();
  const connected = useWalletStore((s) => s.connected);
  const activeAddress = useWalletStore((s) => s.activeAddress);
  const connect = useWalletStore((s) => s.connect);
  const disconnect = useWalletStore((s) => s.disconnect);
  const loadingWallet = useWalletStore((s) => s.loading);

  const hasSeenIntro = useProfileStore((s) => s.hasSeenIntro);
  const setSeenIntro = useProfileStore((s) => s.setSeenIntro);
  const setAlgoVerified = useProfileStore((s) => s.setAlgoVerified);
  const clearAlgoVerified = useProfileStore((s) => s.clearAlgoVerified);

  const [algoName, setAlgoNameInput] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function verifyAlgo(event: FormEvent) {
    event.preventDefault();
    if (!activeAddress) return;
    if (!algoName.trim()) {
      toast({ title: t("gate.optionalSkipHint") });
      return;
    }
    try {
      setVerifying(true);
      const resolved = await resolveAlgoName(algoName);
      if (resolved.address !== activeAddress) {
        throw new Error(t("gate.algoMismatch"));
      }
      setAlgoVerified(resolved.name, resolved.address);
      toast({ title: t("gate.algoVerified") });
    } catch (error) {
      toast({
        title: t("gate.algoVerifyFailed"),
        description: error instanceof Error ? error.message : t("common.unknownError"),
        variant: "danger",
      });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center">
      <Card className="w-full space-y-4">
        <h1 className="text-2xl font-extrabold">Mix</h1>
        {!connected ? (
          <>
            <p className="text-sm text-muted">{t("gate.introText")}</p>
            <p className="text-xs text-muted">{t("gate.introSafety")}</p>
            <Button className="w-full" onClick={() => connect()} disabled={loadingWallet}>
              {loadingWallet ? t("gate.connecting") : t("wallet.connect")}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">{t("gate.connectedIntro")}</p>
            <p className="text-xs text-muted">{t("gate.connectedIntro2")}</p>
            <p className="text-sm text-muted">{t("gate.algoOptional")}</p>
            <form className="space-y-3" onSubmit={verifyAlgo}>
              <div>
                <Label>{t("gate.algoLabel")}</Label>
                <Input
                  value={algoName}
                  onChange={(e) => setAlgoNameInput(e.target.value)}
                  placeholder="name.algo"
                />
              </div>
              <Button className="w-full" disabled={verifying} type="submit">
                {verifying ? t("gate.verifying") : t("gate.verifyOptional")}
              </Button>
            </form>
            <Button className="w-full" onClick={() => setSeenIntro(true)}>
              {hasSeenIntro ? t("gate.enterApp") : t("gate.continueSetup")}
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => disconnect()}>
              {t("wallet.disconnect")}
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                clearAlgoVerified();
                setAlgoNameInput("");
                toast({ title: t("gate.algoCleared") });
              }}
            >
              {t("gate.clearAlgo")}
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
