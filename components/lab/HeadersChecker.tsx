"use client";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import type { HeaderReport } from "@/lib/lab/headers";
import { Verdict } from "./ExhibitFrame";

const LABEL = { pass: "Pass", warn: "Weak", fail: "Missing", info: "Info" } as const;

export default function HeadersChecker() {
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<HeaderReport | null>(null);

  async function run(target: string) {
    setBusy(true);
    setError("");
    setReport(null);
    try {
      const res = await fetch("/api/lab/headers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const json = await res.json().catch(() => ({ error: "Unexpected response." }));
      if (!res.ok) setError(json.error || "Check failed.");
      else setReport(json as HeaderReport);
    } catch {
      setError("Couldn't run the check. Are you offline?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (url.trim()) run(url.trim());
        }}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <label className="sr-only" htmlFor="hdr-url">
          Website address
        </label>
        <input
          id="hdr-url"
          type="text"
          inputMode="url"
          autoComplete="url"
          spellCheck={false}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="example.com"
          className="min-h-12 flex-1 border border-line bg-surface px-4 font-mono text-[0.95rem] text-text focus:border-accent focus:outline-none"
        />
        <button type="submit" disabled={busy || !url.trim()} className="btn btn-primary disabled:opacity-60">
          {busy ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Search size={16} aria-hidden />}
          {busy ? "Checking…" : "Check headers"}
        </button>
      </form>
      <p className="mt-3 text-sm text-muted">
        No site handy?{" "}
        <button
          type="button"
          className="text-accent underline underline-offset-4"
          onClick={() => {
            setUrl("www.yashdingar.in");
            run("www.yashdingar.in");
          }}
        >
          Check this portfolio
        </button>
        . Please only check sites you own or have permission to test.
      </p>

      <div aria-live="polite">
        {error && <p className="mt-6 border-l-2 border-danger pl-4 text-danger">{error}</p>}

        {report && (
          <div className="mt-10">
            <div className="flex flex-wrap items-end gap-x-8 gap-y-4 border-b border-line pb-6">
              <div>
                <p className="mono-label">Grade</p>
                <p className={`display mt-1 text-8xl ${report.score >= 70 ? "text-ok" : report.score >= 40 ? "text-warn" : "text-danger"}`}>
                  {report.grade}
                </p>
              </div>
              <div className="min-w-0 pb-2">
                <p className="mono-label">Score {report.score}/100 · HTTP {report.status}</p>
                <p className="mt-1 break-all font-mono text-sm text-text">{report.url}</p>
              </div>
            </div>
            <ul className="divide-y divide-line">
              {report.checks.map((c) => (
                <li key={c.id} className="grid gap-3 py-5 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                  <div>
                    <Verdict kind={c.status}>{LABEL[c.status]}</Verdict>
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-text">{c.name}</p>
                    <p className="mt-1 leading-relaxed text-muted">{c.note}</p>
                    {c.value && (
                      <p className="mt-2 break-all bg-surface-2/70 px-3 py-2 font-mono text-[0.78rem] leading-relaxed text-text">{c.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
