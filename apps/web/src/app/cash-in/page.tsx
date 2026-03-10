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

const cashInCopy = {
  en: {
    title: "Cash in",
    subtitle: "Custodial flow to cash in via Pera Wallet.",
    flowTitle: "Custodial flow (via Pera Wallet)",
    providersTitle: "Providers that support USDCa (check availability by country)",
    providersEmpty: "No provider match found for your selected region right now. Try changing region in Settings.",
    guideTitle: "Cash-in: exact UI navigation guide",
    guideGoal: "Goal: buy USDCa with bank/card and receive it in your wallet. Follow these screens in order.",
    krakenFlowTitle: "Kraken guided cash-in (recommended)",
    krakenFlowBody: "Follow these buttons in order. Each step opens the correct Kraken page. Return here after each step.",
    krakenStep1Title: "Step 1 - Open Kraken and sign in",
    krakenStep1Body: "Sign in or create account. Complete identity verification if Kraken asks.",
    krakenStep1Cta: "Open Kraken sign in",
    krakenStep2Title: "Step 2 - Link your Pera wallet on Kraken first",
    krakenStep2Body: "Before entering any amount, open Kraken withdrawal settings and add your Pera wallet address for USDC on Algorand.",
    krakenStep2Cta: "Open Kraken withdrawal settings",
    krakenAmountLabel: "Fiat amount to buy",
    krakenAmountPlaceholder: "100.00",
    krakenAmountCopyCta: "Copy amount",
    krakenAmountCopied: "Amount copied",
    krakenAmountInvalid: "Enter a valid amount first",
    krakenStep3Title: "Step 3 - Prepare your Pera wallet address",
    krakenStep3Body: "Copy your Pera wallet address below. You will paste it on Kraken as withdrawal address.",
    krakenStep3Cta: "Copy my Pera address",
    krakenStep3Empty: "Connect Pera Wallet first to copy your address.",
    krakenStep3Copied: "Pera wallet address copied",
    krakenStep4Title: "Step 4 - Enter amount and buy",
    krakenStep4Body: "Now enter your fiat amount, copy it, open Kraken Buy, paste amount, and complete payment.",
    krakenStep4Cta: "Open Kraken buy flow",
    krakenStep5Title: "Step 5 - Withdraw to Pera on Algorand",
    krakenStep5Body: "Withdraw USDC to your saved Pera address using Algorand network. Start with a small test amount first.",
    krakenStep5Cta: "Open Kraken funding",
    krakenSafety: "Critical: if Kraken shows multiple USDC networks, choose Algorand before confirming.",
    mistakesTitle: "Common mistakes to avoid",
    mistakes: [
      "Do not send to the wrong network/address. Always verify first and last 6 characters.",
      "Do a small test purchase first, then do the full amount.",
      "If provider says pending review, wait for verification before repeating actions.",
      "Save order ID + transaction receipt for support and tax records.",
    ],
    noticeTitle: "Mandatory notice",
    notice1: "This website does not provide financial, legal, or tax advice.",
    notice2: "All tax declaration and compliance obligations are fully the user's responsibility.",
    steps: [
      "Open Pera Wallet: go to home screen, tap your account, then tap Receive.",
      "Copy wallet address: tap Copy address. Keep it ready for the provider.",
      "Open custodial provider app/site: sign in, finish identity verification, then go to Buy or Buy Crypto.",
      "Select coin and amount: choose USDCa, enter purchase amount, select payment method (Card or Bank Transfer).",
      "Set receive destination: when provider asks Receive Wallet/Withdrawal Address, paste your Pera address.",
      "Confirm network before final submit: if unsure, stop and re-check before tapping Confirm.",
      "Complete payment: approve bank/card payment and wait for Completed/Sent status.",
      "Verify in Pera: confirm USDCa balance updated.",
    ],
  },
  "pt-BR": {
    title: "Adicionar saldo",
    subtitle: "Fluxo custodial para adicionar saldo via Pera Wallet.",
    flowTitle: "Fluxo custodial (via Pera Wallet)",
    providersTitle: "Provedores que suportam USDCa (consulte disponibilidade por país)",
    providersEmpty: "Nenhum provedor encontrado para sua região selecionada. Tente mudar a região em Configurações.",
    guideTitle: "Entrada: guia exato de navegação na interface",
    guideGoal: "Objetivo: comprar USDCa com banco/cartão e receber na sua carteira. Siga as telas em ordem.",
    krakenFlowTitle: "Fluxo guiado Kraken (recomendado)",
    krakenFlowBody: "Siga estes botões em ordem. Cada etapa abre a tela correta da Kraken. Volte para cá após cada etapa.",
    krakenStep1Title: "Etapa 1 - Abrir Kraken e entrar",
    krakenStep1Body: "Entre ou crie conta. Conclua a verificação de identidade se a Kraken solicitar.",
    krakenStep1Cta: "Abrir login da Kraken",
    krakenStep2Title: "Etapa 2 - Conecte sua Pera na Kraken primeiro",
    krakenStep2Body: "Antes de informar qualquer valor, abra as configurações de saque da Kraken e adicione seu endereço Pera para USDC na Algorand.",
    krakenStep2Cta: "Abrir configuração de saque",
    krakenAmountLabel: "Valor em fiat para comprar",
    krakenAmountPlaceholder: "100,00",
    krakenAmountCopyCta: "Copiar valor",
    krakenAmountCopied: "Valor copiado",
    krakenAmountInvalid: "Informe um valor válido primeiro",
    krakenStep3Title: "Etapa 3 - Preparar endereço da Pera",
    krakenStep3Body: "Copie seu endereço da Pera abaixo. Você vai colar esse endereço na Kraken para saque.",
    krakenStep3Cta: "Copiar meu endereço Pera",
    krakenStep3Empty: "Conecte a Pera Wallet primeiro para copiar o endereço.",
    krakenStep3Copied: "Endereço da Pera copiado",
    krakenStep4Title: "Etapa 4 - Informe valor e compre",
    krakenStep4Body: "Agora informe o valor em fiat, copie, abra Comprar na Kraken, cole o valor e conclua o pagamento.",
    krakenStep4Cta: "Abrir compra na Kraken",
    krakenStep5Title: "Etapa 5 - Sacar para Pera na Algorand",
    krakenStep5Body: "Saque USDC para seu endereço Pera salvo usando rede Algorand. Comece com um valor teste pequeno.",
    krakenStep5Cta: "Abrir funding da Kraken",
    krakenSafety: "Crítico: se a Kraken mostrar várias redes para USDC, escolha Algorand antes de confirmar.",
    mistakesTitle: "Erros comuns para evitar",
    mistakes: [
      "Não envie para rede/endereço errado. Sempre confira os 6 primeiros e 6 últimos caracteres.",
      "Faça primeiro uma compra teste pequena e depois o valor total.",
      "Se o provedor indicar revisão pendente, aguarde a verificação antes de repetir ações.",
      "Guarde ID do pedido + comprovante para suporte e impostos.",
    ],
    noticeTitle: "Aviso obrigatório",
    notice1: "Este site não fornece aconselhamento financeiro, jurídico ou tributário.",
    notice2: "Toda obrigação fiscal e de compliance é totalmente do usuário.",
    steps: [
      "Abra a Pera Wallet: na tela inicial, toque na conta e depois em Receber.",
      "Copie o endereço da carteira: toque em Copiar endereço.",
      "Abra o app/site do provedor custodial: entre, conclua a verificação e vá para Comprar/Comprar Cripto.",
      "Selecione moeda e valor: escolha USDCa, informe valor e método de pagamento (Cartão ou Transferência).",
      "Defina destino de recebimento: quando pedir endereço de recebimento/saque, cole seu endereço Pera.",
      "Confirme a rede antes de enviar.",
      "Conclua o pagamento e aguarde status Concluído/Enviado.",
      "Verifique na Pera se o saldo de USDCa foi atualizado.",
    ],
  },
  es: {
    title: "Ingresar",
    subtitle: "Flujo custodial para ingresar vía Pera Wallet.",
    flowTitle: "Flujo custodial (vía Pera Wallet)",
    providersTitle: "Proveedores compatibles con USDCa (revisa disponibilidad por país)",
    providersEmpty: "No se encontraron proveedores para tu región seleccionada. Cambia la región en Ajustes.",
    guideTitle: "Entrada: guía exacta de navegación de interfaz",
    guideGoal: "Objetivo: comprar USDCa con banco/tarjeta y recibirlo en tu billetera.",
    krakenFlowTitle: "Flujo guiado Kraken (recomendado)",
    krakenFlowBody: "Sigue estos botones en orden. Cada paso abre la pantalla correcta de Kraken. Regresa aquí después de cada paso.",
    krakenStep1Title: "Paso 1 - Abre Kraken e inicia sesión",
    krakenStep1Body: "Inicia sesión o crea cuenta. Completa verificación si Kraken la solicita.",
    krakenStep1Cta: "Abrir inicio de sesión",
    krakenStep2Title: "Paso 2 - Vincula tu Pera en Kraken primero",
    krakenStep2Body: "Antes de ingresar cualquier monto, abre ajustes de retiro en Kraken y agrega tu dirección Pera para USDC en Algorand.",
    krakenStep2Cta: "Abrir ajustes de retiro",
    krakenAmountLabel: "Monto fiat para comprar",
    krakenAmountPlaceholder: "100.00",
    krakenAmountCopyCta: "Copiar monto",
    krakenAmountCopied: "Monto copiado",
    krakenAmountInvalid: "Ingresa un monto válido primero",
    krakenStep3Title: "Paso 3 - Prepara tu dirección de Pera",
    krakenStep3Body: "Copia tu dirección de Pera abajo. La pegarás en Kraken como dirección de retiro.",
    krakenStep3Cta: "Copiar mi dirección Pera",
    krakenStep3Empty: "Conecta Pera Wallet primero para copiar tu dirección.",
    krakenStep3Copied: "Dirección de Pera copiada",
    krakenStep4Title: "Paso 4 - Ingresa monto y compra",
    krakenStep4Body: "Ahora ingresa monto fiat, cópialo, abre Compra en Kraken, pega el monto y completa el pago.",
    krakenStep4Cta: "Abrir compra en Kraken",
    krakenStep5Title: "Paso 5 - Retira a Pera en Algorand",
    krakenStep5Body: "Retira USDC a tu dirección Pera guardada usando red Algorand. Empieza con un monto de prueba pequeño.",
    krakenStep5Cta: "Abrir funding de Kraken",
    krakenSafety: "Crítico: si Kraken muestra varias redes para USDC, elige Algorand antes de confirmar.",
    mistakesTitle: "Errores comunes a evitar",
    mistakes: [
      "No envíes a red/dirección incorrecta. Verifica primeros y últimos 6 caracteres.",
      "Haz primero una compra de prueba pequeña.",
      "Si el proveedor marca revisión pendiente, espera antes de repetir acciones.",
      "Guarda ID de orden y recibo para soporte e impuestos.",
    ],
    noticeTitle: "Aviso obligatorio",
    notice1: "Este sitio no ofrece asesoría financiera, legal ni fiscal.",
    notice2: "Toda obligación fiscal y de cumplimiento es responsabilidad total del usuario.",
    steps: [
      "Abre Pera Wallet: en inicio, toca tu cuenta y luego Recibir.",
      "Copia dirección de tu billetera.",
      "Abre el proveedor custodial y completa verificación.",
      "Selecciona USDCa, monto y método de pago.",
      "Pega tu dirección de Pera como destino.",
      "Confirma red antes de enviar.",
      "Completa pago y espera estado Completado/Enviado.",
      "Verifica en Pera el saldo de USDCa.",
    ],
  },
} as const;

export default function CashInPage() {
  const { locale } = useI18n();
  const { toast } = useToast();
  const walletAddress = useWalletStore((s) => s.activeAddress);
  const [krakenAmount, setKrakenAmount] = useState("");
  const copy = cashInCopy[locale] ?? cashInCopy.en;
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
