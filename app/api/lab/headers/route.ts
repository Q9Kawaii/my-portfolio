import { NextResponse } from "next/server";
import { gradeHeaders } from "@/lib/lab/headers";
import { assertPublicUrl } from "@/lib/lab/ssrf";
import { clientIp, createRateLimiter } from "@/lib/rate-limit";

// Security-headers exhibit: fetch one public page and grade its response headers.
// Passive only: a single GET, the body is never read, nothing is sent but the request itself.
const limited = createRateLimiter(10, 10 * 60 * 1000); // 10 checks per IP per 10 minutes
const MAX_REDIRECTS = 4;

export async function POST(req: Request) {
  if (limited(clientIp(req))) {
    return NextResponse.json({ error: "Too many checks from this connection. Try again in a few minutes." }, { status: 429 });
  }
  const body = (await req.json().catch(() => null)) as { url?: unknown } | null;
  let input = typeof body?.url === "string" ? body.url.trim() : "";
  if (!input || input.length > 2048) return NextResponse.json({ error: "Enter a URL to check." }, { status: 400 });
  if (!/^https?:\/\//i.test(input)) input = `https://${input}`;

  try {
    let url = await assertPublicUrl(input);
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      const res = await fetch(url, {
        method: "GET",
        redirect: "manual",
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
        headers: { "User-Agent": "yashdingar.in security-headers check (passive)", Accept: "text/html,*/*" },
      });
      await res.body?.cancel().catch(() => {});

      const location = res.headers.get("location");
      if (res.status >= 300 && res.status < 400 && location) {
        if (hop === MAX_REDIRECTS) throw new Error("Too many redirects.");
        // Every hop is checked again, so a public site can't redirect us somewhere private.
        url = await assertPublicUrl(new URL(location, url).toString());
        continue;
      }
      const cookies = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
      return NextResponse.json(gradeHeaders(url.toString(), res.status, res.headers, cookies));
    }
    throw new Error("Too many redirects.");
  } catch (err) {
    const msg =
      err instanceof Error && err.name === "TimeoutError"
        ? "The site took too long to respond."
        : err instanceof Error && !/fetch failed|ENOTFOUND|ECONN|certificate/i.test(err.message)
          ? err.message
          : "Couldn't reach that site.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
