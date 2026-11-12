"use client";
import { Eye, EyeOff, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

const COMMON = [
  "password", "123456", "qwerty", "admin", "welcome", "letmein", "iloveyou", "monkey", "dragon", "football",
  "abc123", "india", "cricket", "sunshine", "princess", "login", "master", "shadow", "pass", "secret",
];

/** Rough strength estimate: character-set entropy, minus penalties for patterns crackers try first. */
function analyse(pw: string) {
  const issues: string[] = [];
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/\d/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 33;
  let bits = pw.length * Math.log2(pool || 1);

  const lower = pw.toLowerCase();
  if (pw.length < 12) issues.push("Shorter than 12 characters. Length matters more than symbols.");
  if (COMMON.some((w) => lower.includes(w))) {
    bits -= 25;
    issues.push("Contains a very common password or word.");
  }
  if (/(.)\1{2,}/.test(pw)) {
    bits -= 10;
    issues.push("Repeats the same character three or more times.");
  }
  if (/(?:0123|1234|2345|3456|4567|5678|6789|abcd|bcde|qwer|wert|asdf|zxcv)/i.test(pw)) {
    bits -= 12;
    issues.push("Contains a keyboard or number sequence.");
  }
  if (/(?:19|20)\d{2}/.test(pw)) {
    bits -= 8;
    issues.push("Contains what looks like a year, which is easy to guess.");
  }
  if (/^[A-Z][a-z]+\d+[^A-Za-z0-9]?$/.test(pw)) {
    bits -= 10;
    issues.push("Follows the common Word + numbers + symbol pattern.");
  }
  bits = Math.max(0, bits);

  // Offline attack on a fast hash: ~10 billion guesses per second.
  const seconds = Math.pow(2, bits) / 2 / 1e10;
  const level = bits < 35 ? 0 : bits < 55 ? 1 : bits < 75 ? 2 : 3;
  return { bits: Math.round(bits), seconds, level, issues };
}

function human(seconds: number) {
  if (seconds < 1) return "instantly";
  const units: [number, string][] = [
    [3.15e9, "centuries"],
    [3.15e7, "years"],
    [2.6e6, "months"],
    [86400, "days"],
    [3600, "hours"],
    [60, "minutes"],
    [1, "seconds"],
  ];
  if (seconds > 4.3e17) return "in more time than the universe has existed";
  for (const [s, name] of units) {
    if (seconds >= s) {
      const n = seconds / s;
      return name === "centuries"
        ? `in about ${Math.max(1, Math.round(n / 100)).toLocaleString("en-IN")} centuries`
        : `in about ${Math.round(n).toLocaleString("en-IN")} ${name}`;
    }
  }
  return "instantly";
}

async function sha1Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
}

const LEVELS = ["Very weak", "Weak", "Good", "Strong"];

export default function PasswordCheck() {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [breach, setBreach] = useState<{ count: number; prefix: string } | null>(null);
  const [error, setError] = useState("");
  const a = useMemo(() => analyse(pw), [pw]);

  async function checkBreach() {
    setBusy(true);
    setError("");
    setBreach(null);
    try {
      const hash = await sha1Hex(pw);
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);
      // Add-Padding makes every response a similar size, so the reply leaks nothing either.
      const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, { headers: { "Add-Padding": "true" } });
      if (!res.ok) throw new Error();
      const text = await res.text();
      const line = text.split("\n").find((l) => l.startsWith(suffix));
      setBreach({ count: line ? Number(line.split(":")[1]) : 0, prefix });
    } catch {
      setError("Couldn't reach the breach database. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div>
        <label htmlFor="pw" className="mono-label">
          Password to test
        </label>
        <div className="mt-2 flex border border-line bg-surface focus-within:border-accent">
          <input
            id="pw"
            type={show ? "text" : "password"}
            value={pw}
            onChange={(e) => {
              setPw(e.target.value);
              setBreach(null);
            }}
            autoComplete="off"
            spellCheck={false}
            className="min-h-12 flex-1 bg-transparent px-4 font-mono text-[0.95rem] text-text focus:outline-none"
            placeholder="Type any password"
          />
          <button type="button" onClick={() => setShow((v) => !v)} className="px-4 text-muted hover:text-text" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="mt-2 text-sm text-muted">Use a test password if you prefer. Nothing you type here is stored.</p>

        {pw && (
          <div className="mt-8" aria-live="polite">
            <div className="flex items-baseline justify-between">
              <p className="h3 text-2xl text-text">{LEVELS[a.level]}</p>
              <p className="mono-label">~{a.bits} bits</p>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-2 ${i <= a.level ? (a.level >= 2 ? "bg-ok" : a.level === 1 ? "bg-warn" : "bg-danger") : "bg-line"}`}
                />
              ))}
            </div>
            <p className="mt-4 text-muted">
              An attacker with a stolen password database could guess it <strong className="text-text">{human(a.seconds)}</strong>.
            </p>
            {a.issues.length > 0 && (
              <ul className="mt-4 space-y-2">
                {a.issues.map((i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-text">
                    <span aria-hidden className="mt-[0.55em] size-1.5 shrink-0 bg-accent" />
                    {i}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="card p-6">
        <p className="mono-label">Has it been leaked?</p>
        <p className="mt-3 leading-relaxed text-muted">
          Checks the password against 900+ million passwords exposed in real breaches, using{" "}
          <a href="https://haveibeenpwned.com/Passwords" target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4">
            Have I Been Pwned
          </a>
          .
        </p>
        <button type="button" onClick={checkBreach} disabled={!pw || busy} className="btn btn-primary mt-5 w-full disabled:opacity-60">
          {busy && <Loader2 size={16} className="animate-spin" aria-hidden />}
          {busy ? "Checking…" : "Check breaches"}
        </button>
        <div aria-live="polite">
          {error && <p className="mt-4 text-sm text-danger">{error}</p>}
          {breach && (
            <div className="mt-6">
              {breach.count > 0 ? (
                <p className="flex gap-3 text-danger">
                  <ShieldAlert size={22} className="shrink-0" aria-hidden />
                  <span>
                    <strong>Found in {breach.count.toLocaleString("en-IN")} breaches.</strong> Attackers try these first, so never
                    use it anywhere.
                  </span>
                </p>
              ) : (
                <p className="flex gap-3 text-ok">
                  <ShieldCheck size={22} className="shrink-0" aria-hidden />
                  <span>
                    <strong>Not found in any known breach.</strong> That doesn&apos;t make it strong, so check the meter too.
                  </span>
                </p>
              )}
              <p className="mt-4 border-t border-line pt-4 font-mono text-[0.75rem] leading-relaxed text-muted">
                Sent to the API: <span className="text-text">{breach.prefix}</span>
                <br />
                That&apos;s the first 5 of 40 hash characters. Hundreds of passwords share it, and the match is checked here in your browser.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
