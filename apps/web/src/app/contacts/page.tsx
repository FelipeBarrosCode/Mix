"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/use-i18n";
import { parseMixUri } from "@/features/qr/uri";
import { isAlgoName, isValidAlgorandAddress } from "@/lib/validation/address";
import { useContactsStore } from "@/stores/contacts-store";
import { useToast } from "@/hooks/use-toast";

type ContactForm = {
  label: string;
  target: string;
};

function short(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

function resolveContactTarget(rawTarget: string) {
  const target = rawTarget.trim();
  if (!target) {
    throw new Error("invalid_target");
  }

  if (isValidAlgorandAddress(target)) {
    return { address: target, algoName: undefined as string | undefined };
  }

  if (isAlgoName(target)) {
    return { address: target, algoName: target };
  }

  const parsed = parseMixUri(target);
  if (parsed.type !== "pay") {
    throw new Error("invalid_target");
  }

  return {
    address: parsed.to,
    algoName: isAlgoName(parsed.to) ? parsed.to : undefined,
  };
}

export default function ContactsPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const contacts = useContactsStore((s) => s.contacts);
  const add = useContactsStore((s) => s.add);
  const remove = useContactsStore((s) => s.remove);
  const form = useForm<ContactForm>();

  return (
    <AppShell>
      <Card className="space-y-3">
        <h1 className="text-xl font-bold">{t("contacts.title")}</h1>
        <p className="text-xs text-muted">{t("contacts.singlePageHint")}</p>

        <form
          className="space-y-2"
          onSubmit={form.handleSubmit((values) => {
            try {
              const resolved = resolveContactTarget(values.target);
              add({
                label: values.label.trim(),
                address: resolved.address,
                algoName: resolved.algoName,
                notes: t("contacts.savedFromUnifiedForm"),
                lastUsedAt: new Date().toISOString(),
              });
              form.reset();
            } catch {
              toast({ title: t("contacts.invalidTargetTitle"), description: t("contacts.invalidTargetDescription"), variant: "danger" });
            }
          })}
        >
          <Input placeholder={t("contacts.labelPlaceholder")} {...form.register("label", { required: true })} />
          <Input
            placeholder={t("contacts.targetPlaceholder")}
            {...form.register("target", { required: true })}
          />
          <Button className="w-full">{t("contacts.add")}</Button>
        </form>

        <div className="space-y-2">
          {contacts.length === 0 ? <p className="text-sm text-muted">{t("contacts.empty")}</p> : null}
          {contacts.map((contact) => (
            <div key={contact.id} className="rounded-xl border border-border p-3">
              <p className="font-semibold">{contact.label}</p>
              <p className="break-all text-xs text-muted">{contact.address}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href={`/send?to=${encodeURIComponent(contact.address)}`}>
                  <Button className="w-full" variant="secondary">{t("contacts.sendTo")}</Button>
                </Link>
                <Button className="w-full" variant="outline" onClick={() => remove(contact.id)}>
                  {t("contacts.remove")}
                </Button>
              </div>
              {!isAlgoName(contact.address) && isValidAlgorandAddress(contact.address) ? (
                <p className="mt-2 text-xs text-muted">{short(contact.address)}</p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
