# SolGuard

SolGuard is a production-minded Next.js MVP for Solana token safety research. Users can paste a token mint address and get a report covering mint authority, freeze authority, largest token accounts, market/liquidity data, and a transparent risk score.

Not financial advice. This tool only provides risk indicators. Always do your own research.

## Features

- Solana token mint scanner at `/scan`
- Shareable report pages at `/scan/[mint]`
- Server-side scanner API at `/api/scan?mint=<TOKEN_MINT_ADDRESS>`
- On-chain mint data using `@solana/web3.js` and `@solana/spl-token`
- Holder concentration via `getTokenLargestAccounts`
- DEX Screener market data for Solana pairs
- Optional Helius DAS metadata lookup when `HELIUS_API_KEY` is provided
- Transparent 0-100 risk scoring with reasons
- Client-side report link copy, HTML download, and print view
- Devnet-only SPL token creator at `/create-token`
- Static `/pricing` and `/about` pages

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
HELIUS_API_KEY=
SOLANA_MAINNET_RPC_URL=
SOLANA_DEVNET_RPC_URL=
NEXT_PUBLIC_TOKEN_CREATOR_NETWORK=devnet
NEXT_PUBLIC_APP_NAME=SolGuard
```

The scanner and token creator intentionally use separate network configuration:

- Scanner: always scans real Solana mainnet tokens. It uses `SOLANA_MAINNET_RPC_URL` first, then `HELIUS_API_KEY`, then public mainnet RPC fallback.
- Token creator: Devnet-only. It uses `SOLANA_DEVNET_RPC_URL` first, then `https://api.devnet.solana.com`.

If public mainnet RPC blocks holder lookups, the API returns:

```text
RPC request was blocked or rate-limited. Add HELIUS_API_KEY or SOLANA_MAINNET_RPC_URL in .env.local.
```
## Run Locally

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Build and Lint

```bash
npm run lint
npm run build
```

## QA Testing Steps

1. Start the app with `npm run dev`.
2. Open these routes and confirm each returns a page:
   - `http://localhost:3000/`
   - `http://localhost:3000/scan`
   - `http://localhost:3000/create-token`
   - `http://localhost:3000/pricing`
   - `http://localhost:3000/about`
3. Confirm the homepage mint input redirects to `/scan/[mint]` for a valid address and shows inline validation for empty or invalid input.
4. Confirm `/scan` shows a loading skeleton while the scan request is running.
5. Test the API with a real mainnet mint:

```bash
curl "http://localhost:3000/api/scan?mint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
```

6. Test invalid input:

```bash
curl "http://localhost:3000/api/scan?mint=not-a-mint"
```

Expected invalid response:

```json
{"error":"Invalid Solana address","code":"INVALID_ADDRESS"}
```

For reliable mainnet QA, set `HELIUS_API_KEY` or `SOLANA_MAINNET_RPC_URL`; public RPC endpoints commonly throttle `getTokenLargestAccounts`.

## Adding a Helius API Key

1. Create a Helius API key.
2. Set `HELIUS_API_KEY` in `.env.local`.
3. Restart the dev server.

When a key is present, the scanner uses Helius RPC for supported networks and attempts Helius DAS `getAsset` metadata lookup. This is recommended for production because holder concentration requires `getTokenLargestAccounts`, which public RPC endpoints may rate-limit.

## How Scanning Works

1. The API validates the mint address with `PublicKey`.
2. It fetches the SPL mint account and extracts supply, decimals, mint authority, and freeze authority.
3. It calls `getTokenLargestAccounts` and calculates top 1, top 5, and top 10 concentration.
4. It calls DEX Screener for Solana market data and chooses the pair with the highest liquidity.
5. It scores configured risk factors:
   - Mint authority active: +35
   - Freeze authority active: +20
   - Top 1 holder > 25%: +20
   - Top 5 holders > 50%: +15
   - Top 10 holders > 70%: +15
   - Liquidity missing: +20
   - Liquidity < $10,000: +15
   - 24h volume very low or missing: +10
   - DEX pair missing: +15

The final score is clamped from 0 to 100:

- 0-30: Low Risk
- 31-65: Medium Risk
- 66-100: High Risk

## Devnet Token Creator Warning

The token creator is Devnet-only. It creates a Devnet SPL mint, creates the wallet's associated token account, mints the initial supply, and can optionally revoke mint and freeze authorities.

Mainnet token creation is disabled in this MVP.

The name, symbol, logo URL, and description are part of the local UI flow. This MVP does not publish Metaplex metadata.

## Scripts

```bash
npm run dev
npm run build
npm run lint
```

## Disclaimer

Not financial advice. This tool only provides risk indicators. Always do your own research.
