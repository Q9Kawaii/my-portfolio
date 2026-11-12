"use client";
import { CalendarCheck2, Check, ChevronLeft, Clock, LayoutDashboard, Stethoscope, Trash2, User } from "lucide-react";
import { useMemo, useState } from "react";
import { useHydrated, useLocalStore } from "@/lib/useClientStore";

const C = { bg: "#eef6f8", card: "#ffffff", ink: "#0b2a3a", soft: "#4d6573", accent: "#0e9f9a", accentInk: "#ffffff", line: "#d6e6ea" };

const SERVICES = [
  { id: "consult", name: "Consultation", mins: 20, price: 500, note: "Check-up and treatment plan" },
  { id: "clean", name: "Cleaning & polish", mins: 30, price: 800, note: "Scaling, polishing, fluoride" },
  { id: "filling", name: "Tooth-coloured filling", mins: 45, price: 1800, note: "Composite, single surface" },
  { id: "whiten", name: "Teeth whitening", mins: 60, price: 6000, note: "In-chair, one session" },
] as const;

type Booking = { id: string; service: string; date: string; slot: string; name: string; phone: string; price: number };
const KEY = "demo-clinic-bookings";
const SLOTS = ["9:00", "9:30", "10:00", "10:30", "11:00", "11:30", "12:00", "2:00", "2:30", "3:00", "3:30", "4:00", "4:30", "5:00"];

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
/** Pretend other patients already booked some slots: stable per date, so it doesn't flicker. */
function takenByOthers(date: string) {
  let h = 0;
  for (const c of date) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return new Set(SLOTS.filter((_, i) => ((h >> i) & 3) === 0));
}

const NO_BOOKINGS: Booking[] = [];

export default function ClinicDemo({ font }: { font: string }) {
  const [view, setView] = useState<"patient" | "owner">("patient");
  const [step, setStep] = useState(0);
  const [service, setService] = useState<(typeof SERVICES)[number] | null>(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [err, setErr] = useState("");
  const [bookings, setBookings] = useLocalStore<Booking[]>(KEY, NO_BOOKINGS);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const hydrated = useHydrated();
  // Next 7 open days (closed Sundays); only in the browser so dates match the visitor's clock.
  const days = useMemo(() => {
    const out: Date[] = [];
    if (!hydrated) return out;
    const d = new Date();
    while (out.length < 7) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) out.push(new Date(d));
    }
    return out;
  }, [hydrated]);

  const taken = useMemo(() => {
    if (!date) return new Set<string>();
    const s = takenByOthers(date);
    bookings.filter((b) => b.date === date).forEach((b) => s.add(b.slot));
    return s;
  }, [date, bookings]);

  function confirm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const phone = String(f.get("phone") || "").replace(/\D/g, "");
    if (name.length < 2) return setErr("Please enter the patient's name.");
    if (!/^[6-9]\d{9}$/.test(phone.slice(-10))) return setErr("Please enter a 10-digit mobile number.");
    const b: Booking = { id: Math.random().toString(36).slice(2, 8).toUpperCase(), service: service!.name, date, slot, name, phone: phone.slice(-10), price: service!.price };
    const next = [...bookings, b];
    setBookings(next);
    setConfirmed(b);
    setErr("");
    setStep(3);
  }

  function reset() {
    setStep(0);
    setService(null);
    setDate("");
    setSlot("");
    setConfirmed(null);
  }

  function cancel(id: string) {
    const next = bookings.filter((b) => b.id !== id);
    setBookings(next);
  }

  const pretty = (d: string) => new Date(d + "T00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
  const card = "rounded-2xl border p-5 sm:p-6";

  return (
    <div className={`${font} min-h-screen`} style={{ background: C.bg, color: C.ink }}>
      <header className="border-b bg-white" style={{ borderColor: C.line }}>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="flex items-center gap-2.5 text-lg font-bold">
            <span className="grid size-9 place-items-center rounded-xl text-white" style={{ background: C.accent }}><Stethoscope size={18} /></span>
            Northside Dental Studio
          </p>
          <div className="flex rounded-xl p-1" style={{ background: C.bg }} role="tablist" aria-label="View">
            {(
              [
                ["patient", "Book a visit", User],
                ["owner", "Clinic dashboard", LayoutDashboard],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={view === id}
                onClick={() => setView(id)}
                className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors"
                style={view === id ? { background: C.card, color: C.ink, boxShadow: "0 1px 3px rgb(0 0 0 / .08)" } : { color: C.soft }}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
        {view === "patient" ? (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Book an appointment</h1>
            <p className="mt-2" style={{ color: C.soft }}>Takes about a minute. We&apos;ll confirm by SMS.</p>
            <ol className="mt-8 flex flex-wrap gap-2 text-sm font-semibold" aria-label="Steps">
              {["Treatment", "Date & time", "Your details", "Done"].map((s, i) => (
                <li key={s} className="flex items-center gap-2 rounded-full px-3 py-1.5" style={i <= step ? { background: C.accent, color: C.accentInk } : { background: C.card, color: C.soft }}>
                  <span className="grid size-5 place-items-center rounded-full text-xs" style={{ background: i <= step ? "rgb(255 255 255 / .25)" : C.bg }}>{i < step ? <Check size={12} /> : i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>

            <div className="mt-8">
              {step === 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {SERVICES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setService(s); setStep(1); }}
                      className={`${card} text-left transition-shadow hover:shadow-lg`}
                      style={{ background: C.card, borderColor: C.line }}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span className="text-lg font-bold">{s.name}</span>
                        <span className="font-bold" style={{ color: C.accent }}>₹{s.price.toLocaleString("en-IN")}</span>
                      </span>
                      <span className="mt-1 block text-sm" style={{ color: C.soft }}>{s.note}</span>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-sm" style={{ color: C.soft }}><Clock size={14} /> {s.mins} min</span>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && service && (
                <div className={card} style={{ background: C.card, borderColor: C.line }}>
                  <button onClick={() => setStep(0)} className="mb-4 flex items-center gap-1 text-sm font-semibold" style={{ color: C.soft }}><ChevronLeft size={16} /> {service.name}</button>
                  <p className="font-bold">Pick a day</p>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                    {days.map((d) => {
                      const v = iso(d);
                      return (
                        <button key={v} onClick={() => { setDate(v); setSlot(""); }} className="min-w-[4.5rem] rounded-xl border px-3 py-2.5 text-center" style={date === v ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line }}>
                          <span className="block text-xs font-semibold uppercase opacity-70">{d.toLocaleDateString("en-IN", { weekday: "short" })}</span>
                          <span className="block text-xl font-bold">{d.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                  {date && (
                    <>
                      <p className="mt-6 font-bold">Pick a time</p>
                      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-7">
                        {SLOTS.map((s) => {
                          const busy = taken.has(s);
                          return (
                            <button
                              key={s}
                              disabled={busy}
                              onClick={() => setSlot(s)}
                              className="rounded-lg border py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:line-through"
                              style={slot === s ? { background: C.accent, color: "#fff", borderColor: C.accent } : busy ? { color: "#9fb2bb", borderColor: C.line, background: C.bg } : { borderColor: C.line }}
                            >
                              {s}
                            </button>
                          );
                        })}
                      </div>
                      <p className="mt-2 text-xs" style={{ color: C.soft }}>Morning 9–12:30 · Afternoon 2–5:30. Struck-through slots are taken.</p>
                    </>
                  )}
                  <button disabled={!slot} onClick={() => setStep(2)} className="mt-6 w-full rounded-xl py-3 font-bold text-white disabled:opacity-40 sm:w-auto sm:px-8" style={{ background: C.accent }}>Continue</button>
                </div>
              )}

              {step === 2 && service && (
                <form onSubmit={confirm} noValidate className={`${card} grid gap-4 sm:grid-cols-2`} style={{ background: C.card, borderColor: C.line }}>
                  <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1 text-sm font-semibold sm:col-span-2" style={{ color: C.soft }}><ChevronLeft size={16} /> {service.name} · {pretty(date)} · {slot}</button>
                  <label className="text-sm font-semibold">Patient name<input name="name" autoComplete="name" className="mt-1.5 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2" style={{ borderColor: C.line }} /></label>
                  <label className="text-sm font-semibold">Mobile<input name="phone" inputMode="tel" autoComplete="tel" className="mt-1.5 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2" style={{ borderColor: C.line }} /></label>
                  {err && <p className="text-sm font-semibold text-red-700 sm:col-span-2" role="alert">{err}</p>}
                  <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2">
                    <p className="text-sm" style={{ color: C.soft }}>Pay ₹{service.price.toLocaleString("en-IN")} at the clinic.</p>
                    <button className="rounded-xl px-8 py-3 font-bold text-white" style={{ background: C.accent }}>Confirm booking</button>
                  </div>
                </form>
              )}

              {step === 3 && confirmed && (
                <div className={`${card} text-center`} style={{ background: C.card, borderColor: C.line }} aria-live="polite">
                  <CalendarCheck2 size={44} className="mx-auto" style={{ color: C.accent }} />
                  <p className="mt-4 text-2xl font-extrabold">You&apos;re booked, {confirmed.name.split(" ")[0]}!</p>
                  <p className="mt-2" style={{ color: C.soft }}>{confirmed.service} · {pretty(confirmed.date)} at {confirmed.slot} · Ref {confirmed.id}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <button onClick={reset} className="rounded-xl border px-5 py-2.5 font-semibold" style={{ borderColor: C.line }}>Book another</button>
                    <button onClick={() => setView("owner")} className="rounded-xl px-5 py-2.5 font-semibold text-white" style={{ background: C.ink }}>See it in the dashboard →</button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Clinic dashboard</h1>
            <p className="mt-2" style={{ color: C.soft }}>What the owner sees. In a live app this sits behind a staff login.</p>
            <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                ["Upcoming bookings", String(bookings.length)],
                ["Expected revenue", `₹${bookings.reduce((s, b) => s + b.price, 0).toLocaleString("en-IN")}`],
                ["Next patient", bookings.length ? [...bookings].sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot))[0].name : "—"],
              ].map(([k, v]) => (
                <div key={k} className={card} style={{ background: C.card, borderColor: C.line }}>
                  <dt className="text-sm font-semibold" style={{ color: C.soft }}>{k}</dt>
                  <dd className="mt-1 truncate text-2xl font-extrabold">{v}</dd>
                </div>
              ))}
            </dl>
            <div className={`${card} mt-6 overflow-x-auto p-0 sm:p-0`} style={{ background: C.card, borderColor: C.line }}>
              <table className="w-full min-w-[34rem] text-left text-sm">
                <thead style={{ color: C.soft }}>
                  <tr className="border-b" style={{ borderColor: C.line }}>
                    {["Date", "Time", "Patient", "Treatment", "Fee", ""].map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[...bookings].sort((a, b) => (a.date + a.slot).localeCompare(b.date + b.slot)).map((b) => (
                    <tr key={b.id} className="border-b last:border-0" style={{ borderColor: C.line }}>
                      <td className="px-5 py-3 font-semibold">{pretty(b.date)}</td>
                      <td className="px-5 py-3">{b.slot}</td>
                      <td className="px-5 py-3">{b.name}<span className="block text-xs" style={{ color: C.soft }}>{b.phone.replace(/(\d{5})(\d{5})/, "$1 $2")}</span></td>
                      <td className="px-5 py-3">{b.service}</td>
                      <td className="px-5 py-3">₹{b.price.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => cancel(b.id)} aria-label={`Cancel ${b.name}'s booking`} className="rounded-lg p-2 text-red-700 hover:bg-red-50"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {!bookings.length && (
                    <tr><td colSpan={6} className="px-5 py-10 text-center" style={{ color: C.soft }}>No bookings yet. Switch to &quot;Book a visit&quot; and make one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
