import "server-only";

import { Connection, type Commitment } from "@solana/web3.js";

const PUBLIC_MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com";
const PUBLIC_DEVNET_RPC_URL = "https://api.devnet.solana.com";

export function getMainnetHeliusRpcUrl(apiKey: string) {
  const endpoint = new URL("https://mainnet.helius-rpc.com/");
  endpoint.searchParams.set("api-key", apiKey);

  return endpoint.toString();
}

function configuredEnvValue(value: string | undefined) {
  if (!value?.trim()) {
    return null;
  }

  const normalized = value.trim();
  const upper = normalized.toUpperCase();

  if (
    upper.includes("YOUR_KEY") ||
    upper.includes("YOUR_HELIUS_API_KEY_HERE")
  ) {
    return null;
  }

  return normalized;
}

export function getScannerRpcUrl() {
  const mainnetRpcUrl = configuredEnvValue(process.env.SOLANA_MAINNET_RPC_URL);
  const heliusApiKey = configuredEnvValue(process.env.HELIUS_API_KEY);

  if (mainnetRpcUrl) {
    return mainnetRpcUrl;
  }

  if (heliusApiKey) {
    return getMainnetHeliusRpcUrl(heliusApiKey);
  }

  return PUBLIC_MAINNET_RPC_URL;
}

export function getScannerConnection(commitment: Commitment = "confirmed") {
  const rpcUrl = getScannerRpcUrl();

  return {
    connection: new Connection(rpcUrl, commitment),
    network: "mainnet-beta" as const,
    rpcUrl,
  };
}

export function getTokenCreatorRpcUrl() {
  return configuredEnvValue(process.env.SOLANA_DEVNET_RPC_URL) ?? PUBLIC_DEVNET_RPC_URL;
}

export function getTokenCreatorConnection(commitment: Commitment = "confirmed") {
  const rpcUrl = getTokenCreatorRpcUrl();

  return {
    connection: new Connection(rpcUrl, commitment),
    network: "devnet" as const,
    rpcUrl,
  };
}
