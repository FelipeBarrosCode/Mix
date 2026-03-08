"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { QrScannerView } from "@/features/qr/scanner";
import { parseMixUri } from "@/features/qr/uri";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/hooks/use-i18n";

export default function ScanPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { toast } = useToast();

  return (
    <AppShell>
      <Card className="space-y-3">
        <h1 className="text-xl font-bold">{t("scan.title")}</h1>
        <QrScannerView
          onResult={(value) => {
            try {
              const parsed = parseMixUri(value);
              if (parsed.type === "pay") {
                const params = new URLSearchParams();
                params.set("to", parsed.to);
                if (parsed.amount) params.set("amount", parsed.amount);
                if (parsed.note) params.set("note", parsed.note);
                router.push(`/send?${params.toString()}`);
                return;
              }
              throw new Error("Unsupported payload");
            } catch {
              toast({ title: t("scan.invalidPayload"), variant: "danger" });
            }
          }}
        />
      </Card>
    </AppShell>
  );
}
