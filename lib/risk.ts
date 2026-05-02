import type {
  AuthoritySummary,
  HolderSummary,
  MarketSummary,
  RiskLabel,
  RiskReason,
  RiskSummary,
  TokenSummary,
} from "@/types/scan";

interface ScoreInput {
  authorities: AuthoritySummary;
  holders: HolderSummary;
  market: MarketSummary;
  token: TokenSummary;
}

function isKnownStablecoin(token: TokenSummary) {
  const symbol = token.symbol?.toUpperCase();
  const name = token.name?.toLowerCase() ?? "";

  return (
    symbol === "USDC" ||
    symbol === "USDT" ||
    symbol === "PYUSD" ||
    name.includes("usd coin")
  );
}

function labelForScore(score: number): RiskLabel {
  if (score <= 30) {
    return "Low Risk";
  }

  if (score <= 65) {
    return "Medium Risk";
  }

  return "High Risk";
}

export function scoreTokenRisk({
  authorities,
  holders,
  market,
  token,
}: ScoreInput): RiskSummary {
  const reasons: RiskReason[] = [];
  const badges: string[] = [];
  const knownStablecoin = isKnownStablecoin(token);

  if (knownStablecoin) {
    badges.push("Known Stablecoin / Centralized Issuer");
  }

  const addReason = (
    label: string,
    points: number,
    detail: string,
    badge = label,
  ) => {
    reasons.push({
      label,
      points,
      detail,
      severity: points >= 20 ? "high" : points >= 15 ? "medium" : "low",
    });
    badges.push(badge);
  };

  if (!authorities.mintAuthorityRevoked) {
    addReason(
      "Mint Authority Active",
      35,
      "This token can still be minted by its authority. For centralized stablecoins this may be expected, but for unknown tokens it can be a major risk.",
    );
  }

  if (!authorities.freezeAuthorityRevoked) {
    addReason(
      "Freeze Authority Active",
      20,
      "The issuer can freeze token accounts. This is common for some regulated assets, but risky for unknown tokens.",
    );
  }

  if (holders.unavailable) {
    badges.push("Holder Data Unavailable");
  } else {
    if (holders.top1Percent !== null && holders.top1Percent > 25) {
      addReason(
        "Top Holder Above 25%",
        20,
        `The largest holder controls ${holders.top1Percent.toFixed(2)}% of supply.`,
        "High Holder Concentration",
      );
    }

    if (holders.top5Percent !== null && holders.top5Percent > 50) {
      addReason(
        "Top 5 Holders Above 50%",
        15,
        `The five largest holders control ${holders.top5Percent.toFixed(2)}% of supply.`,
        "High Holder Concentration",
      );
    }

    if (holders.top10Percent !== null && holders.top10Percent > 70) {
      addReason(
        "Top 10 Holders Above 70%",
        15,
        `The ten largest holders control ${holders.top10Percent.toFixed(2)}% of supply.`,
        "High Holder Concentration",
      );
    }
  }

  if (market.liquidityUsd === null) {
    addReason(
      "Liquidity Missing",
      20,
      "No reliable liquidity figure was available from DEX Screener.",
      "Low Liquidity",
    );
  } else if (market.liquidityUsd < 10_000) {
    addReason(
      "Liquidity Below $10,000",
      15,
      `Detected liquidity is $${market.liquidityUsd.toLocaleString("en-US", {
        maximumFractionDigits: 0,
      })}.`,
      "Low Liquidity",
    );
  }

  if (market.volume24h === null || market.volume24h < 1_000) {
    addReason(
      "Low Or Missing 24h Volume",
      10,
      "Thin trading volume can make exits harder and price data less reliable.",
    );
  }

  if (!market.pairUrl) {
    addReason(
      "No DEX Pair Found",
      15,
      "No Solana DEX pair was found for this mint on DEX Screener.",
    );
  }

  if (!token.name && !token.symbol && !token.logo) {
    badges.push("New/Unknown Token");
  }

  const score = Math.min(
    100,
    reasons.reduce((total, reason) => total + reason.points, 0),
  );

  return {
    score,
    label: labelForScore(score),
    reasons,
    badges: Array.from(new Set(badges)),
  };
}
