"use client";
import { useState } from "react";
import { type Row, SqlError, selectWhere } from "@/lib/lab/miniSql";
import { Verdict } from "./ExhibitFrame";

const USERS: Row[] = [
  { id: 1, username: "admin", password: "S3cure!Adm1n#2026", role: "admin" },
  { id: 2, username: "aarav", password: "hunter2", role: "student" },
  { id: 3, username: "priya", password: "correct-horse-battery", role: "student" },
];

const SQL_PAYLOADS = [
  { label: "Normal login", u: "aarav", p: "hunter2" },
  { label: "Wrong password", u: "aarav", p: "guess" },
  { label: "' OR '1'='1' --", u: "' OR '1'='1' --", p: "anything" },
  { label: "admin' --", u: "admin' --", p: "anything" },
  { label: "Break the quote", u: "aarav'", p: "x" },
];

type Outcome = { ok: boolean; title: string; detail: string; query: string; rows?: Row[] };

function vulnerableLogin(u: string, p: string): Outcome {
  // String concatenation: the user's input becomes part of the SQL code.
  const where = `username = '${u}' AND password = '${p}'`;
  const query = `SELECT * FROM users WHERE ${where}`;
  try {
    const rows = selectWhere(USERS, where);
    return rows.length
      ? { ok: true, title: `Logged in as ${rows[0].username} (${rows[0].role})`, detail: `${rows.length} row(s) matched.`, query, rows }
      : { ok: false, title: "Login failed", detail: "No user matched.", query, rows };
  } catch (e) {
    // Real apps that print DB errors hand attackers a map of the query.
    return { ok: false, title: "Database error shown to the user", detail: e instanceof SqlError ? e.message : "error", query };
  }
}

function safeLogin(u: string, p: string): Outcome {
  // Parameterised: the query shape is fixed and inputs are only ever compared as values.
  const query = `SELECT * FROM users WHERE username = ? AND password = ?   -- params: [${JSON.stringify(u)}, ${JSON.stringify(p)}]`;
  const rows = USERS.filter((r) => r.username === u && r.password === p);
  return rows.length
    ? { ok: true, title: `Logged in as ${rows[0].username} (${rows[0].role})`, detail: "Exactly one user matched.", query, rows }
    : { ok: false, title: "Login failed", detail: "The input was treated as plain text, so nothing matched.", query, rows };
}

function ResultCard({ side, o }: { side: "vuln" | "safe"; o: Outcome | null }) {
  const leaked = side === "vuln" && o?.ok && (o.rows?.length ?? 0) > 0 && o.rows![0].username !== "aarav";
  return (
    <div className={`card flex h-full flex-col p-5 ${side === "vuln" ? "border-danger/50" : "border-ok/50"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="mono-label">{side === "vuln" ? "Vulnerable: string concatenation" : "Fixed: parameterised query"}</p>
        <Verdict kind={side === "vuln" ? "fail" : "pass"}>{side === "vuln" ? "Before" : "After"}</Verdict>
      </div>
      {o ? (
        <>
          <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all bg-surface-2/70 p-3 font-mono text-[0.76rem] leading-relaxed text-text">{o.query}</pre>
          <p className={`h3 mt-4 text-xl ${leaked ? "text-danger" : o.ok ? "text-ok" : "text-text"}`}>{o.title}</p>
          <p className="mt-1 text-sm text-muted">{o.detail}</p>
          {leaked && <p className="mt-3 text-sm font-semibold text-danger">Authentication bypassed without knowing a password.</p>}
        </>
      ) : (
        <p className="mt-4 text-sm text-muted">Run a login to see this side.</p>
      )}
    </div>
  );
}

function SqlLab() {
  const [u, setU] = useState("aarav");
  const [p, setP] = useState("hunter2");
  const [res, setRes] = useState<{ v: Outcome; s: Outcome } | null>(null);
  const run = (uu = u, pp = p) => setRes({ v: vulnerableLogin(uu, pp), s: safeLogin(uu, pp) });

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {SQL_PAYLOADS.map((x) => (
          <button
            key={x.label}
            type="button"
            onClick={() => {
              setU(x.u);
              setP(x.p);
              run(x.u, x.p);
            }}
            className="tag tag-hover cursor-pointer px-2.5 py-1"
          >
            {x.label}
          </button>
        ))}
      </div>
      <form
        className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <label className="block">
          <span className="mono-label">Username</span>
          <input value={u} onChange={(e) => setU(e.target.value)} spellCheck={false} autoComplete="off" className="mt-1.5 min-h-11 w-full border border-line bg-surface px-3 font-mono text-sm text-text focus:border-accent focus:outline-none" />
        </label>
        <label className="block">
          <span className="mono-label">Password</span>
          <input value={p} onChange={(e) => setP(e.target.value)} spellCheck={false} autoComplete="off" className="mt-1.5 min-h-11 w-full border border-line bg-surface px-3 font-mono text-sm text-text focus:border-accent focus:outline-none" />
        </label>
        <button type="submit" className="btn btn-primary self-end">
          Log in to both
        </button>
      </form>
      <div className="mt-6 grid gap-5 md:grid-cols-2" aria-live="polite">
        <ResultCard side="vuln" o={res?.v ?? null} />
        <ResultCard side="safe" o={res?.s ?? null} />
      </div>
    </div>
  );
}

const XSS_PAYLOADS = [
  { label: "Normal comment", v: "Great article, thanks!" },
  { label: "Harmless HTML", v: "This is <b>bold</b> and <i>italic</i>" },
  {
    label: "Script via image error",
    v: `<img src=x onerror="document.body.insertAdjacentHTML('beforeend','<p class=pwn>⚠ Script ran. On a real site it could read your session, change the page or send requests as you.</p>')">`,
  },
  { label: "Fake login form", v: `<form><p class=pwn>Session expired. Re-enter password:</p><input type=password placeholder=password></form>` },
];

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const frameDoc = (body: string) => `<!doctype html><meta charset=utf-8><style>
body{font:14px/1.5 system-ui,sans-serif;margin:12px;color:#141414;background:#faf7f0}
.c{border-bottom:1px solid #d3c9b4;padding:8px 0}.n{font:600 11px ui-monospace,monospace;text-transform:uppercase;letter-spacing:.1em;color:#4b463d}
.pwn{color:#a12a1c;font-weight:600;border:2px solid #a12a1c;padding:8px;margin:8px 0}input{border:1px solid #999;padding:4px}
</style><div class=c><div class=n>Priya</div>Nice write-up on RBAC.</div><div class=c><div class=n>You</div>${body}</div>`;

function XssLab() {
  const [text, setText] = useState(XSS_PAYLOADS[2].v);
  const [posted, setPosted] = useState<string | null>(null);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {XSS_PAYLOADS.map((x) => (
          <button key={x.label} type="button" onClick={() => { setText(x.v); setPosted(x.v); }} className="tag tag-hover cursor-pointer px-2.5 py-1">
            {x.label}
          </button>
        ))}
      </div>
      <form
        className="mt-5"
        onSubmit={(e) => {
          e.preventDefault();
          setPosted(text);
        }}
      >
        <label className="mono-label" htmlFor="xss-in">
          Comment
        </label>
        <textarea id="xss-in" value={text} onChange={(e) => setText(e.target.value)} rows={3} spellCheck={false} className="mt-1.5 w-full border border-line bg-surface p-3 font-mono text-sm text-text focus:border-accent focus:outline-none" />
        <button type="submit" className="btn btn-primary mt-3">
          Post to both
        </button>
      </form>
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {(["vuln", "safe"] as const).map((side) => (
          <div key={side} className={`card p-4 ${side === "vuln" ? "border-danger/50" : "border-ok/50"}`}>
            <div className="flex items-center justify-between gap-3">
              <p className="mono-label">{side === "vuln" ? "Vulnerable: raw innerHTML" : "Fixed: escaped output"}</p>
              <Verdict kind={side === "vuln" ? "fail" : "pass"}>{side === "vuln" ? "Before" : "After"}</Verdict>
            </div>
            {/* sandbox without allow-same-origin: scripts run in an isolated origin with no access to this site. */}
            <iframe
              title={side === "vuln" ? "Vulnerable comment section" : "Fixed comment section"}
              sandbox="allow-scripts"
              srcDoc={posted === null ? frameDoc("<i>Nothing posted yet.</i>") : frameDoc(side === "vuln" ? posted : escapeHtml(posted))}
              className="mt-3 h-56 w-full border border-line bg-[#faf7f0]"
            />
            <p className="mt-3 font-mono text-[0.72rem] text-muted">
              {side === "vuln" ? "el.innerHTML = comment" : "el.textContent = comment   // or a template that escapes"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InjectionLab() {
  const [tab, setTab] = useState<"sql" | "xss">("sql");
  return (
    <div>
      <div role="tablist" aria-label="Attack type" className="flex border-b border-line">
        {(
          [
            ["sql", "SQL injection"],
            ["xss", "Cross-site scripting (XSS)"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-px min-h-11 border-b-2 px-4 font-mono text-[0.75rem] uppercase tracking-[0.1em] ${
              tab === id ? "border-accent text-text" : "border-transparent text-muted hover:text-text"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="pt-7" role="tabpanel">
        {tab === "sql" ? <SqlLab /> : <XssLab />}
      </div>
    </div>
  );
}
