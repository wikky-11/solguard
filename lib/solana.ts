import "server-only";

import { Connection, PublicKey, type Commitment } from "@solana/web3.js";
import {
  getMint,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { normalizeSolanaAddress } from "@/lib/address";
import {
  getMainnetHeliusRpcUrl,
  getScannerConnection,
  getScannerRpcUrl,
} from "@/lib/connections";
import { EMPTY_MARKET, fetchBestDexPair } from "@/lib/dexscreener";
import { scoreTokenRisk } from "@/lib/risk";
import { formatTokenAmount } from "@/lib/utils";
import type {
  HolderAccount,
  HolderSummary,
  ScanResult,
  TokenSummary,
} from "@/types/scan";

export class ScanError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "ScanError";
    this.code = code;
    this.status = status;
  }
}

const RPC_BLOCKED_MESSAGE =
  "RPC request was blocked or rate-limited. Add HELIUS_API_KEY or SOLANA_MAINNET_RPC_URL in .env.local.";

function redactRpcUrl(endpoint: string) {
  try {
    const url = new URL(endpoint);

    if (url.searchParams.has("api-key")) {
      url.searchParams.set("api-key", "REDACTED");
    }

    return url.toString();
  } catch {
    return endpoint;
  }
}

function parsePublicKey(value: string) {
  const result = normalizeSolanaAddress(value);

  if (!result.ok) {
    throw new ScanError("Invalid Solana address", "INVALID_ADDRESS", 400);
  }

  return new PublicKey(result.address);
}

function normalizeRpcError(error: unknown): ScanError {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("429") || lower.includes("rate limit")) {
    return new ScanError(RPC_BLOCKED_MESSAGE, "RPC_BLOCKED", 503);
  }

  if (lower.includes("fetch failed") || lower.includes("network")) {
    return new ScanError(
      "Solana RPC network issue. Please try again shortly.",
      "NETWORK_ISSUE",
      503,
    );
  }

  if (
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("forbidden") ||
    lower.includes("unauthorized") ||
    lower.includes("blocked parameter")
  ) {
    return new ScanError(RPC_BLOCKED_MESSAGE, "RPC_BLOCKED", 503);
  }

  if (
    lower.includes("could not find mint") ||
    lower.includes("accountnotfound") ||
    lower.includes("account not found")
  ) {
    return new ScanError("Token not found", "TOKEN_NOT_FOUND", 404);
  }

  return new ScanError("Token not found", "TOKEN_NOT_FOUND", 404);
}

function isBlockedRpcError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  return (
    lower.includes("429") ||
    lower.includes("rate limit") ||
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("forbidden") ||
    lower.includes("unauthorized") ||
    lower.includes("blocked parameter") ||
    lower.includes("fetch failed") ||
    lower.includes("network")
  );
}

function logNonFatalScannerError(
  label: string,
  endpoint: string,
  error: unknown,
) {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.info(`SolGuard scanner ${label} unavailable`, {
    endpoint: redactRpcUrl(endpoint),
    technicalError: error instanceof Error ? error.message : String(error),
  });
}

function knownTokenFallback(mint: string): Partial<TokenSummary> {
  if (mint === "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") {
    return {
      name: "USD Coin",
      symbol: "USDC",
      logo: null,
    };
  }

  return {};
}

function percentOfSupply(amount: bigint, supply: bigint) {
  if (supply === 0n) {
    return 0;
  }

  return Number((amount * 1_000_000n) / supply) / 10_000;
}

async function fetchMetadata(mint: string): Promise<Partial<TokenSummary>> {
  const apiKey = process.env.HELIUS_API_KEY;
  const normalizedApiKey =
    apiKey &&
    !apiKey.toUpperCase().includes("YOUR_KEY") &&
    !apiKey.toUpperCase().includes("YOUR_HELIUS_API_KEY_HERE")
      ? apiKey
      : null;
  const endpoint = normalizedApiKey
    ? getMainnetHeliusRpcUrl(normalizedApiKey)
    : null;

  if (!endpoint) {
    return {};
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "solguard-token-metadata",
        method: "getAsset",
        params: {
          id: mint,
        },
      }),
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return {};
    }

    const data = await response.json();
    const result = data?.result;
    const metadata = result?.content?.metadata;
    const links = result?.content?.links;
    const tokenInfo = result?.token_info;

    return {
      name: metadata?.name?.trim() || tokenInfo?.name?.trim() || null,
      symbol: metadata?.symbol?.trim() || tokenInfo?.symbol?.trim() || null,
      logo: links?.image || tokenInfo?.image || null,
    };
  } catch {
    return {};
  }
}

async function getHolderSummary(
  connection: Connection,
  mintPublicKey: PublicKey,
  totalSupply: bigint,
  decimals: number,
): Promise<HolderSummary> {
  const largestAccounts = await connection.getTokenLargestAccounts(mintPublicKey);

  if (largestAccounts.value.length === 0) {
    return unavailableHolderSummary(
      "Largest token account data unavailable from RPC",
    );
  }

  const list: HolderAccount[] = largestAccounts.value.map((account) => {
    const amount = BigInt(account.amount);

    return {
      address: account.address.toBase58(),
      amount: account.amount,
      amountFormatted: formatTokenAmount(amount, decimals),
      uiAmount: account.uiAmountString ?? account.uiAmount?.toString() ?? "0",
      percentage: percentOfSupply(amount, totalSupply),
    };
  });

  const sumPercent = (count: number) =>
    list
      .slice(0, count)
      .reduce((total, holder) => total + holder.percentage, 0);

  return {
    top1Percent: sumPercent(1),
    top5Percent: sumPercent(5),
    top10Percent: sumPercent(10),
    unavailable: false,
    errorReason: null,
    unavailableReason: null,
    list,
  };
}

function unavailableHolderSummary(error: unknown): HolderSummary {
  const reason =
    typeof error === "string"
      ? error
      : "Largest token account data unavailable from RPC";

  return {
    top1Percent: null,
    top5Percent: null,
    top10Percent: null,
    unavailable: true,
    errorReason: reason,
    unavailableReason: reason,
    list: [],
  };
}

async function getHolderSummarySafe(
  connection: Connection,
  mintPublicKey: PublicKey,
  totalSupply: bigint,
  decimals: number,
  rpcUrl: string,
): Promise<HolderSummary> {
  try {
    return await getHolderSummary(
      connection,
      mintPublicKey,
      totalSupply,
      decimals,
    );
  } catch (error) {
    logNonFatalScannerError("holder lookup", rpcUrl, error);
    return unavailableHolderSummary(error);
  }
}

async function getMintInfo(
  connection: Connection,
  mintPublicKey: PublicKey,
  commitment: Commitment,
) {
  try {
    return {
      mintInfo: await getMint(
        connection,
        mintPublicKey,
        commitment,
        TOKEN_PROGRAM_ID,
      ),
      programId: TOKEN_PROGRAM_ID,
    };
  } catch (tokenProgramError) {
    if (isBlockedRpcError(tokenProgramError)) {
      throw normalizeRpcError(tokenProgramError);
    }

    try {
      return {
        mintInfo: await getMint(
          connection,
          mintPublicKey,
          commitment,
          TOKEN_2022_PROGRAM_ID,
        ),
        programId: TOKEN_2022_PROGRAM_ID,
      };
    } catch (token2022Error) {
      if (isBlockedRpcError(token2022Error)) {
        throw normalizeRpcError(token2022Error);
      }

      console.error("SolGuard scanner getMint error", {
        rpcUrl: redactRpcUrl(getScannerRpcUrl()),
        tokenProgramError:
          tokenProgramError instanceof Error
            ? tokenProgramError.message
            : String(tokenProgramError),
        token2022Error:
          token2022Error instanceof Error
            ? token2022Error.message
            : String(token2022Error),
      });

      throw new ScanError("Token not found", "TOKEN_NOT_FOUND", 404);
    }
  }
}

export async function scanToken(mint: string): Promise<ScanResult> {
  const mintPublicKey = parsePublicKey(mint);
  const commitment: Commitment = "confirmed";
  const { connection, network, rpcUrl } = getScannerConnection(commitment);
  const { mintInfo } = await getMintInfo(connection, mintPublicKey, commitment);
  const [holders, market, metadata] = await Promise.all([
    getHolderSummarySafe(
      connection,
      mintPublicKey,
      mintInfo.supply,
      mintInfo.decimals,
      rpcUrl,
    ),
    fetchBestDexPair(mintPublicKey.toBase58()),
    fetchMetadata(mintPublicKey.toBase58()),
  ]);
  const knownToken = knownTokenFallback(mintPublicKey.toBase58());

  const token: TokenSummary = {
    name: metadata.name ?? market.tokenName ?? knownToken.name ?? null,
    symbol: metadata.symbol ?? market.tokenSymbol ?? knownToken.symbol ?? null,
    logo: metadata.logo ?? market.tokenLogo ?? knownToken.logo ?? null,
    decimals: mintInfo.decimals,
    supplyFormatted: formatTokenAmount(mintInfo.supply, mintInfo.decimals),
  };

  const authorities = {
    mintAuthority: mintInfo.mintAuthority?.toBase58() ?? null,
    mintAuthorityRevoked: mintInfo.mintAuthority === null,
    freezeAuthority: mintInfo.freezeAuthority?.toBase58() ?? null,
    freezeAuthorityRevoked: mintInfo.freezeAuthority === null,
  };

  const risk = scoreTokenRisk({
    authorities,
    holders,
    market: market ?? EMPTY_MARKET,
    token,
  });

  return {
    mint: mintPublicKey.toBase58(),
    network,
    token,
    authorities,
    holders,
    market,
    risk,
  };
}
