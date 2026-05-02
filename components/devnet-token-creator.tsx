"use client";

import { Buffer } from "buffer";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  AuthorityType,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { ExternalLink, Loader2, Wallet } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TextField } from "@/components/ui/text-field";
import { parseUiAmount, shortAddress } from "@/lib/utils";

if (typeof window !== "undefined" && !window.Buffer) {
  window.Buffer = Buffer;
}

interface CreatedToken {
  mint: string;
  signature: string;
  explorerUrl: string;
  name: string;
  symbol: string;
  logoUrl: string;
  description: string;
}

interface DevnetTokenCreatorProps {
  tokenCreatorNetwork: string;
}

const DEVNET_RPC_PATH = "/api/solana/devnet";

function devnetRpcEndpoint() {
  if (typeof window === "undefined") {
    return DEVNET_RPC_PATH;
  }

  return `${window.location.origin}${DEVNET_RPC_PATH}`;
}

function walletProvider() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.solana;
}

export function DevnetTokenCreator({
  tokenCreatorNetwork,
}: DevnetTokenCreatorProps) {
  const isDevnet = tokenCreatorNetwork === "devnet";
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [tokenName, setTokenName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(9);
  const [initialSupply, setInitialSupply] = useState("1000000");
  const [logoUrl, setLogoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [revokeMintAuthority, setRevokeMintAuthority] = useState(true);
  const [revokeFreezeAuthority, setRevokeFreezeAuthority] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<CreatedToken | null>(null);

  const explorerWalletUrl = useMemo(() => {
    if (!walletAddress) {
      return null;
    }

    return `https://explorer.solana.com/address/${walletAddress}?cluster=devnet`;
  }, [walletAddress]);

  async function connectWallet() {
    setError(null);
    const provider = walletProvider();

    if (!provider) {
      setError("No Solana browser wallet was found. Install Phantom or another Solana wallet.");
      return;
    }

    try {
      const response = await provider.connect();
      setWalletAddress(new PublicKey(response.publicKey.toBase58()).toBase58());
    } catch (connectError) {
      setError(
        connectError instanceof Error
          ? connectError.message
          : "Wallet connection was rejected.",
      );
    }
  }

  async function createToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreatedToken(null);

    if (!isDevnet) {
      setError("Mainnet token creation is disabled in this MVP.");
      return;
    }

    const provider = walletProvider();

    if (!provider) {
      setError("Connect a Solana browser wallet before creating a token.");
      return;
    }

    if (!provider.signTransaction) {
      setError("The connected wallet does not support transaction signing.");
      return;
    }

    if (!tokenName.trim() || !symbol.trim()) {
      setError("Token name and symbol are required.");
      return;
    }

    if (decimals < 0 || decimals > 9 || !Number.isInteger(decimals)) {
      setError("Decimals must be a whole number from 0 to 9.");
      return;
    }

    setBusy(true);

    try {
      const walletPublicKey = walletAddress
        ? new PublicKey(walletAddress)
        : new PublicKey((await provider.connect()).publicKey.toBase58());
      const mintKeypair = Keypair.generate();
      const connection = new Connection(devnetRpcEndpoint(), "confirmed");
      const lamports = await getMinimumBalanceForRentExemptMint(connection);
      const tokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        walletPublicKey,
      );
      const amount = parseUiAmount(initialSupply, decimals);

      const transaction = new Transaction().add(
        SystemProgram.createAccount({
          fromPubkey: walletPublicKey,
          newAccountPubkey: mintKeypair.publicKey,
          lamports,
          space: MINT_SIZE,
          programId: TOKEN_PROGRAM_ID,
        }),
        createInitializeMintInstruction(
          mintKeypair.publicKey,
          decimals,
          walletPublicKey,
          walletPublicKey,
          TOKEN_PROGRAM_ID,
        ),
        createAssociatedTokenAccountInstruction(
          walletPublicKey,
          tokenAccount,
          walletPublicKey,
          mintKeypair.publicKey,
        ),
        createMintToInstruction(
          mintKeypair.publicKey,
          tokenAccount,
          walletPublicKey,
          amount,
        ),
      );

      if (revokeMintAuthority) {
        transaction.add(
          createSetAuthorityInstruction(
            mintKeypair.publicKey,
            walletPublicKey,
            AuthorityType.MintTokens,
            null,
          ),
        );
      }

      if (revokeFreezeAuthority) {
        transaction.add(
          createSetAuthorityInstruction(
            mintKeypair.publicKey,
            walletPublicKey,
            AuthorityType.FreezeAccount,
            null,
          ),
        );
      }

      const latestBlockhash = await connection.getLatestBlockhash("confirmed");
      transaction.feePayer = walletPublicKey;
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.partialSign(mintKeypair);

      const signedTransaction = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
      });

      const confirmation = await connection.confirmTransaction(
        {
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        },
        "confirmed",
      );

      if (confirmation.value.err) {
        throw new Error("Devnet transaction failed during confirmation.");
      }

      setWalletAddress(walletPublicKey.toBase58());
      setCreatedToken({
        mint: mintKeypair.publicKey.toBase58(),
        signature,
        explorerUrl: `https://explorer.solana.com/address/${mintKeypair.publicKey.toBase58()}?cluster=devnet`,
        name: tokenName.trim(),
        symbol: symbol.trim().toUpperCase(),
        logoUrl: logoUrl.trim(),
        description: description.trim(),
      });
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Could not create the Devnet token.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Badge variant="good">Devnet Only</Badge>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
          Create a Devnet SPL token
        </h1>
        <p className="mt-3 max-w-3xl text-slate-400">
          Devnet only. This is for testing and learning. Mainnet launch is
          disabled.
        </p>
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-50">
          Devnet only. This is for testing and learning. Mainnet launch is
          disabled.
        </div>
        <div className="rounded-lg border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-50">
          Mainnet token creation is disabled in this MVP.
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <Card className="p-5 sm:p-6">
          <form onSubmit={createToken} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                id="token-name"
                label="Token Name"
                value={tokenName}
                onChange={(event) => setTokenName(event.target.value)}
                placeholder="SolGuard Test Token"
                maxLength={64}
              />
              <TextField
                id="token-symbol"
                label="Symbol"
                value={symbol}
                onChange={(event) => setSymbol(event.target.value.toUpperCase())}
                placeholder="SGUARD"
                maxLength={12}
              />
              <TextField
                id="token-decimals"
                label="Decimals"
                type="number"
                min={0}
                max={9}
                step={1}
                value={decimals}
                onChange={(event) => setDecimals(Number(event.target.value))}
              />
              <TextField
                id="initial-supply"
                label="Initial Supply"
                value={initialSupply}
                onChange={(event) => setInitialSupply(event.target.value)}
                placeholder="1000000"
              />
              <TextField
                id="logo-url"
                label="Logo URL optional"
                value={logoUrl}
                onChange={(event) => setLogoUrl(event.target.value)}
                placeholder="https://..."
                className="sm:col-span-2"
              />
            </div>

            <label className="block space-y-2" htmlFor="token-description">
              <span className="text-sm font-medium text-slate-200">
                Description optional
              </span>
              <textarea
                id="token-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={4}
                className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/70 focus:ring-4 focus:ring-emerald-400/10"
                placeholder="Testing token for Devnet experiments"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-slate-950/55 p-4">
                <input
                  type="checkbox"
                  checked={revokeMintAuthority}
                  onChange={(event) => setRevokeMintAuthority(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 accent-emerald-300"
                />
                <span>
                  <span className="block font-semibold text-white">
                    Revoke mint authority after minting
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
                    Prevent future supply increases after this transaction.
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/10 bg-slate-950/55 p-4">
                <input
                  type="checkbox"
                  checked={revokeFreezeAuthority}
                  onChange={(event) => setRevokeFreezeAuthority(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 accent-emerald-300"
                />
                <span>
                  <span className="block font-semibold text-white">
                    Revoke freeze authority after creation
                  </span>
                  <span className="mt-1 block text-sm text-slate-500">
                    Prevent token-account freezing after this transaction.
                  </span>
                </span>
              </label>
            </div>

            {error ? (
              <div className="rounded-lg border border-rose-400/25 bg-rose-400/10 p-4 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="secondary" onClick={connectWallet}>
                <Wallet className="h-4 w-4" aria-hidden="true" />
                {walletAddress ? shortAddress(walletAddress, 6, 6) : "Connect Wallet"}
              </Button>
              <Button type="submit" disabled={!isDevnet || busy} className="sm:min-w-52">
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Creating...
                  </>
                ) : (
                  "Create Devnet Token"
                )}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="text-lg font-bold text-white">Wallet</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Network</dt>
                <dd className="mt-1 font-semibold text-emerald-200">Devnet</dd>
              </div>
              <div>
                <dt className="text-slate-500">RPC endpoint</dt>
                <dd className="mt-1 break-all font-mono text-slate-200">
                  Secure Devnet RPC proxy
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Connected address</dt>
                <dd className="mt-1 break-all font-mono text-slate-200">
                  {walletAddress ?? "Not connected"}
                </dd>
              </div>
            </dl>
            {explorerWalletUrl ? (
              <a
                href={explorerWalletUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
              >
                View wallet on explorer
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : null}
          </Card>

          {createdToken ? (
            <Card className="p-5">
              <Badge variant="good">Created</Badge>
              <h2 className="mt-3 text-xl font-bold text-white">
                {createdToken.name} ({createdToken.symbol})
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Mint address</dt>
                  <dd className="mt-1 break-all font-mono text-slate-200">
                    {createdToken.mint}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Signature</dt>
                  <dd className="mt-1 break-all font-mono text-slate-200">
                    {createdToken.signature}
                  </dd>
                </div>
              </dl>
              <a
                href={createdToken.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-200 hover:text-emerald-100"
              >
                View mint on Solana Explorer
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </Card>
          ) : (
            <Card className="p-5">
              <h2 className="text-lg font-bold text-white">Safety defaults</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <p>Mint authority revocation is enabled by default.</p>
                <p>Freeze authority revocation is enabled by default.</p>
                <p>Mainnet creation cannot be submitted from this MVP.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
