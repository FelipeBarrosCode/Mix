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

export const INVESTMENT_METHODS: InvestmentMethod[] = [
  {
    slug: "governance-rewards",
    title: "Governance Rewards",
    shortDescription: "Lock ALGO for protocol voting rewards.",
    yearlyYield: "5-12% / year",
    riskLevel: "Low-Medium",
    basedOn: "Protocol governance participation and reward distribution.",
    comparesToBanks: "Crypto 5-12% vs banks 6-10%. Often similar, sometimes slightly better.",
    algorandPlatforms: [
      {
        name: "Algorand Governance",
        url: "https://governance.algorand.foundation/",
      },
      {
        name: "Folks Finance",
        url: "https://app.folks.finance/",
        walletConnectUrl: "https://app.folks.finance/",
        notes: "Offers governance-related strategies via dApp flows.",
      },
    ],
    traditionalOption: "Dividend mutual funds or cooperative shares",
    apyComparison: "Comparable to many bank products, with governance lock-up and protocol risk.",
    navigationSteps: [
      "Open Algorand Governance (or Folks Finance) in your browser.",
      "Tap Connect Wallet and choose WalletConnect.",
      "In Pera Wallet, tap Scan, scan the QR code, then approve connection.",
      "On the platform, choose the governance period and read lock rules.",
      "Enter the ALGO amount to commit and review terms carefully.",
      "Tap Commit/Confirm and sign the transaction in Pera.",
      "Track your participation and claim rewards when the period ends.",
    ],
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
    algorandPlatforms: [
      {
        name: "Algorand Governance",
        url: "https://governance.algorand.foundation/",
      },
    ],
    traditionalOption: "High-yield savings bonds or CDI-linked deposits",
    apyComparison: "Often similar to safer bank products, but with crypto and lock timing risks.",
    navigationSteps: [
      "Open Algorand Governance website.",
      "Tap Connect Wallet and choose WalletConnect.",
      "Use Pera Wallet to scan QR and approve the session.",
      "Pick the active governance window and check minimum requirements.",
      "Enter your ALGO commitment amount.",
      "Tap Confirm and sign in Pera Wallet.",
      "Return during reward window to validate and claim rewards.",
    ],
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
    algorandPlatforms: [
      {
        name: "Lofty.ai",
        url: "https://www.lofty.ai/",
        walletConnectUrl: "https://www.lofty.ai/",
      },
    ],
    traditionalOption: "Real estate investment funds (FIIs)",
    apyComparison: "Potentially higher than many bank options, with property and liquidity risk.",
    navigationSteps: [
      "Open Lofty.ai and create your account if required.",
      "Tap Connect Wallet and select WalletConnect.",
      "In Pera, scan QR and approve the connection.",
      "Browse available properties and open one listing.",
      "Review projected yield, fees, and property details.",
      "Tap Invest/Buy and confirm payment in USDCa.",
      "Sign transaction in Pera and verify position appears in your dashboard.",
    ],
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
    algorandPlatforms: [
      {
        name: "Folks Finance",
        url: "https://app.folks.finance/",
        walletConnectUrl: "https://app.folks.finance/",
      },
    ],
    traditionalOption: "Peer-to-peer lending or CDB/LCI products",
    apyComparison: "May beat bank rates, but carries protocol, collateral, and market risks.",
    navigationSteps: [
      "Open Folks Finance app.",
      "Tap Connect Wallet, choose WalletConnect, and approve in Pera.",
      "Go to Earn/Lend section.",
      "Choose asset (USDCa or ALGO) and check live APY.",
      "Tap Supply/Lend and enter amount.",
      "Approve asset step if requested, then sign supply transaction in Pera.",
      "Monitor APY and positions in your portfolio dashboard.",
    ],
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
    algorandPlatforms: [
      {
        name: "Mercado Bitcoin",
        url: "https://www.mercadobitcoin.com.br/",
        notes: "Custodial product. Funds are held by provider while enrolled.",
      },
    ],
    traditionalOption: "High-yield time deposits or bank CDs",
    apyComparison: "Comparable ranges, but includes centralized counterparty risk.",
    navigationSteps: [
      "Open Mercado Bitcoin and sign in.",
      "Complete account verification if required.",
      "Go to Earn/Staking/Yield section.",
      "Choose the eligible product and read terms, lock period, and fees.",
      "Select amount and confirm enrollment.",
      "Approve required actions in account flow.",
      "Track rewards in the exchange dashboard and follow withdrawal rules.",
    ],
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
    algorandPlatforms: [
      {
        name: "Pera Wallet",
        url: "https://perawallet.app/",
      },
    ],
    traditionalOption: "Long-term government bonds or stock ETFs",
    apyComparison: "Higher upside potential than banks, but can experience large drawdowns.",
    navigationSteps: [
      "Open Pera Wallet and connect/restore your account.",
      "Acquire ALGO or USDCa from a provider and send to your Pera address.",
      "In Pera, check that your balance is visible in Assets.",
      "Do not actively trade; hold for your chosen long-term horizon.",
      "Review portfolio value periodically instead of daily.",
      "Set personal exit rules (target or risk limit) before market volatility.",
      "When ready, transfer to cash-out route and realize gains/losses.",
    ],
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
    algorandPlatforms: [
      {
        name: "Tinyman",
        url: "https://app.tinyman.org/",
        walletConnectUrl: "https://app.tinyman.org/",
      },
      {
        name: "Folks Finance",
        url: "https://app.folks.finance/",
        walletConnectUrl: "https://app.folks.finance/",
      },
    ],
    traditionalOption: "Variable-rate money market accounts or RDB products",
    apyComparison: "Can be higher than banks, but includes impermanent loss and smart-contract risk.",
    navigationSteps: [
      "Open Tinyman (or Folks) in browser.",
      "Tap Connect Wallet and select WalletConnect.",
      "In Pera Wallet, scan QR and approve connection.",
      "Go to Pools/Liquidity section.",
      "Choose pair (for example ALGO/USDCa) and review APR/APY details.",
      "Enter token amounts and approve pool deposit transactions in Pera.",
      "Track LP position and rewards, then remove liquidity when strategy ends.",
    ],
    safetyOrder: 7,
  },
];

export function listInvestmentsBySafety() {
  return [...INVESTMENT_METHODS].sort((a, b) => a.safetyOrder - b.safetyOrder);
}

export function getInvestmentBySlug(slug: string) {
  return INVESTMENT_METHODS.find((item) => item.slug === slug);
}
