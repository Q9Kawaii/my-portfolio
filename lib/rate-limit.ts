import "server-only";

/**
 * Best-effort sliding-window rate limiter kept in memory. It is per server
 * instance (Fluid Compute reuses instances, so it still catches bursts), which
 * is enough to stop casual spam without adding a datastore.
 */
export function createRateLimiter(limit: number, windowMs: number) {
  const hits = new Map<string, number[]>();
  return function limited(key: string) {
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) hits.clear(); // keep memory bounded
    return recent.length > limit;
  };
}

export const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
