import { validatePublicHttpsEndpoint } from "@/lib/algorand/endpoint-validation";

export type NetworkId = "testnet" | "mainnet";

export type NetworkConfig = {
  id: NetworkId;
  label: string;
  algodEndpoints: string[];
  indexerEndpoints: string[];
  usdcAssetId: number;
  nfdRegistryAppId: number;
  explorerBaseUrl: string;
};

const envDefaultNetwork = process.env.NEXT_PUBLIC_DEFAULT_NETWORK;

export const DEFAULT_NETWORK: NetworkId = envDefaultNetwork === "testnet" ? "testnet" : "mainnet";

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  testnet: {
    id: "testnet",
    label: "TestNet",
    algodEndpoints: [
      "https://testnet-api.algonode.cloud",
      "https://testnet-api.4160.nodely.dev",
    ],
    indexerEndpoints: [
      "https://testnet-idx.algonode.cloud",
      "https://testnet-idx.4160.nodely.dev",
    ],
    usdcAssetId: 10458941,
    nfdRegistryAppId: 84366825,
    explorerBaseUrl: "https://lora.algokit.io/testnet",
  },
  mainnet: {
    id: "mainnet",
    label: "MainNet",
    algodEndpoints: [
      "https://mainnet-api.algonode.cloud",
      "https://mainnet-api.4160.nodely.dev",
    ],
    indexerEndpoints: [
      "https://mainnet-idx.algonode.cloud",
      "https://mainnet-idx.4160.nodely.dev",
    ],
    usdcAssetId: 31566704,
    nfdRegistryAppId: 760937186,
    explorerBaseUrl: "https://lora.algokit.io/mainnet",
  },
};

function prependValidatedEndpoint(target: string[], raw: string | undefined, label: string) {
  if (!raw) return;
  try {
    target.unshift(validatePublicHttpsEndpoint(raw, label));
  } catch {
    return;
  }
}

prependValidatedEndpoint(NETWORKS.testnet.algodEndpoints, process.env.NEXT_PUBLIC_TESTNET_ALGOD, "Testnet algod");
prependValidatedEndpoint(NETWORKS.testnet.indexerEndpoints, process.env.NEXT_PUBLIC_TESTNET_INDEXER, "Testnet indexer");
prependValidatedEndpoint(NETWORKS.mainnet.algodEndpoints, process.env.NEXT_PUBLIC_MAINNET_ALGOD, "Mainnet algod");
prependValidatedEndpoint(NETWORKS.mainnet.indexerEndpoints, process.env.NEXT_PUBLIC_MAINNET_INDEXER, "Mainnet indexer");

export function resolveExplorerTxUrl(config: NetworkConfig, txid: string) {
  return `${config.explorerBaseUrl}/transaction/${txid}`;
}
