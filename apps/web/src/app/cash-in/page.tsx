"use client";

import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { listProviders } from "@/features/cash/providers";
import { useI18n } from "@/hooks/use-i18n";
import { usePreferencesStore } from "@/stores/preferences-store";

const cashInCopy = {
  en: {
    title: "Cash in",
    subtitle: "Educational custodial flow to cash in via Pera Wallet.",
    educationTitle: "Educational purpose only",
    educationBody1: "This website is for educational purposes only. It is not financial, legal, accounting, or tax advice.",
    educationBody2: "All tax declaration, reporting, and compliance obligations are fully the user's responsibility.",
    educationBody3: "Returns are not guaranteed. Volatility and yearly yield change over time and depend on strategy and lending type used on each platform.",
    flowTitle: "Custodial flow (educational, via Pera Wallet)",
    providersTitle: "Providers that support USDCa (check availability by country)",
    providersEmpty: "No provider match found for your selected region right now. Try changing region in Settings.",
    guideTitle: "Cash-in: exact UI navigation guide",
    guideGoal: "Goal: buy USDCa with bank/card and receive it in your wallet. Follow these screens in order.",
    mistakesTitle: "Common mistakes to avoid",
    mistakes: [
      "Do not send to the wrong network/address. Always verify first and last 6 characters.",
      "Do a small test purchase first, then do the full amount.",
      "If provider says pending review, wait for verification before repeating actions.",
      "Save order ID + transaction receipt for support and tax records.",
    ],
    noticeTitle: "Mandatory notice",
    notice1: "Educational use only. This website does not provide financial, legal, or tax advice.",
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
    subtitle: "Fluxo custodial educacional para adicionar saldo via Pera Wallet.",
    educationTitle: "Somente para fins educacionais",
    educationBody1: "Este site é apenas educacional. Não é aconselhamento financeiro, jurídico, contábil ou tributário.",
    educationBody2: "Toda obrigação de declaração, reporte e compliance fiscal é totalmente do usuário.",
    educationBody3: "Rentabilidade não é garantida. Volatilidade e rendimento anual mudam com o tempo e dependem da estratégia e do tipo de lending usado em cada plataforma.",
    flowTitle: "Fluxo custodial (educacional, via Pera Wallet)",
    providersTitle: "Provedores que suportam USDCa (consulte disponibilidade por país)",
    providersEmpty: "Nenhum provedor encontrado para sua região selecionada. Tente mudar a região em Configurações.",
    guideTitle: "Entrada: guia exato de navegação na interface",
    guideGoal: "Objetivo: comprar USDCa com banco/cartão e receber na sua carteira. Siga as telas em ordem.",
    mistakesTitle: "Erros comuns para evitar",
    mistakes: [
      "Não envie para rede/endereço errado. Sempre confira os 6 primeiros e 6 últimos caracteres.",
      "Faça primeiro uma compra teste pequena e depois o valor total.",
      "Se o provedor indicar revisão pendente, aguarde a verificação antes de repetir ações.",
      "Guarde ID do pedido + comprovante para suporte e impostos.",
    ],
    noticeTitle: "Aviso obrigatório",
    notice1: "Uso educacional apenas. Este site não fornece aconselhamento financeiro, jurídico ou tributário.",
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
    subtitle: "Flujo custodial educativo para ingresar vía Pera Wallet.",
    educationTitle: "Solo con fines educativos",
    educationBody1: "Este sitio es solo educativo. No es asesoría financiera, legal, contable ni fiscal.",
    educationBody2: "Toda obligación de declaración y cumplimiento fiscal es responsabilidad total del usuario.",
    educationBody3: "La rentabilidad no está garantizada. La volatilidad y el rendimiento anual cambian con el tiempo y dependen de la estrategia y del tipo de lending usado en cada plataforma.",
    flowTitle: "Flujo custodial (educativo, vía Pera Wallet)",
    providersTitle: "Proveedores compatibles con USDCa (revisa disponibilidad por país)",
    providersEmpty: "No se encontraron proveedores para tu región seleccionada. Cambia la región en Ajustes.",
    guideTitle: "Entrada: guía exacta de navegación de interfaz",
    guideGoal: "Objetivo: comprar USDCa con banco/tarjeta y recibirlo en tu billetera.",
    mistakesTitle: "Errores comunes a evitar",
    mistakes: [
      "No envíes a red/dirección incorrecta. Verifica primeros y últimos 6 caracteres.",
      "Haz primero una compra de prueba pequeña.",
      "Si el proveedor marca revisión pendiente, espera antes de repetir acciones.",
      "Guarda ID de orden y recibo para soporte e impuestos.",
    ],
    noticeTitle: "Aviso obligatorio",
    notice1: "Uso solo educativo. Este sitio no ofrece asesoría financiera, legal ni fiscal.",
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
