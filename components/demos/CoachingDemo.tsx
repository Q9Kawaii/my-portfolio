"use client";
import { ArrowRight, BookOpen, CalendarDays, Check, MapPin, Monitor, Users } from "lucide-react";
import { useMemo, useState } from "react";

const C = { navy: "#0f1530", navy2: "#18214a", ink: "#0f1530", soft: "#525b7a", accent: "#facc15", paper: "#ffffff", bg: "#f5f6fb", line: "#e3e6f0" };

type Course = { id: string; name: string; goal: "JEE" | "NEET" | "Boards"; grades: string[]; months: number; fee: number; mode: "Classroom" | "Online" | "Both"; batch: string; seats: number };
const COURSES: Course[] = [
  { id: "jee2", name: "JEE Main + Advanced (2-year)", goal: "JEE", grades: ["11"], months: 22, fee: 145000, mode: "Both", batch: "Mon–Sat · 4:30–7:30 pm", seats: 12 },
  { id: "jee1", name: "JEE Crash + Test Series", goal: "JEE", grades: ["12", "Dropper"], months: 10, fee: 95000, mode: "Both", batch: "Mon–Sat · 9 am–1 pm", seats: 6 },
  { id: "neet2", name: "NEET Foundation (2-year)", goal: "NEET", grades: ["11"], months: 22, fee: 135000, mode: "Classroom", batch: "Mon–Sat · 4:30–7:30 pm", seats: 18 },
  { id: "neet1", name: "NEET Repeater Programme", goal: "NEET", grades: ["12", "Dropper"], months: 10, fee: 90000, mode: "Classroom", batch: "Mon–Sat · 9 am–2 pm", seats: 9 },
  { id: "b10", name: "Class 10 Board Booster", goal: "Boards", grades: ["9", "10"], months: 9, fee: 38000, mode: "Both", batch: "Tue/Thu/Sat · 5–7 pm", seats: 20 },
  { id: "b12", name: "Class 12 PCM / PCB Boards", goal: "Boards", grades: ["11", "12"], months: 9, fee: 48000, mode: "Online", batch: "Mon/Wed/Fri · 6–8 pm", seats: 25 },
];
const GRADES = ["9", "10", "11", "12", "Dropper"];
const GOALS = ["JEE", "NEET", "Boards"] as const;

const FAQ = [
  ["Is there a demo class?", "Yes. Every course has two free trial classes before you pay anything."],
  ["What's the batch size?", "At most 30 students in classroom batches, so every doubt gets answered."],
  ["Can we pay in instalments?", "Yes, in three instalments with no extra charge. See the EMI toggle in the fee table."],
  ["Do you provide study material?", "Printed modules, weekly tests and an online test portal are included in the fee."],
];

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function CoachingDemo({ font }: { font: string }) {
  const [grade, setGrade] = useState("11");
  const [goal, setGoal] = useState<(typeof GOALS)[number]>("JEE");
  const [emi, setEmi] = useState(false);
  const [sent, setSent] = useState<{ name: string; course: string } | null>(null);
  const [err, setErr] = useState("");
  const matches = useMemo(() => COURSES.filter((c) => c.goal === goal && c.grades.includes(grade)), [grade, goal]);

  function enquire(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("student") || "").trim();
    const phone = String(f.get("phone") || "").replace(/\D/g, "");
    const course = String(f.get("course") || "");
    if (name.length < 2) return setErr("Please add the student's name.");
    if (!/^[6-9]\d{9}$/.test(phone.slice(-10))) return setErr("Please add a parent's 10-digit mobile number.");
    if (!course) return setErr("Choose a course.");
    setErr("");
    try {
      const all = JSON.parse(localStorage.getItem("demo-coaching-enquiries") || "[]");
      localStorage.setItem("demo-coaching-enquiries", JSON.stringify([...all, { name, phone, course, at: Date.now() }].slice(-20)));
    } catch {}
    setSent({ name, course });
  }

  const input = "mt-1.5 w-full rounded-lg border bg-white px-4 py-3 text-[0.95rem] outline-none focus:ring-2 focus:ring-[#facc15]";

  return (
    <div className={`${font} min-h-screen`} style={{ background: C.bg, color: C.ink }}>
      {/* Hero */}
      <section style={{ background: C.navy, color: "#fff" }}>
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <p className="flex items-center gap-2 text-lg font-bold">
            <span className="grid size-9 place-items-center rounded-lg font-bold" style={{ background: C.accent, color: C.navy }}>S</span>
            Summit Coaching
          </p>
          <nav className="hidden gap-7 text-sm opacity-80 md:flex">
            <a href="#courses">Courses</a>
            <a href="#fees">Fees</a>
            <a href="#faq">FAQ</a>
          </nav>
          <a href="#enquire" className="rounded-lg px-4 py-2 text-sm font-bold" style={{ background: C.accent, color: C.navy }}>Free demo class</a>
        </header>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-16 pt-8 sm:px-8 md:grid-cols-[1.15fr_1fr] md:pb-24 md:pt-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ background: C.navy2, color: C.accent }}>
              Admissions open · 2027 batches
            </p>
            <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl">
              Small batches.<br />
              <span style={{ color: C.accent }}>Serious results.</span>
            </h1>
            <p className="mt-5 max-w-md text-lg opacity-80">JEE, NEET and board-exam coaching in Velachery, Chennai, with every class also streamed live.</p>
            <dl className="mt-8 flex flex-wrap gap-8">
              {[["30", "max batch size"], ["2", "free demo classes"], ["6", "programmes"]].map(([v, k]) => (
                <div key={k}>
                  <dt className="sr-only">{k}</dt>
                  <dd><span className="block text-3xl font-bold" style={{ color: C.accent }}>{v}</span><span className="text-sm opacity-70">{k}</span></dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Course finder */}
          <div className="rounded-2xl p-6 sm:p-7" style={{ background: C.paper, color: C.ink }}>
            <p className="text-lg font-bold">Find your course</p>
            <p className="mt-4 text-sm font-semibold" style={{ color: C.soft }}>I&apos;m in</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {GRADES.map((g) => (
                <button key={g} onClick={() => setGrade(g)} className="rounded-lg border px-3.5 py-1.5 text-sm font-semibold" style={grade === g ? { background: C.navy, color: "#fff", borderColor: C.navy } : { borderColor: C.line }}>
                  {g === "Dropper" ? g : `Class ${g}`}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold" style={{ color: C.soft }}>Preparing for</p>
            <div className="mt-2 flex gap-2">
              {GOALS.map((g) => (
                <button key={g} onClick={() => setGoal(g)} className="flex-1 rounded-lg border px-3 py-1.5 text-sm font-semibold" style={goal === g ? { background: C.accent, borderColor: C.accent } : { borderColor: C.line }}>
                  {g}
                </button>
              ))}
            </div>
            <ul className="mt-5 space-y-2" aria-live="polite">
              {matches.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 rounded-lg p-3" style={{ background: C.bg }}>
                  <span>
                    <span className="block text-sm font-bold">{c.name}</span>
                    <span className="text-xs" style={{ color: C.soft }}>{c.batch} · {c.seats} seats left</span>
                  </span>
                  <a href="#enquire" className="shrink-0 text-sm font-bold underline">Enquire</a>
                </li>
              ))}
              {!matches.length && <li className="rounded-lg p-3 text-sm" style={{ background: C.bg, color: C.soft }}>No {goal} batch for this class yet. Try Class 11, 12 or Dropper.</li>}
            </ul>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section id="courses" className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
        <h2 className="text-4xl font-bold tracking-tight">Programmes</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((c) => (
            <article key={c.id} className="flex flex-col rounded-2xl border bg-white p-6" style={{ borderColor: C.line }}>
              <span className="self-start rounded-md px-2 py-0.5 text-xs font-bold" style={{ background: C.accent }}>{c.goal}</span>
              <h3 className="mt-3 text-lg font-bold">{c.name}</h3>
              <ul className="mt-3 space-y-1.5 text-sm" style={{ color: C.soft }}>
                <li className="flex gap-2"><Users size={16} className="shrink-0" /> {c.grades.map((g) => (g === "Dropper" ? g : `Class ${g}`)).join(", ")}</li>
                <li className="flex gap-2"><CalendarDays size={16} className="shrink-0" /> {c.batch}</li>
                <li className="flex gap-2">{c.mode === "Online" ? <Monitor size={16} className="shrink-0" /> : <MapPin size={16} className="shrink-0" />} {c.mode === "Both" ? "Classroom or online" : c.mode}</li>
                <li className="flex gap-2"><BookOpen size={16} className="shrink-0" /> {c.months} months, material included</li>
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Fees */}
      <section id="fees" className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-bold tracking-tight">Fees</h2>
            <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
              Pay in 3 instalments
              <button role="switch" aria-checked={emi} onClick={() => setEmi((v) => !v)} className="relative h-7 w-12 rounded-full transition-colors" style={{ background: emi ? C.navy : C.line }}>
                <span className="absolute top-1 size-5 rounded-full bg-white transition-all" style={{ left: emi ? "1.6rem" : "0.25rem" }} />
              </button>
            </label>
          </div>
          <div className="mt-8 overflow-x-auto rounded-2xl border" style={{ borderColor: C.line }}>
            <table className="w-full min-w-[36rem] text-left">
              <thead className="text-sm" style={{ background: C.bg, color: C.soft }}>
                <tr>{["Programme", "Duration", emi ? "Per instalment" : "Total fee", "Includes"].map((h) => <th key={h} className="px-5 py-3.5 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {COURSES.map((c) => (
                  <tr key={c.id} className="border-t" style={{ borderColor: C.line }}>
                    <td className="px-5 py-4 font-semibold">{c.name}</td>
                    <td className="px-5 py-4" style={{ color: C.soft }}>{c.months} months</td>
                    <td className="px-5 py-4 text-lg font-bold">{emi ? `${inr(Math.ceil(c.fee / 3))} × 3` : inr(c.fee)}</td>
                    <td className="px-5 py-4 text-sm" style={{ color: C.soft }}>Material, tests, doubt sessions</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm" style={{ color: C.soft }}>Fees include GST. 10% sibling discount. Sample prices for this demo.</p>
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquire" className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1.2fr] md:py-24">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Book a free demo class</h2>
          <ol className="mt-8 space-y-5">
            {["We call you back within one working day.", "You pick a demo class that suits your timetable.", "After two classes, decide. No pressure, no fee until then."].map((s, i) => (
              <li key={s} className="flex gap-4">
                <span className="grid size-8 shrink-0 place-items-center rounded-full font-bold" style={{ background: C.accent }}>{i + 1}</span>
                <span className="pt-1" style={{ color: C.soft }}>{s}</span>
              </li>
            ))}
          </ol>
        </div>
        {sent ? (
          <div className="rounded-2xl p-8 text-white" style={{ background: C.navy }} aria-live="polite">
            <Check size={36} style={{ color: C.accent }} />
            <p className="mt-4 text-2xl font-bold">Thanks! We&apos;ve got {sent.name.split(" ")[0]}&apos;s enquiry.</p>
            <p className="mt-2 opacity-80">Course: {sent.course}. Expect a call within one working day. (In this demo, nothing is actually sent.)</p>
            <button onClick={() => setSent(null)} className="mt-6 rounded-lg px-5 py-2.5 font-bold" style={{ background: C.accent, color: C.navy }}>New enquiry</button>
          </div>
        ) : (
          <form onSubmit={enquire} noValidate className="grid gap-4 rounded-2xl border bg-white p-6 sm:grid-cols-2 sm:p-8" style={{ borderColor: C.line }}>
            <label className="text-sm font-semibold sm:col-span-2">Student&apos;s name<input name="student" className={input} style={{ borderColor: C.line }} /></label>
            <label className="text-sm font-semibold">Parent&apos;s mobile<input name="phone" inputMode="tel" className={input} style={{ borderColor: C.line }} /></label>
            <label className="text-sm font-semibold">Course
              <select name="course" defaultValue="" className={input} style={{ borderColor: C.line }}>
                <option value="" disabled>Choose a course</option>
                {COURSES.map((c) => <option key={c.id}>{c.name}</option>)}
              </select>
            </label>
            <fieldset className="text-sm font-semibold sm:col-span-2">
              <legend>Preferred mode</legend>
              <div className="mt-2 flex gap-4 font-normal">
                {["Classroom", "Online"].map((m) => (
                  <label key={m} className="flex items-center gap-2"><input type="radio" name="mode" value={m} defaultChecked={m === "Classroom"} className="accent-[#0f1530]" /> {m}</label>
                ))}
              </div>
            </fieldset>
            {err && <p className="text-sm font-semibold text-red-700 sm:col-span-2" role="alert">{err}</p>}
            <button className="flex items-center justify-center gap-2 rounded-lg py-3.5 font-bold sm:col-span-2" style={{ background: C.navy, color: "#fff" }}>Request a call back <ArrowRight size={18} /></button>
          </form>
        )}
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-white">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 md:py-24">
          <h2 className="text-4xl font-bold tracking-tight">Questions parents ask</h2>
          <div className="mt-8 divide-y" style={{ borderColor: C.line }}>
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-4" style={{ borderColor: C.line }}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                  {q}
                  <span className="text-2xl transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="mt-2" style={{ color: C.soft }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: C.navy, color: "#fff" }}>
        <p className="mx-auto max-w-6xl px-5 py-8 text-sm opacity-70 sm:px-8">Summit Coaching Centre · Velachery, Chennai · A fictional institute</p>
      </footer>
    </div>
  );
}
