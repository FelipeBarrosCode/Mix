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

const cashOutCopy = {
  en: {
    title: "Cash out",
    subtitle: "Custodial flow to cash out from Pera Wallet.",
    flowTitle: "Custodial flow (via Pera Wallet)",
    providersTitle: "Providers that support USDCa (check availability by country)",
    providersEmpty: "No provider match found for your selected region right now. Try changing region in Settings.",
    guideTitle: "Cash-out: exact UI navigation guide",
    guideGoal: "Goal: sell USDCa and receive fiat in your bank/card account. Follow these screens in order.",
    krakenFlowTitle: "Kraken guided cash-out (recommended)",
    krakenFlowBody: "Do these steps in order. If the user is non-technical, complete one step and return here before moving on.",
    krakenStep1Title: "Step 1 - Link your Pera wallet to Kraken",
    krakenStep1Body: "Open Kraken withdrawal/deposit settings and save your Pera wallet address with Algorand network.",
    krakenStep1Cta: "Open Kraken funding settings",
    krakenStep1CopyCta: "Copy my Pera address",
    krakenStep1Empty: "Connect Pera Wallet first to copy your address.",
    krakenStep1Copied: "Pera wallet address copied",
    krakenStep2Title: "Step 2 - Enter fiat target and copy amount",
    krakenStep2Body: "Type the fiat amount you want to cash out. Copy and paste this amount inside Kraken sell flow.",
    krakenAmountLabel: "Fiat cash-out target",
    krakenAmountPlaceholder: "100.00",
    krakenAmountCopyCta: "Copy amount",
    krakenAmountCopied: "Amount copied",
    krakenAmountInvalid: "Enter a valid amount first",
    krakenOptionTitle: "Step 3 - Choose one cash-out option",
    krakenOptionA: "Option A: Cash out on Kraken interface",
    krakenOptionADesc: "Deposit USDCa to Kraken (Algorand), sell to fiat, then withdraw to bank/card.",
    krakenOptionACta: "Open Kraken cash-out flow",
    krakenOptionB: "Option B: Use Pera Card",
    krakenOptionBDesc: "Use Pera Card route for direct spending without Kraken sell flow.",
    krakenOptionBCta: "Open Pera Card",
    krakenSafety: "Critical: always confirm Algorand network for USDCa transfers.",
    mistakesTitle: "Common mistakes to avoid",
    mistakes: [
      "Never send USDCa to a deposit address on the wrong network.",
      "Always test with a small amount first if this is your first cash-out.",
      "Do not sell before provider confirms deposit is available.",
      "Save txid, provider order ID, and payout receipt for records.",
    ],
    noticeTitle: "Mandatory notice",
    notice1: "This website does not provide financial, legal, or tax advice.",
    notice2: "All tax declaration and compliance obligations are fully the user's responsibility.",
    steps: [
      "Open custodial provider: sign in and go to Deposit or Receive Crypto.",
      "Choose asset and network: select USDCa and copy provider deposit address.",
      "Open Pera Wallet: tap Send, choose USDCa asset, paste provider address.",
      "Enter amount and review, then confirm.",
      "Approve transfer in wallet and keep transaction ID.",
      "Wait provider credit from Pending to Available.",
      "Sell to fiat and confirm quote/fees.",
      "Withdraw to bank/card payout account.",
      "Confirm payout and save receipts.",
    ],
  },
  "pt-BR": {
    title: "Sacar",
    subtitle: "Fluxo custodial para sacar da Pera Wallet.",
    flowTitle: "Fluxo custodial (via Pera Wallet)",
    providersTitle: "Provedores que suportam USDCa (consulte disponibilidade por país)",
    providersEmpty: "Nenhum provedor encontrado para sua região selecionada. Tente mudar a região em Configurações.",
    guideTitle: "Saída: guia exato de navegação na interface",
    guideGoal: "Objetivo: vender USDCa e receber fiat em banco/cartão.",
    krakenFlowTitle: "Fluxo guiado Kraken para saque (recomendado)",
    krakenFlowBody: "Siga as etapas em ordem. Para usuários não técnicos, conclua uma etapa por vez e volte para esta tela.",
    krakenStep1Title: "Etapa 1 - Vincule sua Pera na Kraken",
    krakenStep1Body: "Abra configurações de depósito/saque da Kraken e salve seu endereço Pera com rede Algorand.",
    krakenStep1Cta: "Abrir configurações de funding",
    krakenStep1CopyCta: "Copiar meu endereço Pera",
    krakenStep1Empty: "Conecte a Pera Wallet primeiro para copiar o endereço.",
    krakenStep1Copied: "Endereço da Pera copiado",
    krakenStep2Title: "Etapa 2 - Informe valor em fiat e copie",
    krakenStep2Body: "Digite o valor em fiat que deseja sacar. Copie e cole esse valor no fluxo de venda da Kraken.",
    krakenAmountLabel: "Meta de saque em fiat",
    krakenAmountPlaceholder: "100,00",
    krakenAmountCopyCta: "Copiar valor",
    krakenAmountCopied: "Valor copiado",
    krakenAmountInvalid: "Informe um valor válido primeiro",
    krakenOptionTitle: "Etapa 3 - Escolha uma opção de saída",
    krakenOptionA: "Opção A: Sacar pela interface da Kraken",
    krakenOptionADesc: "Deposite USDCa na Kraken (Algorand), venda para fiat e saque para banco/cartão.",
    krakenOptionACta: "Abrir fluxo de saque Kraken",
    krakenOptionB: "Opção B: Usar Pera Card",
    krakenOptionBDesc: "Use a rota do Pera Card para gasto direto sem fluxo de venda na Kraken.",
    krakenOptionBCta: "Abrir Pera Card",
    krakenSafety: "Crítico: sempre confirme a rede Algorand nas transferências de USDCa.",
    mistakesTitle: "Erros comuns para evitar",
    mistakes: [
      "Nunca envie USDCa para endereço de depósito na rede errada.",
      "Sempre faça teste com valor pequeno na primeira saída.",
      "Não venda antes de o provedor confirmar o depósito.",
      "Guarde txid, ID do pedido e comprovante de saque.",
    ],
    noticeTitle: "Aviso obrigatório",
    notice1: "Este site não fornece aconselhamento financeiro, jurídico ou tributário.",
    notice2: "Toda obrigação fiscal e de compliance é totalmente do usuário.",
    steps: [
      "Abra o provedor custodial e vá para Depósito/Receber Cripto.",
      "Escolha USDCa e rede, copie o endereço de depósito.",
      "Abra a Pera Wallet, toque em Enviar e cole o endereço.",
      "Informe valor, revise e confirme.",
      "Aprove a transferência e guarde o txid.",
      "Aguarde o status passar de Pendente para Disponível.",
      "Venda para fiat e confirme cotação/taxas.",
      "Saque para conta bancária/cartão.",
      "Confirme o recebimento e guarde comprovantes.",
    ],
  },
  es: {
    title: "Retirar",
    subtitle: "Flujo custodial para retirar desde Pera Wallet.",
    flowTitle: "Flujo custodial (vía Pera Wallet)",
    providersTitle: "Proveedores compatibles con USDCa (revisa disponibilidad por país)",
    providersEmpty: "No se encontraron proveedores para tu región seleccionada. Cambia la región en Ajustes.",
    guideTitle: "Retiro: guía exacta de navegación",
    guideGoal: "Objetivo: vender USDCa y recibir fiat en banco/tarjeta.",
    krakenFlowTitle: "Flujo guiado Kraken para retiro (recomendado)",
    krakenFlowBody: "Haz estos pasos en orden. Para usuarios no técnicos, completa un paso y vuelve aquí antes del siguiente.",
    krakenStep1Title: "Paso 1 - Vincula tu Pera con Kraken",
    krakenStep1Body: "Abre ajustes de depósito/retiro en Kraken y guarda tu dirección Pera con red Algorand.",
    krakenStep1Cta: "Abrir ajustes de funding",
    krakenStep1CopyCta: "Copiar mi dirección Pera",
    krakenStep1Empty: "Conecta Pera Wallet primero para copiar tu dirección.",
    krakenStep1Copied: "Dirección de Pera copiada",
    krakenStep2Title: "Paso 2 - Ingresa monto fiat y copia",
    krakenStep2Body: "Escribe el monto fiat que quieres retirar. Copia y pega este monto en el flujo de venta de Kraken.",
    krakenAmountLabel: "Meta de retiro en fiat",
    krakenAmountPlaceholder: "100.00",
    krakenAmountCopyCta: "Copiar monto",
    krakenAmountCopied: "Monto copiado",
    krakenAmountInvalid: "Ingresa un monto válido primero",
    krakenOptionTitle: "Paso 3 - Elige una opción de salida",
    krakenOptionA: "Opción A: Retirar en interfaz Kraken",
    krakenOptionADesc: "Deposita USDCa en Kraken (Algorand), vende a fiat y retira a banco/tarjeta.",
    krakenOptionACta: "Abrir flujo de retiro Kraken",
    krakenOptionB: "Opción B: Usar Pera Card",
    krakenOptionBDesc: "Usa la ruta de Pera Card para gasto directo sin flujo de venta en Kraken.",
    krakenOptionBCta: "Abrir Pera Card",
    krakenSafety: "Crítico: confirma siempre red Algorand en transferencias de USDCa.",
    mistakesTitle: "Errores comunes a evitar",
    mistakes: [
      "Nunca envíes USDCa a una red de depósito incorrecta.",
      "Haz una prueba con monto pequeño en tu primer retiro.",
      "No vendas antes de que el proveedor confirme depósito.",
      "Guarda txid, ID de orden y recibo.",
    ],
    noticeTitle: "Aviso obligatorio",
    notice1: "Este sitio no ofrece asesoría financiera, legal ni fiscal.",
    notice2: "Toda obligación fiscal y de cumplimiento es responsabilidad total del usuario.",
    steps: [
      "Abre el proveedor custodial y ve a Depósito/Recibir Cripto.",
      "Elige USDCa y red, copia la dirección de depósito.",
      "Abre Pera Wallet, toca Enviar y pega la dirección.",
      "Ingresa monto, revisa y confirma.",
      "Aprueba transferencia y guarda txid.",
      "Espera estado de Pendiente a Disponible.",
      "Vende a fiat y confirma cotización/comisiones.",
      "Retira a banco/tarjeta.",
      "Confirma recepción y guarda comprobantes.",
    ],
  },
} as const;

export default function CashOutPage() {
  const { locale } = useI18n();
  const { toast } = useToast();
  const walletAddress = useWalletStore((s) => s.activeAddress);
  const [krakenAmount, setKrakenAmount] = useState("");
  const copy = cashOutCopy[locale] ?? cashOutCopy.en;
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
