import type { AppLocale } from "@/stores/preferences-store";

export type InvestmentMethod = {
  slug: string;
  title: string;
  shortDescription: string;
  yearlyYield: string;
  riskLevel: string;
  basedOn: string;
  comparesToBanks: string;
  algorandPlatforms: Array<{
    name: string;
    url: string;
    walletConnectUrl?: string;
    notes?: string;
  }>;
  traditionalOption: string;
  apyComparison: string;
  navigationSteps: string[];
  safetyOrder: number;
};

const INVESTMENT_METHODS_BY_LOCALE: Partial<Record<AppLocale, InvestmentMethod[]>> & { en: InvestmentMethod[] } = {
  en: [
    {
      slug: "governance-rewards",
      title: "Governance Rewards",
      shortDescription: "Lock ALGO for protocol voting rewards.",
      yearlyYield: "5-12% / year",
      riskLevel: "Low-Medium",
      basedOn: "Protocol governance participation and reward distribution.",
      comparesToBanks: "Crypto 5-12% vs banks 6-10%. Often similar, sometimes slightly better.",
      algorandPlatforms: [{ name: "Algorand Governance", url: "https://governance.algorand.foundation/" }, { name: "Folks Finance", url: "https://app.folks.finance/", walletConnectUrl: "https://app.folks.finance/", notes: "Offers governance-related strategies via dApp flows." }],
      traditionalOption: "Dividend mutual funds or cooperative shares",
      apyComparison: "Comparable to many bank products, with governance lock-up and protocol risk.",
      navigationSteps: ["Open Algorand Governance (or Folks Finance) in your browser.", "Tap Connect Wallet and choose WalletConnect.", "In Pera Wallet, tap Scan, scan the QR code, then approve connection.", "On the platform, choose the governance period and read lock rules.", "Enter the ALGO amount to commit and review terms carefully.", "Tap Commit/Confirm and sign the transaction in Pera.", "Track your participation and claim rewards when the period ends."],
      safetyOrder: 1,
    },
    {
      slug: "staking",
      title: "Staking",
      shortDescription: "Commit ALGO to earn periodic rewards.",
      yearlyYield: "4-10% / year",
      riskLevel: "Medium",
      basedOn: "Network rewards or delegated staking-like participation models.",
      comparesToBanks: "Crypto 4-10% vs banks 6-8%. Can be close depending on period.",
      algorandPlatforms: [{ name: "Algorand Governance", url: "https://governance.algorand.foundation/" }],
      traditionalOption: "High-yield savings bonds or CDI-linked deposits",
      apyComparison: "Often similar to safer bank products, but with crypto and lock timing risks.",
      navigationSteps: ["Open Algorand Governance website.", "Tap Connect Wallet and choose WalletConnect.", "Use Pera Wallet to scan QR and approve the session.", "Pick the active governance window and check minimum requirements.", "Enter your ALGO commitment amount.", "Tap Confirm and sign in Pera Wallet.", "Return during reward window to validate and claim rewards."],
      safetyOrder: 2,
    },
    {
      slug: "rwa-tokenization",
      title: "RWA Tokenization",
      shortDescription: "Buy tokenized real-world assets with USDCa.",
      yearlyYield: "6-15% / year",
      riskLevel: "Medium",
      basedOn: "Tokenized ownership and rental/income streams from real assets.",
      comparesToBanks: "Crypto 6-15% vs banks 8-12%. Can outperform, but asset value can vary.",
      algorandPlatforms: [{ name: "Lofty.ai", url: "https://www.lofty.ai/", walletConnectUrl: "https://www.lofty.ai/" }],
      traditionalOption: "Real estate investment funds (FIIs)",
      apyComparison: "Potentially higher than many bank options, with property and liquidity risk.",
      navigationSteps: ["Open Lofty.ai and create your account if required.", "Tap Connect Wallet and select WalletConnect.", "In Pera, scan QR and approve the connection.", "Browse available properties and open one listing.", "Review projected yield, fees, and property details.", "Tap Invest/Buy and confirm payment in USDCa.", "Sign transaction in Pera and verify position appears in your dashboard."],
      safetyOrder: 3,
    },
    {
      slug: "lending",
      title: "Lending",
      shortDescription: "Lend USDCa/ALGO to earn lending yield.",
      yearlyYield: "5-15% / year",
      riskLevel: "Medium",
      basedOn: "Supply assets to lending pools and earn variable borrow interest.",
      comparesToBanks: "Crypto 5-15% vs banks 7-10%. Can be higher, with smart-contract risk.",
      algorandPlatforms: [{ name: "Folks Finance", url: "https://app.folks.finance/", walletConnectUrl: "https://app.folks.finance/" }],
      traditionalOption: "Peer-to-peer lending or CDB/LCI products",
      apyComparison: "May beat bank rates, but carries protocol, collateral, and market risks.",
      navigationSteps: ["Open Folks Finance app.", "Tap Connect Wallet, choose WalletConnect, and approve in Pera.", "Go to Earn/Lend section.", "Choose asset (USDCa or ALGO) and check live APY.", "Tap Supply/Lend and enter amount.", "Approve asset step if requested, then sign supply transaction in Pera.", "Monitor APY and positions in your portfolio dashboard."],
      safetyOrder: 4,
    },
    {
      slug: "cefi-yield",
      title: "CeFi Yield",
      shortDescription: "Earn yield in a custodial exchange product.",
      yearlyYield: "4-12% / year",
      riskLevel: "Medium",
      basedOn: "Centralized platform lending/staking programs managed by provider.",
      comparesToBanks: "Crypto 4-12% vs banks 6-9%. Similar in many cases.",
      algorandPlatforms: [{ name: "Mercado Bitcoin", url: "https://www.mercadobitcoin.com.br/", notes: "Custodial product. Funds are held by provider while enrolled." }],
      traditionalOption: "High-yield time deposits or bank CDs",
      apyComparison: "Comparable ranges, but includes centralized counterparty risk.",
      navigationSteps: ["Open Mercado Bitcoin and sign in.", "Complete account verification if required.", "Go to Earn/Staking/Yield section.", "Choose the eligible product and read terms, lock period, and fees.", "Select amount and confirm enrollment.", "Approve required actions in account flow.", "Track rewards in the exchange dashboard and follow withdrawal rules."],
      safetyOrder: 5,
    },
    {
      slug: "hodling",
      title: "HODLing",
      shortDescription: "Hold crypto long-term and wait for appreciation.",
      yearlyYield: "20-100%+ / year (volatile)",
      riskLevel: "High",
      basedOn: "Long-term market price appreciation of held assets.",
      comparesToBanks: "Crypto can greatly outperform banks, but with much higher downside volatility.",
      algorandPlatforms: [{ name: "Pera Wallet", url: "https://perawallet.app/" }],
      traditionalOption: "Long-term government bonds or stock ETFs",
      apyComparison: "Higher upside potential than banks, but can experience large drawdowns.",
      navigationSteps: ["Open Pera Wallet and connect/restore your account.", "Acquire ALGO or USDCa from a provider and send to your Pera address.", "In Pera, check that your balance is visible in Assets.", "Do not actively trade; hold for your chosen long-term horizon.", "Review portfolio value periodically instead of daily.", "Set personal exit rules (target or risk limit) before market volatility.", "When ready, transfer to cash-out route and realize gains/losses."],
      safetyOrder: 6,
    },
    {
      slug: "defi-yield-farming",
      title: "DeFi Yield Farming",
      shortDescription: "Provide liquidity to earn fees and incentives.",
      yearlyYield: "5-30%+ / year",
      riskLevel: "High",
      basedOn: "Liquidity pool fees, incentive emissions, and protocol rewards.",
      comparesToBanks: "Crypto 5-30%+ vs banks 6-9%. Can exceed banks, with higher risk.",
      algorandPlatforms: [{ name: "Tinyman", url: "https://app.tinyman.org/", walletConnectUrl: "https://app.tinyman.org/" }, { name: "Folks Finance", url: "https://app.folks.finance/", walletConnectUrl: "https://app.folks.finance/" }],
      traditionalOption: "Variable-rate money market accounts or RDB products",
      apyComparison: "Can be higher than banks, but includes impermanent loss and smart-contract risk.",
      navigationSteps: ["Open Tinyman (or Folks) in browser.", "Tap Connect Wallet and select WalletConnect.", "In Pera Wallet, scan QR and approve connection.", "Go to Pools/Liquidity section.", "Choose pair (for example ALGO/USDCa) and review APR/APY details.", "Enter token amounts and approve pool deposit transactions in Pera.", "Track LP position and rewards, then remove liquidity when strategy ends."],
      safetyOrder: 7,
    },
  ],
  "pt-BR": [
    {
      slug: "governance-rewards", title: "Recompensas de governança", shortDescription: "Trave ALGO para receber recompensas de voto do protocolo.", yearlyYield: "5-12% / ano", riskLevel: "Baixo-Médio", basedOn: "Participação em governança do protocolo e distribuição de recompensas.", comparesToBanks: "Cripto 5-12% vs bancos 6-10%. Muitas vezes é parecido e às vezes um pouco melhor.", algorandPlatforms: [{ name: "Algorand Governance", url: "https://governance.algorand.foundation/" }, { name: "Folks Finance", url: "https://app.folks.finance/", walletConnectUrl: "https://app.folks.finance/", notes: "Oferece estratégias ligadas à governança por fluxos dApp." }], traditionalOption: "Fundos de dividendos ou cotas cooperativas", apyComparison: "Comparável a muitos produtos bancários, com trava de governança e risco de protocolo.", navigationSteps: ["Abra Algorand Governance (ou Folks Finance) no navegador.", "Toque em Connect Wallet e escolha WalletConnect.", "Na Pera Wallet, toque em Scan, leia o QR e aprove a conexão.", "Na plataforma, escolha o período de governança e leia as regras de trava.", "Informe a quantidade de ALGO a comprometer e revise os termos com atenção.", "Toque em Commit/Confirm e assine na Pera.", "Acompanhe a participação e resgate as recompensas ao fim do período."], safetyOrder: 1,
    },
    {
      slug: "staking", title: "Staking", shortDescription: "Comprometa ALGO para ganhar recompensas periódicas.", yearlyYield: "4-10% / ano", riskLevel: "Médio", basedOn: "Recompensas de rede ou modelos delegados semelhantes a staking.", comparesToBanks: "Cripto 4-10% vs bancos 6-8%. Pode ficar próximo dependendo do período.", algorandPlatforms: [{ name: "Algorand Governance", url: "https://governance.algorand.foundation/" }], traditionalOption: "Títulos de renda fixa ou depósitos atrelados ao CDI", apyComparison: "Muitas vezes semelhante a produtos bancários mais seguros, mas com risco cripto e de prazo de trava.", navigationSteps: ["Abra o site Algorand Governance.", "Toque em Connect Wallet e escolha WalletConnect.", "Use a Pera Wallet para ler o QR e aprovar a sessão.", "Escolha a janela de governança ativa e verifique os requisitos mínimos.", "Informe a quantidade de ALGO a comprometer.", "Toque em Confirm e assine na Pera Wallet.", "Volte na janela de recompensa para validar e resgatar."], safetyOrder: 2,
    },
    {
      slug: "rwa-tokenization", title: "Tokenização de RWA", shortDescription: "Compre ativos do mundo real tokenizados com USDCa.", yearlyYield: "6-15% / ano", riskLevel: "Médio", basedOn: "Propriedade tokenizada e fluxos de renda de ativos reais.", comparesToBanks: "Cripto 6-15% vs bancos 8-12%. Pode superar, mas o valor do ativo pode variar.", algorandPlatforms: [{ name: "Lofty.ai", url: "https://www.lofty.ai/", walletConnectUrl: "https://www.lofty.ai/" }], traditionalOption: "Fundos imobiliários (FIIs)", apyComparison: "Potencialmente acima de muitas opções bancárias, com risco de imóvel e liquidez.", navigationSteps: ["Abra Lofty.ai e crie sua conta se necessário.", "Toque em Connect Wallet e selecione WalletConnect.", "Na Pera, leia o QR e aprove a conexão.", "Veja as propriedades disponíveis e abra um anúncio.", "Revise rendimento projetado, taxas e detalhes do imóvel.", "Toque em Invest/Buy e confirme o pagamento em USDCa.", "Assine na Pera e confirme que a posição apareceu no painel."], safetyOrder: 3,
    },
    {
      slug: "lending", title: "Lending", shortDescription: "Empreste USDCa/ALGO para ganhar rendimento.", yearlyYield: "5-15% / ano", riskLevel: "Médio", basedOn: "Oferta de ativos em pools de empréstimo com juros variáveis.", comparesToBanks: "Cripto 5-15% vs bancos 7-10%. Pode ser maior, com risco de smart contract.", algorandPlatforms: [{ name: "Folks Finance", url: "https://app.folks.finance/", walletConnectUrl: "https://app.folks.finance/" }], traditionalOption: "Empréstimos P2P ou produtos CDB/LCI", apyComparison: "Pode superar taxas bancárias, mas carrega risco de protocolo, colateral e mercado.", navigationSteps: ["Abra o app Folks Finance.", "Toque em Connect Wallet, escolha WalletConnect e aprove na Pera.", "Vá para a seção Earn/Lend.", "Escolha o ativo (USDCa ou ALGO) e confira o APY ao vivo.", "Toque em Supply/Lend e informe o valor.", "Aprove a etapa do ativo se necessário e assine o envio na Pera.", "Monitore APY e posições no painel do portfólio."], safetyOrder: 4,
    },
    {
      slug: "cefi-yield", title: "Rendimento CeFi", shortDescription: "Ganhe rendimento em um produto custodial de exchange.", yearlyYield: "4-12% / ano", riskLevel: "Médio", basedOn: "Programas centralizados de lending/staking geridos pelo provedor.", comparesToBanks: "Cripto 4-12% vs bancos 6-9%. Faixas parecidas em muitos casos.", algorandPlatforms: [{ name: "Mercado Bitcoin", url: "https://www.mercadobitcoin.com.br/", notes: "Produto custodial. Os fundos ficam com o provedor enquanto estiver ativo." }], traditionalOption: "Depósitos a prazo ou CDBs bancários", apyComparison: "Faixa comparável, mas com risco de contraparte centralizada.", navigationSteps: ["Abra o Mercado Bitcoin e faça login.", "Conclua a verificação da conta se necessário.", "Vá para a seção Earn/Staking/Yield.", "Escolha o produto elegível e leia termos, prazo de trava e taxas.", "Selecione o valor e confirme a adesão.", "Aprove as ações necessárias no fluxo da conta.", "Acompanhe as recompensas no painel da exchange e siga as regras de saque."], safetyOrder: 5,
    },
    {
      slug: "hodling", title: "HODL", shortDescription: "Mantenha cripto no longo prazo e espere valorização.", yearlyYield: "20-100%+ / ano (volátil)", riskLevel: "Alto", basedOn: "Apreciação de preço no longo prazo dos ativos mantidos.", comparesToBanks: "Cripto pode superar muito os bancos, mas com volatilidade e quedas bem maiores.", algorandPlatforms: [{ name: "Pera Wallet", url: "https://perawallet.app/" }], traditionalOption: "Títulos de longo prazo ou ETFs de ações", apyComparison: "Maior potencial de alta que bancos, mas com quedas relevantes no caminho.", navigationSteps: ["Abra a Pera Wallet e conecte ou restaure sua conta.", "Compre ALGO ou USDCa em um provedor e envie para seu endereço Pera.", "Na Pera, confira se o saldo aparece em Assets.", "Não opere ativamente; mantenha pela janela de longo prazo escolhida.", "Revise o valor do portfólio periodicamente, não todos os dias.", "Defina regras pessoais de saída antes da volatilidade.", "Quando quiser encerrar, use uma rota de cash-out para realizar ganhos ou perdas."], safetyOrder: 6,
    },
    {
      slug: "defi-yield-farming", title: "Yield farming DeFi", shortDescription: "Forneça liquidez para ganhar taxas e incentivos.", yearlyYield: "5-30%+ / ano", riskLevel: "Alto", basedOn: "Taxas de pools, emissões de incentivo e recompensas de protocolo.", comparesToBanks: "Cripto 5-30%+ vs bancos 6-9%. Pode superar os bancos, com risco mais alto.", algorandPlatforms: [{ name: "Tinyman", url: "https://app.tinyman.org/", walletConnectUrl: "https://app.tinyman.org/" }, { name: "Folks Finance", url: "https://app.folks.finance/", walletConnectUrl: "https://app.folks.finance/" }], traditionalOption: "Contas de renda variável ou produtos com taxa flutuante", apyComparison: "Pode render acima dos bancos, mas inclui perda impermanente e risco de smart contract.", navigationSteps: ["Abra Tinyman (ou Folks) no navegador.", "Toque em Connect Wallet e selecione WalletConnect.", "Na Pera Wallet, leia o QR e aprove a conexão.", "Vá para a seção Pools/Liquidity.", "Escolha o par (por exemplo ALGO/USDCa) e revise APR/APY.", "Informe os valores dos tokens e aprove os depósitos na Pera.", "Acompanhe a posição LP e as recompensas e remova a liquidez quando a estratégia terminar."], safetyOrder: 7,
    },
  ],
  es: [
    {
      slug: "governance-rewards", title: "Recompensas de gobernanza", shortDescription: "Bloquea ALGO para recibir recompensas por votar en el protocolo.", yearlyYield: "5-12% / año", riskLevel: "Bajo-Medio", basedOn: "Participación en gobernanza del protocolo y distribución de recompensas.", comparesToBanks: "Cripto 5-12% vs bancos 6-10%. Muchas veces es similar y a veces un poco mejor.", algorandPlatforms: [{ name: "Algorand Governance", url: "https://governance.algorand.foundation/" }, { name: "Folks Finance", url: "https://app.folks.finance/", walletConnectUrl: "https://app.folks.finance/", notes: "Ofrece estrategias relacionadas con gobernanza por flujos dApp." }], traditionalOption: "Fondos de dividendos o participaciones cooperativas", apyComparison: "Comparable con muchos productos bancarios, con bloqueo de gobernanza y riesgo de protocolo.", navigationSteps: ["Abre Algorand Governance (o Folks Finance) en tu navegador.", "Toca Connect Wallet y elige WalletConnect.", "En Pera Wallet, toca Scan, escanea el QR y aprueba la conexión.", "En la plataforma, elige el periodo de gobernanza y lee las reglas de bloqueo.", "Ingresa la cantidad de ALGO a comprometer y revisa bien los términos.", "Toca Commit/Confirm y firma en Pera.", "Sigue tu participación y reclama recompensas cuando termine el periodo."], safetyOrder: 1,
    },
    {
      slug: "staking", title: "Staking", shortDescription: "Compromete ALGO para ganar recompensas periódicas.", yearlyYield: "4-10% / año", riskLevel: "Medio", basedOn: "Recompensas de red o modelos delegados similares al staking.", comparesToBanks: "Cripto 4-10% vs bancos 6-8%. Puede ser cercano según el periodo.", algorandPlatforms: [{ name: "Algorand Governance", url: "https://governance.algorand.foundation/" }], traditionalOption: "Bonos de ahorro o depósitos ligados a tasa variable", apyComparison: "A menudo similar a productos bancarios más seguros, pero con riesgo cripto y de bloqueo.", navigationSteps: ["Abre el sitio de Algorand Governance.", "Toca Connect Wallet y elige WalletConnect.", "Usa Pera Wallet para escanear el QR y aprobar la sesión.", "Elige la ventana activa de gobernanza y revisa los requisitos mínimos.", "Ingresa la cantidad de ALGO a comprometer.", "Toca Confirm y firma en Pera Wallet.", "Vuelve durante la ventana de recompensas para validar y reclamar."], safetyOrder: 2,
    },
    {
      slug: "rwa-tokenization", title: "Tokenización RWA", shortDescription: "Compra activos reales tokenizados con USDCa.", yearlyYield: "6-15% / año", riskLevel: "Medio", basedOn: "Propiedad tokenizada y flujos de renta de activos reales.", comparesToBanks: "Cripto 6-15% vs bancos 8-12%. Puede superar, pero el valor del activo puede variar.", algorandPlatforms: [{ name: "Lofty.ai", url: "https://www.lofty.ai/", walletConnectUrl: "https://www.lofty.ai/" }], traditionalOption: "Fondos inmobiliarios", apyComparison: "Potencialmente mayor que muchas opciones bancarias, con riesgo de propiedad y liquidez.", navigationSteps: ["Abre Lofty.ai y crea tu cuenta si hace falta.", "Toca Connect Wallet y selecciona WalletConnect.", "En Pera, escanea el QR y aprueba la conexión.", "Revisa las propiedades disponibles y abre una publicación.", "Revisa rendimiento proyectado, comisiones y detalles del inmueble.", "Toca Invest/Buy y confirma el pago en USDCa.", "Firma en Pera y verifica que la posición aparezca en tu panel."], safetyOrder: 3,
    },
    {
      slug: "lending", title: "Lending", shortDescription: "Presta USDCa/ALGO para ganar rendimiento.", yearlyYield: "5-15% / año", riskLevel: "Medio", basedOn: "Suministro de activos a pools de préstamo con interés variable.", comparesToBanks: "Cripto 5-15% vs bancos 7-10%. Puede ser mayor, con riesgo de smart contract.", algorandPlatforms: [{ name: "Folks Finance", url: "https://app.folks.finance/", walletConnectUrl: "https://app.folks.finance/" }], traditionalOption: "Préstamos P2P o productos de renta fija", apyComparison: "Puede superar tasas bancarias, pero con riesgo de protocolo, colateral y mercado.", navigationSteps: ["Abre la app de Folks Finance.", "Toca Connect Wallet, elige WalletConnect y aprueba en Pera.", "Ve a la sección Earn/Lend.", "Elige el activo (USDCa o ALGO) y revisa el APY en vivo.", "Toca Supply/Lend e ingresa el monto.", "Aprueba el paso del activo si se solicita y firma en Pera.", "Monitorea APY y posiciones en tu panel de portafolio."], safetyOrder: 4,
    },
    {
      slug: "cefi-yield", title: "Rendimiento CeFi", shortDescription: "Gana rendimiento en un producto custodial de exchange.", yearlyYield: "4-12% / año", riskLevel: "Medio", basedOn: "Programas centralizados de lending/staking gestionados por el proveedor.", comparesToBanks: "Cripto 4-12% vs bancos 6-9%. Rangos parecidos en muchos casos.", algorandPlatforms: [{ name: "Mercado Bitcoin", url: "https://www.mercadobitcoin.com.br/", notes: "Producto custodial. Los fondos quedan con el proveedor mientras está activo." }], traditionalOption: "Depósitos a plazo o CDs bancarios", apyComparison: "Comparable en rango, pero con riesgo de contraparte centralizada.", navigationSteps: ["Abre Mercado Bitcoin e inicia sesión.", "Completa la verificación de la cuenta si hace falta.", "Ve a la sección Earn/Staking/Yield.", "Elige el producto elegible y lee términos, plazo de bloqueo y comisiones.", "Selecciona el monto y confirma la adhesión.", "Aprueba las acciones necesarias dentro del flujo de la cuenta.", "Sigue las recompensas en el panel de la exchange y respeta las reglas de retiro."], safetyOrder: 5,
    },
    {
      slug: "hodling", title: "HODL", shortDescription: "Mantén cripto a largo plazo y espera apreciación.", yearlyYield: "20-100%+ / año (volátil)", riskLevel: "Alto", basedOn: "Apreciación de precio a largo plazo de los activos mantenidos.", comparesToBanks: "Cripto puede superar mucho a los bancos, pero con mucha más volatilidad y caídas.", algorandPlatforms: [{ name: "Pera Wallet", url: "https://perawallet.app/" }], traditionalOption: "Bonos de largo plazo o ETFs de acciones", apyComparison: "Mayor potencial alcista que los bancos, pero con caídas importantes en el camino.", navigationSteps: ["Abre Pera Wallet y conecta o restaura tu cuenta.", "Compra ALGO o USDCa en un proveedor y envíalo a tu dirección Pera.", "En Pera, verifica que el saldo aparezca en Assets.", "No operes activamente; mantén por tu horizonte de largo plazo.", "Revisa el valor del portafolio periódicamente, no todos los días.", "Define reglas personales de salida antes de la volatilidad.", "Cuando quieras salir, usa una ruta de cash-out para realizar ganancias o pérdidas."], safetyOrder: 6,
    },
    {
      slug: "defi-yield-farming", title: "Yield farming DeFi", shortDescription: "Aporta liquidez para ganar comisiones e incentivos.", yearlyYield: "5-30%+ / año", riskLevel: "Alto", basedOn: "Comisiones de pools, emisiones de incentivos y recompensas de protocolo.", comparesToBanks: "Cripto 5-30%+ vs bancos 6-9%. Puede superar a los bancos, con riesgo más alto.", algorandPlatforms: [{ name: "Tinyman", url: "https://app.tinyman.org/", walletConnectUrl: "https://app.tinyman.org/" }, { name: "Folks Finance", url: "https://app.folks.finance/", walletConnectUrl: "https://app.folks.finance/" }], traditionalOption: "Cuentas de mercado monetario o productos variables", apyComparison: "Puede rendir más que los bancos, pero incluye pérdida impermanente y riesgo de smart contract.", navigationSteps: ["Abre Tinyman (o Folks) en el navegador.", "Toca Connect Wallet y selecciona WalletConnect.", "En Pera Wallet, escanea el QR y aprueba la conexión.", "Ve a la sección Pools/Liquidity.", "Elige el par (por ejemplo ALGO/USDCa) y revisa APR/APY.", "Ingresa los montos de tokens y aprueba los depósitos en Pera.", "Sigue la posición LP y las recompensas, y retira liquidez cuando termine la estrategia."], safetyOrder: 7,
    },
  ],
};

export function listInvestmentsBySafety(locale: AppLocale) {
  return [...(INVESTMENT_METHODS_BY_LOCALE[locale] ?? INVESTMENT_METHODS_BY_LOCALE.en)].sort((a, b) => a.safetyOrder - b.safetyOrder);
}

export function getInvestmentBySlug(slug: string, locale: AppLocale) {
  const items = INVESTMENT_METHODS_BY_LOCALE[locale] ?? INVESTMENT_METHODS_BY_LOCALE.en;
  return items.find((item) => item.slug === slug);
}
