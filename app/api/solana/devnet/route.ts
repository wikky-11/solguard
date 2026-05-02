import { NextResponse } from "next/server";
import { getTokenCreatorRpcUrl } from "@/lib/connections";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: string;

  try {
    body = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Invalid RPC request", code: "INVALID_RPC_REQUEST" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(getTokenCreatorRpcUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
    });
    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ?? "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Devnet RPC unavailable", code: "DEVNET_RPC_UNAVAILABLE" },
      { status: 503 },
    );
  }
}

export function GET() {
  return NextResponse.json(
    { error: "Method not allowed", code: "METHOD_NOT_ALLOWED" },
    { status: 405 },
  );
}
