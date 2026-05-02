import { NextResponse } from "next/server";
import { scanToken, ScanError } from "@/lib/solana";

export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function clientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function rateLimit(request: Request) {
  const key = clientKey(request);
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return null;
  }

  bucket.count += 1;

  if (bucket.count <= RATE_LIMIT_MAX_REQUESTS) {
    return null;
  }

  return Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
}

export async function GET(request: Request) {
  const retryAfter = rateLimit(request);

  if (retryAfter !== null) {
    return NextResponse.json(
      {
        error: "Too many scan requests. Please wait a moment and try again.",
        code: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
        },
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const mint = searchParams.get("mint");

  if (!mint) {
    return NextResponse.json(
      { error: "Missing mint address", code: "MISSING_MINT" },
      { status: 400 },
    );
  }

  try {
    const report = await scanToken(mint);
    return NextResponse.json(report);
  } catch (error) {
    if (error instanceof ScanError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    return NextResponse.json(
      { error: "API unavailable", code: "API_UNAVAILABLE" },
      { status: 503 },
    );
  }
}
