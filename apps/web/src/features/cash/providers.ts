import type { AppRegion } from "@/stores/preferences-store";

export type ProviderType = "onramp" | "exchange" | "dex";
export type CashDirection = "in" | "out";

export type CashProvider = {
  id: string;
  name: string;
  type: ProviderType;
  directions: CashDirection[];
  regions: AppRegion[];
  methods: string[];
  custody: "custodial";
  url: string;
  walletConnectUrl?: string;
  noteKey: string;
};

export const CASH_PROVIDERS: CashProvider[] = [
  {
    id: "meld",
    name: "Meld",
    type: "onramp",
    directions: ["in", "out"],
    regions: ["US", "EU", "LATAM", "BR", "GLOBAL"],
    methods: ["cash.method.card", "cash.method.bankTransfer", "cash.method.localRails"],
    custody: "custodial",
    url: "https://www.meld.io/",
    noteKey: "cash.provider.meld.note",
  },
  {
    id: "moonpay",
    name: "MoonPay",
    type: "onramp",
    directions: ["in", "out"],
    regions: ["US", "EU", "LATAM", "BR", "GLOBAL"],
    methods: ["cash.method.card", "cash.method.applePay", "cash.method.googlePay", "cash.method.bank"],
    custody: "custodial",
    url: "https://www.moonpay.com/",
    noteKey: "cash.provider.moonpay.note",
  },
  {
    id: "transak",
    name: "Transak",
    type: "onramp",
    directions: ["in", "out"],
    regions: ["US", "EU", "LATAM", "BR", "GLOBAL"],
    methods: ["cash.method.card", "cash.method.bank", "cash.method.localRails"],
    custody: "custodial",
    url: "https://transak.com/",
    noteKey: "cash.provider.transak.note",
  },
  {
    id: "banxa",
    name: "Banxa",
    type: "onramp",
    directions: ["in", "out"],
    regions: ["US", "EU", "LATAM", "BR", "GLOBAL"],
    methods: ["cash.method.card", "cash.method.bank"],
    custody: "custodial",
    url: "https://banxa.com/",
    noteKey: "cash.provider.banxa.note",
  },
  {
    id: "sardine",
    name: "Sardine",
    type: "onramp",
    directions: ["in", "out"],
    regions: ["US", "GLOBAL"],
    methods: ["cash.method.ach", "cash.method.card"],
    custody: "custodial",
    url: "https://www.sardine.ai/",
    noteKey: "cash.provider.sardine.note",
  },
  {
    id: "brale",
    name: "Brale",
    type: "onramp",
    directions: ["in", "out"],
    regions: ["US"],
    methods: ["cash.method.bank"],
    custody: "custodial",
    url: "https://www.brale.xyz/",
    noteKey: "cash.provider.brale.note",
  },
  {
    id: "kraken",
    name: "Kraken",
    type: "exchange",
    directions: ["in", "out"],
    regions: ["US", "EU", "LATAM", "BR", "GLOBAL"],
    methods: ["cash.method.fiatBuy", "cash.method.withdrawAlgorand"],
    custody: "custodial",
    url: "https://www.kraken.com/c",
    noteKey: "cash.provider.kraken.note",
  },
  {
    id: "coinbase",
    name: "Coinbase",
    type: "exchange",
    directions: ["in", "out"],
    regions: ["US", "EU", "GLOBAL"],
    methods: ["cash.method.fiatBuy", "cash.method.withdrawAlgorand"],
    custody: "custodial",
    url: "https://www.coinbase.com/",
    noteKey: "cash.provider.coinbase.note",
  },
  {
    id: "mercado-bitcoin",
    name: "Mercado Bitcoin",
    type: "exchange",
    directions: ["in", "out"],
    regions: ["BR"],
    methods: ["cash.method.pix", "cash.method.brlTransfer"],
    custody: "custodial",
    url: "https://www.mercadobitcoin.com.br/",
    noteKey: "cash.provider.mercado.note",
  },
  {
    id: "crypto-com-card",
    name: "Crypto.com Card",
    type: "exchange",
    directions: ["out"],
    regions: ["US", "EU", "LATAM", "BR", "GLOBAL"],
    methods: ["cash.method.visa", "cash.method.cardSpend", "cash.method.autoConvert", "cash.method.cryptoRewards"],
    custody: "custodial",
    url: "https://crypto.com/cards",
    noteKey: "cash.provider.cryptoComCard.note",
  },
  {
    id: "binance-card",
    name: "Binance Card",
    type: "exchange",
    directions: ["out"],
    regions: ["EU", "LATAM", "BR", "GLOBAL"],
    methods: ["cash.method.visa", "cash.method.cardSpend", "cash.method.autoConvert", "cash.method.cryptoRewards"],
    custody: "custodial",
    url: "https://www.binance.com/en/cards",
    noteKey: "cash.provider.binanceCard.note",
  },
  {
    id: "coinbase-card",
    name: "Coinbase Card",
    type: "exchange",
    directions: ["out"],
    regions: ["US", "EU", "GLOBAL"],
    methods: ["cash.method.visa", "cash.method.cardSpend", "cash.method.autoConvert", "cash.method.cryptoRewards"],
    custody: "custodial",
    url: "https://www.coinbase.com/card",
    noteKey: "cash.provider.coinbaseCard.note",
  },
  {
    id: "bitpay-card",
    name: "BitPay Card",
    type: "exchange",
    directions: ["out"],
    regions: ["US", "GLOBAL"],
    methods: ["cash.method.mastercard", "cash.method.cardSpend", "cash.method.autoConvert"],
    custody: "custodial",
    url: "https://www.bitpay.com/card/",
    noteKey: "cash.provider.bitpayCard.note",
  },
  {
    id: "pera-wallet-card",
    name: "Pera Wallet Card",
    type: "exchange",
    directions: ["out"],
    regions: ["US", "EU", "LATAM", "BR", "GLOBAL"],
    methods: ["cash.method.usdcAlgorand", "cash.method.cardSpend", "cash.method.autoConvert", "cash.method.web3Payments"],
    custody: "custodial",
    url: "https://perawallet.app/",
    noteKey: "cash.provider.peraCard.note",
  },
];

export function listProviders(direction: CashDirection, region: AppRegion) {
  return CASH_PROVIDERS.filter((provider) => {
    const supportsDirection = provider.directions.includes(direction);
    const supportsRegion = provider.regions.includes(region) || provider.regions.includes("GLOBAL");
    return supportsDirection && supportsRegion;
  }).sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    if (a.type === "onramp") return -1;
    if (b.type === "onramp") return 1;
    if (a.type === "exchange") return -1;
    if (b.type === "exchange") return 1;
    return 0;
  });
}

export function getProviderById(id: string) {
  return CASH_PROVIDERS.find((provider) => provider.id === id);
}
