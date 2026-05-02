import type { PublicKey, Transaction } from "@solana/web3.js";
import type { Buffer } from "buffer";

export interface BrowserSolanaWallet {
  isPhantom?: boolean;
  publicKey?: PublicKey;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect?: () => Promise<void>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
}

declare global {
  interface Window {
    solana?: BrowserSolanaWallet;
    Buffer?: typeof Buffer;
  }
}

export {};
