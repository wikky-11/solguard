import { PublicKey } from "@solana/web3.js";

export function normalizeSolanaAddress(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return {
      ok: false as const,
      error: "Enter a Solana token mint address.",
    };
  }

  try {
    const publicKey = new PublicKey(trimmed);
    const normalized = publicKey.toBase58();

    if (normalized !== trimmed) {
      return {
        ok: false as const,
        error: "Invalid Solana mint address.",
      };
    }

    return {
      ok: true as const,
      address: normalized,
    };
  } catch {
    return {
      ok: false as const,
      error: "Invalid Solana mint address.",
    };
  }
}
