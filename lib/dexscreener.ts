import type { MarketSummary } from "@/types/scan";

interface DexPair {
  chainId?: string;
  dexId?: string;
  pairAddress?: string;
  url?: string;
  baseToken?: {
    address?: string;
    name?: string;
    symbol?: string;
  };
  quoteToken?: {
    address?: string;
    name?: string;
    symbol?: string;
  };
  priceUsd?: string;
  liquidity?: {
    usd?: number;
  };
  fdv?: number;
  marketCap?: number;
  volume?: {
    h24?: number;
  };
  priceChange?: {
    h24?: number;
  };
  info?: {
    imageUrl?: string;
  };
}

interface DexResponse {
  pairs?: DexPair[] | null;
}

export const EMPTY_MARKET: MarketSummary = {
  priceUsd: null,
  liquidityUsd: null,
  fdv: null,
  marketCap: null,
  volume24h: null,
  priceChange24h: null,
  dexId: null,
  pairAddress: null,
  pairUrl: null,
  tokenName: null,
  tokenSymbol: null,
  tokenLogo: null,
};

export async function fetchBestDexPair(mint: string): Promise<MarketSummary> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mint}`,
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 30 },
      },
    );

    if (!response.ok) {
      return EMPTY_MARKET;
    }

    const data = (await response.json()) as DexResponse;
    const pairs = (data.pairs ?? []).filter((pair) => pair.chainId === "solana");

    if (pairs.length === 0) {
      return EMPTY_MARKET;
    }

    const bestPair = pairs.sort(
      (a, b) => (b.liquidity?.usd ?? 0) - (a.liquidity?.usd ?? 0),
    )[0];
    const matchedToken =
      bestPair.baseToken?.address === mint
        ? bestPair.baseToken
        : bestPair.quoteToken?.address === mint
          ? bestPair.quoteToken
          : null;

    return {
      priceUsd: bestPair.priceUsd ?? null,
      liquidityUsd: bestPair.liquidity?.usd ?? null,
      fdv: bestPair.fdv ?? null,
      marketCap: bestPair.marketCap ?? null,
      volume24h: bestPair.volume?.h24 ?? null,
      priceChange24h: bestPair.priceChange?.h24 ?? null,
      dexId: bestPair.dexId ?? null,
      pairAddress: bestPair.pairAddress ?? null,
      pairUrl: bestPair.url ?? null,
      tokenName: matchedToken?.name ?? null,
      tokenSymbol: matchedToken?.symbol ?? null,
      tokenLogo: bestPair.info?.imageUrl ?? null,
    };
  } catch {
    return EMPTY_MARKET;
  }
}
