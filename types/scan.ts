export type RiskLabel = "Low Risk" | "Medium Risk" | "High Risk";
export type RiskSeverity = "low" | "medium" | "high";

export interface TokenSummary {
  name: string | null;
  symbol: string | null;
  logo: string | null;
  decimals: number;
  supplyFormatted: string;
}

export interface AuthoritySummary {
  mintAuthority: string | null;
  mintAuthorityRevoked: boolean;
  freezeAuthority: string | null;
  freezeAuthorityRevoked: boolean;
}

export interface HolderAccount {
  address: string;
  amount: string;
  amountFormatted: string;
  uiAmount: string;
  percentage: number;
}

export interface HolderSummary {
  top1Percent: number | null;
  top5Percent: number | null;
  top10Percent: number | null;
  unavailable: boolean;
  errorReason: string | null;
  unavailableReason: string | null;
  list: HolderAccount[];
}

export interface MarketSummary {
  priceUsd: string | null;
  liquidityUsd: number | null;
  fdv: number | null;
  marketCap: number | null;
  volume24h: number | null;
  priceChange24h: number | null;
  dexId: string | null;
  pairAddress: string | null;
  pairUrl: string | null;
  tokenName?: string | null;
  tokenSymbol?: string | null;
  tokenLogo?: string | null;
}

export interface RiskReason {
  label: string;
  points: number;
  severity: RiskSeverity;
  detail: string;
}

export interface RiskSummary {
  score: number;
  label: RiskLabel;
  reasons: RiskReason[];
  badges: string[];
}

export interface ScanResult {
  mint: string;
  network: string;
  token: TokenSummary;
  authorities: AuthoritySummary;
  holders: HolderSummary;
  market: MarketSummary;
  risk: RiskSummary;
}

export interface ScanErrorResponse {
  error: string;
  code: string;
}
