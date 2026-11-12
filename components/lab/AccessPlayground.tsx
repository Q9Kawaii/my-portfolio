"use client";
import { useState } from "react";
import { Verdict } from "./ExhibitFrame";

type Role = "student" | "faculty" | "admin";
type User = { id: string; name: string; role: Role; advisees?: string[] };

const USERS: User[] = [
  { id: "s1", name: "Aarav (student)", role: "student" },
  { id: "s2", name: "Priya (student)", role: "student" },
  { id: "f1", name: "Dr. Mehta (Aarav's advisor)", role: "faculty", advisees: ["s1"] },
  { id: "a1", name: "Admin", role: "admin" },
];

type RuleId = "attendanceRead" | "attendanceWrite" | "achievementApprove" | "profileName" | "profileRole" | "userDelete";

type Req = {
  id: string;
  label: string;
  call: string;
  rule: RuleId;
  check: (u: User) => { allow: boolean; why: string };
};

const isAdvisorOf = (u: User, s: string) => u.role === "faculty" && !!u.advisees?.includes(s);

const REQUESTS: Req[] = [
  {
    id: "r1",
    label: "Read Aarav's attendance",
    call: "get  /students/s1/attendance",
    rule: "attendanceRead",
    check: (u) =>
      u.id === "s1"
        ? { allow: true, why: "It's their own record." }
        : isAdvisorOf(u, "s1")
          ? { allow: true, why: "They are Aarav's faculty advisor." }
          : u.role === "admin"
            ? { allow: true, why: "Admins can read every record." }
            : { allow: false, why: "Not the student, their advisor, or an admin." },
  },
  {
    id: "r2",
    label: "Read Priya's attendance",
    call: "get  /students/s2/attendance",
    rule: "attendanceRead",
    check: (u) =>
      u.id === "s2"
        ? { allow: true, why: "It's their own record." }
        : isAdvisorOf(u, "s2")
          ? { allow: true, why: "They are Priya's faculty advisor." }
          : u.role === "admin"
            ? { allow: true, why: "Admins can read every record." }
            : u.role === "faculty"
              ? { allow: false, why: "Faculty only see their own advisees, and Priya isn't one." }
              : { allow: false, why: "Students can't read each other's records." },
  },
  {
    id: "r3",
    label: "Change Aarav's attendance",
    call: "update /students/s1/attendance",
    rule: "attendanceWrite",
    check: (u) =>
      u.role === "admin"
        ? { allow: true, why: "Attendance is synced by admins only." }
        : { allow: false, why: u.id === "s1" ? "Students can never edit their own attendance." : "Only admins can edit attendance." },
  },
  {
    id: "r4",
    label: "Approve Aarav's achievement",
    call: "update /achievements/ach7 { status: 'approved' }",
    rule: "achievementApprove",
    check: (u) =>
      isAdvisorOf(u, "s1") || u.role === "admin"
        ? { allow: true, why: u.role === "admin" ? "Admins can approve anything." : "Advisors approve their advisees' achievements." }
        : { allow: false, why: u.id === "s1" ? "You can't approve your own submission." : "Only Aarav's advisor or an admin can approve it." },
  },
  {
    id: "r5",
    label: "Edit Aarav's display name",
    call: "update /users/s1 { name: 'Aarav S.' }",
    rule: "profileName",
    check: (u) =>
      u.id === "s1" || u.role === "admin"
        ? { allow: true, why: u.id === "s1" ? "Users can edit their own name." : "Admins can edit any profile." }
        : { allow: false, why: "Only the owner or an admin can edit a profile." },
  },
  {
    id: "r6",
    label: "Make Aarav an admin",
    call: "update /users/s1 { role: 'admin' }",
    rule: "profileRole",
    check: (u) =>
      u.role === "admin"
        ? { allow: true, why: "Only admins can change roles." }
        : {
            allow: false,
            why: u.id === "s1" ? "Privilege escalation blocked: users can't change their own role field." : "Only admins can change roles.",
          },
  },
  {
    id: "r7",
    label: "Delete Priya's account",
    call: "delete /users/s2",
    rule: "userDelete",
    check: (u) => (u.role === "admin" ? { allow: true, why: "Admins manage accounts." } : { allow: false, why: "Only admins can delete accounts." }),
  },
];

const RULES: { id: RuleId; text: string }[] = [
  {
    id: "attendanceRead",
    text: `match /students/{sid}/attendance {
  allow read: if request.auth.uid == sid
    || isAdvisorOf(sid)
    || hasRole('admin');`,
  },
  { id: "attendanceWrite", text: `  allow write: if hasRole('admin');\n}` },
  {
    id: "achievementApprove",
    text: `match /achievements/{aid} {
  allow update: if (isAdvisorOf(resource.data.studentId)
      || hasRole('admin'))
    && request.auth.uid != resource.data.studentId;
}`,
  },
  {
    id: "profileName",
    text: `match /users/{uid} {
  allow update: if (request.auth.uid == uid || hasRole('admin'))`,
  },
  {
    id: "profileRole",
    text: `    && (!changes('role') || hasRole('admin'));`,
  },
  { id: "userDelete", text: `  allow delete: if hasRole('admin');\n}` },
];

export default function AccessPlayground() {
  const [actor, setActor] = useState<User>(USERS[0]);
  const [log, setLog] = useState<{ n: number; req: Req; allow: boolean; why: string; who: string }[]>([]);
  const [lastRule, setLastRule] = useState<RuleId | null>(null);

  function send(req: Req) {
    const r = req.check(actor);
    setLastRule(req.rule);
    setLog((l) => [{ n: (l[0]?.n ?? 0) + 1, req, who: actor.name, ...r }, ...l].slice(0, 8));
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <div>
        <p className="mono-label">1. Sign in as</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Acting user">
          {USERS.map((u) => (
            <button
              key={u.id}
              type="button"
              role="radio"
              aria-checked={actor.id === u.id}
              onClick={() => setActor(u)}
              className={`min-h-12 border px-4 py-2.5 text-left text-sm transition-colors ${
                actor.id === u.id ? "border-ink bg-ink text-on-ink" : "border-line bg-surface text-text hover:border-muted"
              }`}
            >
              <span className="block font-semibold">{u.name}</span>
              <span className={`font-mono text-[0.7rem] uppercase tracking-[0.1em] ${actor.id === u.id ? "opacity-75" : "text-muted"}`}>
                role: {u.role}
              </span>
            </button>
          ))}
        </div>

        <p className="mono-label mt-8">2. Send a request</p>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {REQUESTS.map((req) => {
            const r = req.check(actor);
            return (
              <li key={req.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[0.95rem] text-text">{req.label}</p>
                  <p className="truncate font-mono text-[0.72rem] text-muted">{req.call}</p>
                </div>
                <button type="button" onClick={() => send(req)} className="btn btn-ghost btn-sm">
                  Send
                </button>
                <span className="w-[4.6rem] text-right">
                  <Verdict kind={r.allow ? "pass" : "fail"}>{r.allow ? "Allow" : "Deny"}</Verdict>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="space-y-6">
        <div className="card p-5">
          <p className="mono-label">Request log</p>
          <ol className="mt-3 space-y-3" aria-live="polite">
            {log.length === 0 && <li className="text-sm text-muted">Press Send on any request to see the decision.</li>}
            {log.map((e) => (
              <li key={e.n} className="border-l-2 pl-3 text-sm" style={{ borderColor: e.allow ? "var(--ok)" : "var(--danger)" }}>
                <p className="font-mono text-[0.75rem] text-text">
                  <span className={e.allow ? "text-ok" : "text-danger"}>{e.allow ? "200 OK" : "403 PERMISSION_DENIED"}</span> · {e.req.call}
                </p>
                <p className="text-muted">
                  {e.who}: {e.why}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="overflow-hidden border border-line bg-[#141414] text-[#e9e4d8]">
          <p className="border-b border-white/10 px-4 py-2 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-white/60">firestore.rules</p>
          <pre className="overflow-x-auto p-4 font-mono text-[0.76rem] leading-relaxed">
            {RULES.map((r) => (
              <code
                key={r.id}
                className={`block whitespace-pre transition-colors ${lastRule === r.id ? "bg-[#ffb000]/20 text-white" : ""}`}
              >
                {r.text}
              </code>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}
