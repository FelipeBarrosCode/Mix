"use client";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { listProviders } from "@/features/cash/providers";
import { useI18n } from "@/hooks/use-i18n";
import { usePreferencesStore } from "@/stores/preferences-store";

const cashOutCopy = {
  en: {
    title: "Cash out",
    subtitle: "Educational custodial flow to cash out from Pera Wallet.",
    educationTitle: "Educational purpose only",
    educationBody1: "This website is for educational purposes only. It is not financial, legal, accounting, or tax advice.",
    educationBody2: "All tax declaration, reporting, and compliance obligations are fully the user's responsibility.",
    educationBody3: "Returns are not guaranteed. Volatility and yearly yield change over time and depend on strategy and lending type used on each platform.",
    flowTitle: "Custodial flow (educational, via Pera Wallet)",
    providersTitle: "Providers that support USDCa (check availability by country)",
    providersEmpty: "No provider match found for your selected region right now. Try changing region in Settings.",
    guideTitle: "Cash-out: exact UI navigation guide",
    guideGoal: "Goal: sell USDCa and receive fiat in your bank/card account. Follow these screens in order.",
    mistakesTitle: "Common mistakes to avoid",
    mistakes: [
      "Never send USDCa to a deposit address on the wrong network.",
      "Always test with a small amount first if this is your first cash-out.",
      "Do not sell before provider confirms deposit is available.",
      "Save txid, provider order ID, and payout receipt for records.",
    ],
    noticeTitle: "Mandatory notice",
    notice1: "Educational use only. This website does not provide financial, legal, or tax advice.",
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
    subtitle: "Fluxo custodial educacional para sacar da Pera Wallet.",
    educationTitle: "Somente para fins educacionais",
    educationBody1: "Este site é apenas educacional. Não é aconselhamento financeiro, jurídico, contábil ou tributário.",
    educationBody2: "Toda obrigação de declaração, reporte e compliance fiscal é totalmente do usuário.",
    educationBody3: "Rentabilidade não é garantida. Volatilidade e rendimento anual mudam com o tempo e dependem da estratégia e do tipo de lending usado em cada plataforma.",
    flowTitle: "Fluxo custodial (educacional, via Pera Wallet)",
    providersTitle: "Provedores que suportam USDCa (consulte disponibilidade por país)",
    providersEmpty: "Nenhum provedor encontrado para sua região selecionada. Tente mudar a região em Configurações.",
    guideTitle: "Saída: guia exato de navegação na interface",
    guideGoal: "Objetivo: vender USDCa e receber fiat em banco/cartão.",
    mistakesTitle: "Erros comuns para evitar",
    mistakes: [
      "Nunca envie USDCa para endereço de depósito na rede errada.",
      "Sempre faça teste com valor pequeno na primeira saída.",
      "Não venda antes de o provedor confirmar o depósito.",
      "Guarde txid, ID do pedido e comprovante de saque.",
    ],
    noticeTitle: "Aviso obrigatório",
    notice1: "Uso educacional apenas. Este site não fornece aconselhamento financeiro, jurídico ou tributário.",
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
    subtitle: "Flujo custodial educativo para retirar desde Pera Wallet.",
    educationTitle: "Solo con fines educativos",
    educationBody1: "Este sitio es solo educativo. No es asesoría financiera, legal, contable ni fiscal.",
    educationBody2: "Toda obligación de declaración y cumplimiento fiscal es responsabilidad total del usuario.",
    educationBody3: "La rentabilidad no está garantizada. La volatilidad y el rendimiento anual cambian con el tiempo y dependen de la estrategia y del tipo de lending usado en cada plataforma.",
    flowTitle: "Flujo custodial (educativo, vía Pera Wallet)",
    providersTitle: "Proveedores compatibles con USDCa (revisa disponibilidad por país)",
    providersEmpty: "No se encontraron proveedores para tu región seleccionada. Cambia la región en Ajustes.",
    guideTitle: "Retiro: guía exacta de navegación",
    guideGoal: "Objetivo: vender USDCa y recibir fiat en banco/tarjeta.",
    mistakesTitle: "Errores comunes a evitar",
    mistakes: [
      "Nunca envíes USDCa a una red de depósito incorrecta.",
      "Haz una prueba con monto pequeño en tu primer retiro.",
      "No vendas antes de que el proveedor confirme depósito.",
      "Guarda txid, ID de orden y recibo.",
    ],
    noticeTitle: "Aviso obligatorio",
    notice1: "Uso solo educativo. Este sitio no ofrece asesoría financiera, legal ni fiscal.",
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
