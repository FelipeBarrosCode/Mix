import { generateSwapRouterTxns, getSwapRoute, SwapType, type SwapRouterResponse, type SupportedNetwork } from "@tinymanorg/tinyman-js-sdk";
import { runWithAlgodFallback } from "@/lib/algorand/clients";

function normalizeNetwork(networkId: string): SupportedNetwork {
  return networkId === "testnet" ? "testnet" : "mainnet";
}

export async function getTinymanFixedInputRoute(input: {
  networkId: string;
  assetInId: number;
  assetOutId: number;
  amountBaseUnits: bigint;
  slippage: string;
}) {
  return getSwapRoute({
    network: normalizeNetwork(input.networkId),
    assetInID: input.assetInId,
    assetOutID: input.assetOutId,
    amount: input.amountBaseUnits,
    swapType: SwapType.FixedInput,
    slippage: input.slippage,
  });
}

export async function buildTinymanSwapTxns(input: {
  initiatorAddr: string;
  route: SwapRouterResponse;
}) {
  return runWithAlgodFallback((client) =>
    generateSwapRouterTxns({
      client,
      initiatorAddr: input.initiatorAddr,
      route: input.route,
    }),
  );
}
