import "server-only";
import { randomUUID } from "node:crypto";

/**
 * Tanova (Tsoka portal) client. Server-only: the secret key never reaches the
 * browser.
 *
 *   TANOVA_API_URL   e.g. https://tanovaapp.com/api/v
 *   TANOVA_API_KEY   the company's secret key (sk_live_…)
 *
 * Reads are cached with Next's fetch cache; writes carry an Idempotency-Key so a
 * double click or a retry never books twice.
 */

const BASE = (process.env.TANOVA_API_URL ?? "").replace(/\/$/, "");
const KEY = process.env.TANOVA_API_KEY ?? "";

export const tanovaConfigured = Boolean(BASE && KEY);

export class TanovaError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message);
  }
}

type Opts = {
  method?: "GET" | "POST" | "PUT" | "PATCH";
  body?: unknown;
  /** Seconds to cache a GET. 0 = never. */
  revalidate?: number;
  timeoutMs?: number;
  idempotencyKey?: string;
};

export async function tanova<T = unknown>(path: string, opts: Opts = {}): Promise<T> {
  if (!tanovaConfigured) throw new TanovaError("Tanova is not configured", 0, "not_configured");
  const method = opts.method ?? "GET";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 10_000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${KEY}`,
        Accept: "application/json",
        ...(opts.body ? { "Content-Type": "application/json" } : {}),
        ...(method !== "GET" ? { "Idempotency-Key": opts.idempotencyKey ?? randomUUID() } : {}),
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      signal: ctrl.signal,
      ...(method === "GET"
        ? opts.revalidate === 0
          ? { cache: "no-store" as const }
          : { next: { revalidate: opts.revalidate ?? 120 } }
        : { cache: "no-store" as const }),
    });
    const text = await res.text();
    const json = text ? safeJson(text) : null;
    if (!res.ok) {
      const err = (json as { error?: { code?: string; message?: string }; message?: string } | null) ?? {};
      throw new TanovaError(err.error?.message ?? err.message ?? `Tanova ${res.status}`, res.status, err.error?.code);
    }
    return (json ?? {}) as T;
  } catch (e) {
    if (e instanceof TanovaError) throw e;
    throw new TanovaError(e instanceof Error && e.name === "AbortError" ? "Tanova timed out" : "Tanova unreachable", 0, "network");
  } finally {
    clearTimeout(timer);
  }
}

function safeJson(t: string) {
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}
