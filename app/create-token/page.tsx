import type { Metadata } from "next";
import { DevnetTokenCreator } from "@/components/devnet-token-creator";

export const metadata: Metadata = {
  title: "Create Devnet Token",
};

export const dynamic = "force-dynamic";

export default function CreateTokenPage() {
  const tokenCreatorNetwork =
    process.env.NEXT_PUBLIC_TOKEN_CREATOR_NETWORK ?? "devnet";

  return <DevnetTokenCreator tokenCreatorNetwork={tokenCreatorNetwork} />;
}
