// Grading for the security-headers exhibit (/lab/headers). Pure functions, shared by the API route.

export type CheckStatus = "pass" | "warn" | "fail" | "info";

export type HeaderCheck = {
  id: string;
  name: string;
  status: CheckStatus;
  /** The header value as received (trimmed), or empty when missing. */
  value: string;
  /** One sentence: what we saw and what to do about it. */
  note: string;
  weight: number;
};

export type HeaderReport = {
  url: string;
  status: number;
  grade: string;
  score: number;
  checks: HeaderCheck[];
};

const clip = (v: string | null, n = 300) => (v ?? "").trim().slice(0, n);

/** Grades the response headers of one page. `cookies` are the raw Set-Cookie lines. */
export function gradeHeaders(url: string, status: number, h: Headers, cookies: string[]): HeaderReport {
  const https = url.startsWith("https://");
  const checks: HeaderCheck[] = [];

  // Strict-Transport-Security
  const hsts = clip(h.get("strict-transport-security"));
  const maxAge = Number(/max-age=(\d+)/i.exec(hsts)?.[1] ?? 0);
  checks.push({
    id: "hsts",
    name: "Strict-Transport-Security",
    weight: 20,
    value: hsts,
    status: !https ? "fail" : !hsts ? "fail" : maxAge >= 15552000 ? "pass" : "warn",
    note: !https
      ? "The site was served over plain HTTP. Serve it over HTTPS and redirect HTTP to HTTPS."
      : !hsts
        ? "Missing. Browsers may still try plain HTTP first; add max-age=63072000; includeSubDomains."
        : maxAge >= 15552000
          ? "Browsers will only use HTTPS for this site."
          : "Present but max-age is under 6 months. Raise it to at least 15552000.",
  });

  // Content-Security-Policy
  const csp = clip(h.get("content-security-policy"), 600);
  const cspRO = clip(h.get("content-security-policy-report-only"), 600);
  const scriptSrc = /(?:^|;)\s*script-src([^;]*)/i.exec(csp)?.[1] ?? /(?:^|;)\s*default-src([^;]*)/i.exec(csp)?.[1] ?? "";
  const weakCsp = /'unsafe-inline'|'unsafe-eval'|\*/.test(scriptSrc) && !/'nonce-|'strict-dynamic'|'sha(256|384|512)-/.test(scriptSrc);
  checks.push({
    id: "csp",
    name: "Content-Security-Policy",
    weight: 25,
    value: csp || cspRO,
    status: csp ? (weakCsp ? "warn" : "pass") : cspRO ? "warn" : "fail",
    note: csp
      ? weakCsp
        ? "Present, but scripts allow 'unsafe-inline', 'unsafe-eval' or *, which leaves room for XSS. Use nonces or hashes."
        : "Limits where scripts and other resources can load from, a strong defence against XSS."
      : cspRO
        ? "Only in report-only mode, so nothing is blocked yet. Enforce it once reports are clean."
        : "Missing. Without it, an injected script runs with full access to the page.",
  });

  // Clickjacking: X-Frame-Options or CSP frame-ancestors
  const xfo = clip(h.get("x-frame-options"));
  const frameAncestors = /frame-ancestors/i.test(csp);
  checks.push({
    id: "framing",
    name: "X-Frame-Options / frame-ancestors",
    weight: 15,
    value: xfo || (frameAncestors ? "CSP frame-ancestors" : ""),
    status: xfo || frameAncestors ? "pass" : "fail",
    note:
      xfo || frameAncestors
        ? "Other sites can't load this page in a frame, which blocks clickjacking."
        : "Missing. Another site could frame this page and trick visitors into clicking. Add X-Frame-Options: DENY.",
  });

  // X-Content-Type-Options
  const xcto = clip(h.get("x-content-type-options"));
  checks.push({
    id: "nosniff",
    name: "X-Content-Type-Options",
    weight: 10,
    value: xcto,
    status: /nosniff/i.test(xcto) ? "pass" : "fail",
    note: /nosniff/i.test(xcto)
      ? "Browsers won't guess file types, so an upload can't be run as a script."
      : "Missing. Add X-Content-Type-Options: nosniff.",
  });

  // Referrer-Policy
  const rp = clip(h.get("referrer-policy"));
  const leakyRp = /unsafe-url|no-referrer-when-downgrade/i.test(rp);
  checks.push({
    id: "referrer",
    name: "Referrer-Policy",
    weight: 10,
    value: rp,
    status: !rp ? "warn" : leakyRp ? "warn" : "pass",
    note: !rp
      ? "Missing. Browsers use a safe default today, but set strict-origin-when-cross-origin explicitly."
      : leakyRp
        ? "This policy can send full URLs (with query strings) to other sites. Use strict-origin-when-cross-origin."
        : "Full URLs aren't leaked to other sites.",
  });

  // Permissions-Policy
  const pp = clip(h.get("permissions-policy"));
  checks.push({
    id: "permissions",
    name: "Permissions-Policy",
    weight: 10,
    value: pp,
    status: pp ? "pass" : "warn",
    note: pp
      ? "Turns off browser features (camera, microphone, location) the site doesn't need."
      : "Missing. Add it to switch off features like camera=(), microphone=(), geolocation=().",
  });

  // Information disclosure
  const server = clip(h.get("server"));
  const powered = clip(h.get("x-powered-by"));
  const versioned = /\d+\.\d+/.test(server) || !!powered;
  checks.push({
    id: "disclosure",
    name: "Server / X-Powered-By",
    weight: 5,
    value: [server && `Server: ${server}`, powered && `X-Powered-By: ${powered}`].filter(Boolean).join("  ·  "),
    status: versioned ? "warn" : "pass",
    note: versioned
      ? "Reveals software and version numbers, which helps attackers pick known exploits. Remove or genericise them."
      : "Doesn't advertise software versions.",
  });

  // Cookies
  const weak = cookies.filter((c) => !/;\s*secure/i.test(c) || !/;\s*httponly/i.test(c) || !/;\s*samesite=/i.test(c));
  checks.push({
    id: "cookies",
    name: "Set-Cookie flags",
    weight: 5,
    value: cookies.length ? `${cookies.length} cookie${cookies.length > 1 ? "s" : ""} set` : "",
    status: !cookies.length ? "info" : weak.length ? "warn" : "pass",
    note: !cookies.length
      ? "No cookies set on this page."
      : weak.length
        ? `${weak.length} cookie${weak.length > 1 ? "s are" : " is"} missing Secure, HttpOnly or SameSite. Session cookies need all three.`
        : "Every cookie has Secure, HttpOnly and SameSite.",
  });

  const total = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.reduce((s, c) => s + (c.status === "pass" || c.status === "info" ? c.weight : c.status === "warn" ? c.weight / 2 : 0), 0);
  const score = Math.round((earned / total) * 100);
  const grade = score >= 95 ? "A+" : score >= 85 ? "A" : score >= 70 ? "B" : score >= 55 ? "C" : score >= 40 ? "D" : "F";

  return { url, status, grade, score, checks };
}
