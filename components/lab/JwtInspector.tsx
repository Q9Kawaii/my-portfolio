"use client";
import { useMemo, useState } from "react";
import { Verdict } from "./ExhibitFrame";

type Finding = { kind: "pass" | "warn" | "fail" | "info"; title: string; note: string };

const b64urlEncode = (obj: unknown) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function b64urlDecode(part: string): unknown {
  const s = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = s + "=".repeat((4 - (s.length % 4)) % 4);
  return JSON.parse(decodeURIComponent(escape(atob(padded))));
}

const randomSig = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

/** Sample tokens are built on click so their timestamps are relative to now. */
function sample(kind: "good" | "bad" | "expired") {
  const now = Math.floor(Date.now() / 1000);
  if (kind === "good") {
    return [
      b64urlEncode({ alg: "RS256", typ: "JWT", kid: "2026-11" }),
      b64urlEncode({ iss: "https://auth.shineportal.online", aud: "shine-web", sub: "s1", role: "student", iat: now, exp: now + 900 }),
      randomSig(),
    ].join(".");
  }
  if (kind === "expired") {
    return [
      b64urlEncode({ alg: "HS256", typ: "JWT" }),
      b64urlEncode({ iss: "https://api.example.com", aud: "web", sub: "42", iat: now - 86400 * 40, exp: now - 86400 * 10 }),
      randomSig(),
    ].join(".");
  }
  return [
    b64urlEncode({ alg: "none", typ: "JWT" }),
    b64urlEncode({ sub: "s1", name: "Aarav", role: "admin", password: "hunter2", iat: now }),
    "",
  ].join(".");
}

const SENSITIVE = /^(pass(word)?|pwd|secret|ssn|aadhaar|pan|card(number)?|cvv|otp|pin|private_?key)$/i;

function ago(sec: number) {
  const a = Math.abs(sec);
  const v = a < 3600 ? `${Math.round(a / 60)} min` : a < 172800 ? `${Math.round(a / 3600)} h` : `${Math.round(a / 86400)} days`;
  return v;
}

function inspect(token: string) {
  const parts = token.trim().split(".");
  if (parts.length !== 3) return { error: "A JWT has three parts separated by dots: header.payload.signature." };
  let header: Record<string, unknown>, payload: Record<string, unknown>;
  try {
    header = b64urlDecode(parts[0]) as Record<string, unknown>;
    payload = b64urlDecode(parts[1]) as Record<string, unknown>;
  } catch {
    return { error: "The header or payload isn't valid base64url-encoded JSON." };
  }
  const f: Finding[] = [];
  const now = Math.floor(Date.now() / 1000);
  const alg = String(header.alg ?? "");

  if (!alg || alg.toLowerCase() === "none")
    f.push({ kind: "fail", title: 'Algorithm "none"', note: "The token isn't signed, so anyone can edit it (for example, change role to admin). Servers must reject alg: none." });
  else if (/^HS/.test(alg))
    f.push({ kind: "info", title: `Algorithm ${alg} (shared secret)`, note: "Fine if the secret is long and random and only the server knows it. Pin the expected algorithm when verifying." });
  else f.push({ kind: "pass", title: `Algorithm ${alg}`, note: "Signed with a private key; anyone can verify it with the public key, but only the issuer can create it." });

  if (!parts[2]) f.push({ kind: "fail", title: "No signature", note: "The signature part is empty, so the token's contents can't be trusted." });

  for (const h of ["jku", "x5u", "jwk"])
    if (h in header) f.push({ kind: "warn", title: `"${h}" header present`, note: "Lets the token say where to fetch its own key. Servers must ignore it or allow only trusted URLs." });

  const exp = typeof payload.exp === "number" ? payload.exp : null;
  const iat = typeof payload.iat === "number" ? payload.iat : null;
  if (exp === null) f.push({ kind: "fail", title: "No expiry (exp)", note: "A stolen token would work forever. Add a short exp, such as 15 minutes, and use refresh tokens." });
  else if (exp < now) f.push({ kind: "warn", title: `Expired ${ago(now - exp)} ago`, note: "Servers must reject it. If your app still accepts it, expiry isn't being checked." });
  else f.push({ kind: "pass", title: `Expires in ${ago(exp - now)}`, note: "The token stops working on its own." });

  if (exp !== null && iat !== null && exp - iat > 86400)
    f.push({ kind: "warn", title: `Long lifetime (${ago(exp - iat)})`, note: "Access tokens should live minutes, not days. Long ones widen the window after a leak." });
  if (iat !== null && iat > now + 60) f.push({ kind: "warn", title: "Issued in the future", note: "iat is ahead of the current time; check server clocks." });

  if (!("iss" in payload)) f.push({ kind: "warn", title: "No issuer (iss)", note: "Without it, a token from another service could be accepted." });
  if (!("aud" in payload)) f.push({ kind: "warn", title: "No audience (aud)", note: "Without it, a token meant for one app could be replayed against another." });

  const leaked = Object.keys(payload).filter((k) => SENSITIVE.test(k));
  if (leaked.length)
    f.push({ kind: "fail", title: `Sensitive data in payload: ${leaked.join(", ")}`, note: "JWT payloads are only encoded, not encrypted. Anyone holding the token can read them." });

  f.push({ kind: "info", title: "Signature not verified here", note: "Verifying needs the issuer's key. Decoding is not verifying: never trust a token's claims until the server has checked its signature." });

  return { header, payload, findings: f, parts };
}

export default function JwtInspector() {
  const [token, setToken] = useState("");
  const r = useMemo(() => (token.trim() ? inspect(token) : null), [token]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="mono-label mr-1">Load a sample:</span>
        <button type="button" className="tag tag-hover cursor-pointer px-2.5 py-1" onClick={() => setToken(sample("good"))}>
          Well-formed
        </button>
        <button type="button" className="tag tag-hover cursor-pointer px-2.5 py-1" onClick={() => setToken(sample("bad"))}>
          Broken
        </button>
        <button type="button" className="tag tag-hover cursor-pointer px-2.5 py-1" onClick={() => setToken(sample("expired"))}>
          Expired
        </button>
      </div>
      <label htmlFor="jwt" className="sr-only">
        JWT
      </label>
      <textarea
        id="jwt"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        rows={4}
        spellCheck={false}
        autoComplete="off"
        placeholder="eyJhbGciOi…"
        className="mt-4 w-full break-all border border-line bg-surface p-3 font-mono text-[0.8rem] leading-relaxed text-text focus:border-accent focus:outline-none"
      />
      <p className="mt-2 text-sm text-muted">Don&apos;t paste live production tokens anywhere, including here. Use test tokens.</p>

      <div aria-live="polite">
        {r && "error" in r && <p className="mt-6 border-l-2 border-danger pl-4 text-danger">{r.error}</p>}
        {r && "findings" in r && r.findings && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div className="space-y-4">
              {(
                [
                  ["Header", r.header],
                  ["Payload", r.payload],
                ] as const
              ).map(([name, obj]) => (
                <div key={name} className="overflow-hidden border border-line bg-[#141414] text-[#e9e4d8]">
                  <p className="border-b border-white/10 px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-white/60">{name}</p>
                  <pre className="overflow-x-auto p-4 font-mono text-[0.78rem] leading-relaxed">{JSON.stringify(obj, null, 2)}</pre>
                </div>
              ))}
            </div>
            <ul className="divide-y divide-line border-y border-line">
              {r.findings.map((x) => (
                <li key={x.title} className="flex gap-4 py-4">
                  <span className="w-[4.6rem] shrink-0">
                    <Verdict kind={x.kind}>{x.kind === "pass" ? "OK" : x.kind === "warn" ? "Risk" : x.kind === "fail" ? "Flaw" : "Note"}</Verdict>
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-text">{x.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted">{x.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
