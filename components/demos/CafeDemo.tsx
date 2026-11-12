"use client";
import { Clock, Leaf, MapPin, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { useHydrated } from "@/lib/useClientStore";

const C = { bg: "#f3e9dc", paper: "#fbf6ef", ink: "#2b1d14", soft: "#6b5545", accent: "#c2410c", line: "#e2d3c1" };

type Item = { name: string; desc: string; price: number; cat: "Coffee" | "Breakfast" | "Bakes" | "Coolers"; veg: boolean; vegan?: boolean };
const MENU: Item[] = [
  { name: "Filter Kaapi", desc: "Chicory blend, brass tumbler, frothed by hand", price: 90, cat: "Coffee", veg: true },
  { name: "Flat White", desc: "Double ristretto, silky whole milk", price: 180, cat: "Coffee", veg: true },
  { name: "Oat Cortado", desc: "Equal parts espresso and steamed oat milk", price: 210, cat: "Coffee", veg: true, vegan: true },
  { name: "Cold Brew Tonic", desc: "18-hour cold brew over tonic and orange peel", price: 220, cat: "Coolers", veg: true, vegan: true },
  { name: "Masala Omelette Toast", desc: "Sourdough, green chilli, coriander, house chutney", price: 240, cat: "Breakfast", veg: false },
  { name: "Avocado Podi Toast", desc: "Smashed avocado, gunpowder podi, lime, seeds", price: 280, cat: "Breakfast", veg: true, vegan: true },
  { name: "Shakshuka", desc: "Eggs baked in spiced tomato, warm pav", price: 290, cat: "Breakfast", veg: true },
  { name: "Cardamom Bun", desc: "Laminated dough, cardamom sugar, baked every morning", price: 140, cat: "Bakes", veg: true },
  { name: "Banana Walnut Loaf", desc: "Brown butter, jaggery, toasted walnuts", price: 160, cat: "Bakes", veg: true },
  { name: "Mango Lassi Smoothie", desc: "Alphonso, curd, a pinch of saffron", price: 190, cat: "Coolers", veg: true },
];
const CATS = ["All", "Coffee", "Breakfast", "Bakes", "Coolers"] as const;

// Mon..Sun opening hours in 24h (index 0 = Sunday, like Date.getDay()).
const HOURS: [number, number][] = [[8, 22], [7.5, 21], [7.5, 21], [7.5, 21], [7.5, 21], [7.5, 22.5], [8, 22.5]];
const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const fmt = (h: number) => {
  const hh = Math.floor(h), mm = Math.round((h - hh) * 60);
  const ampm = hh >= 12 ? "pm" : "am";
  return `${((hh + 11) % 12) + 1}${mm ? `:${String(mm).padStart(2, "0")}` : ""} ${ampm}`;
};

const KEY = "demo-cafe-bookings";
type Booking = { name: string; phone: string; date: string; time: string; guests: number; ref: string };

export default function CafeDemo({ serif }: { serif: string }) {
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");
  const [vegan, setVegan] = useState(false);
  // Real time only in the browser, so the server render (no "open now" badge) matches hydration.
  const now = useHydrated() ? new Date() : null;
  const [done, setDone] = useState<Booking | null>(null);
  const [err, setErr] = useState("");

  const items = useMemo(() => MENU.filter((m) => (cat === "All" || m.cat === cat) && (!vegan || m.vegan)), [cat, vegan]);

  const open = now ? (() => { const [o, c] = HOURS[now.getDay()]; const h = now.getHours() + now.getMinutes() / 60; return h >= o && h < c; })() : null;
  const minDate = now ? now.toISOString().slice(0, 10) : undefined;

  function book(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const b: Booking = {
      name: String(f.get("name") || "").trim(),
      phone: String(f.get("phone") || "").trim(),
      date: String(f.get("date") || ""),
      time: String(f.get("time") || ""),
      guests: Number(f.get("guests") || 2),
      ref: "KC" + Math.random().toString(36).slice(2, 6).toUpperCase(),
    };
    if (b.name.length < 2) return setErr("Please add your name.");
    if (!/^[6-9]\d{9}$/.test(b.phone.replace(/\D/g, "").slice(-10))) return setErr("Please add a 10-digit mobile number.");
    if (!b.date || !b.time) return setErr("Pick a date and time.");
    setErr("");
    try {
      const all = JSON.parse(localStorage.getItem(KEY) || "[]");
      localStorage.setItem(KEY, JSON.stringify([...all, b].slice(-20)));
    } catch {}
    setDone(b);
    e.currentTarget.reset();
  }

  const field = "mt-1.5 w-full rounded-xl border px-4 py-3 text-[0.95rem] outline-none focus:ring-2";
  const fieldStyle = { borderColor: C.line, background: "#fff", color: C.ink } as const;

  return (
    <div style={{ background: C.bg, color: C.ink }} className="min-h-screen font-[system-ui]">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#top" className={`${serif} text-2xl font-semibold italic`}>Kettle &amp; Crumb</a>
        <nav className="hidden gap-7 text-sm sm:flex" style={{ color: C.soft }}>
          <a href="#menu" className="hover:underline">Menu</a>
          <a href="#visit" className="hover:underline">Visit</a>
          <a href="#book" className="hover:underline">Book a table</a>
        </nav>
        <a href="#book" className="rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: C.accent }}>Reserve</a>
      </header>

      {/* Hero */}
      <section id="top" className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 sm:px-8 md:grid-cols-[1.2fr_1fr] md:pb-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: C.accent }}>Neighbourhood café · Adyar, Chennai</p>
          <h1 className={`${serif} mt-4 text-5xl font-semibold leading-[1.02] sm:text-7xl`}>
            Slow coffee,<br />
            <em className="font-normal">warm bakes</em>, long tables.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed" style={{ color: C.soft }}>
            Filter kaapi brewed the old way, sourdough from our own oven and a quiet corner to stay a while.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#menu" className="rounded-full px-6 py-3 font-semibold text-white" style={{ background: C.ink }}>See the menu</a>
            {open !== null && (
              <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium" style={{ background: C.paper }}>
                <span className="size-2 rounded-full" style={{ background: open ? "#16a34a" : "#b91c1c" }} />
                {open ? `Open now · until ${fmt(HOURS[now!.getDay()][1])}` : `Closed · opens ${fmt(HOURS[(now!.getDay() + (now!.getHours() >= HOURS[now!.getDay()][1] ? 1 : 0)) % 7][0])}`}
              </span>
            )}
          </div>
        </div>
        {/* Illustration: a cup drawn with plain shapes (no images). */}
        <div aria-hidden className="relative mx-auto aspect-square w-full max-w-sm rounded-[2.5rem]" style={{ background: C.paper }}>
          <div className="absolute left-1/2 top-[30%] h-[38%] w-[46%] -translate-x-1/2 rounded-b-[45%] rounded-t-lg" style={{ background: C.accent }} />
          <div className="absolute right-[18%] top-[36%] h-[18%] w-[14%] rounded-r-full border-[10px] border-l-0" style={{ borderColor: C.accent }} />
          <div className="absolute left-1/2 top-[66%] h-[5%] w-[62%] -translate-x-1/2 rounded-full" style={{ background: C.ink, opacity: 0.85 }} />
          {[0, 1, 2].map((i) => (
            <div key={i} className="absolute top-[12%] h-[14%] w-[3%] rounded-full" style={{ left: `${40 + i * 9}%`, background: C.soft, opacity: 0.35 }} />
          ))}
        </div>
      </section>

      {/* Menu */}
      <section id="menu" style={{ background: C.paper }}>
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className={`${serif} text-4xl font-semibold sm:text-5xl`}>On the menu</h2>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={vegan} onChange={(e) => setVegan(e.target.checked)} className="size-4 accent-[#c2410c]" />
              <Leaf size={16} style={{ color: "#16a34a" }} /> Vegan only
            </label>
          </div>
          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Menu category">
            {CATS.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
                style={cat === c ? { background: C.ink, color: "#fff", borderColor: C.ink } : { borderColor: C.line, color: C.soft }}
              >
                {c}
              </button>
            ))}
          </div>
          <ul className="mt-10 grid gap-x-12 gap-y-7 md:grid-cols-2">
            {items.map((m) => (
              <li key={m.name} className="border-b pb-5" style={{ borderColor: C.line }}>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className={`${serif} text-xl font-semibold`}>
                    {m.name}
                    {m.vegan && <span className="ml-2 align-middle text-xs font-sans font-semibold text-[#16a34a]">VEGAN</span>}
                    {!m.veg && <span className="ml-2 align-middle text-xs font-sans font-semibold text-[#b91c1c]">EGG</span>}
                  </h3>
                  <span className="shrink-0 font-semibold">₹{m.price}</span>
                </div>
                <p className="mt-1 text-[0.95rem]" style={{ color: C.soft }}>{m.desc}</p>
              </li>
            ))}
            {!items.length && <li style={{ color: C.soft }}>Nothing vegan in this section yet. Try Coffee or Coolers.</li>}
          </ul>
        </div>
      </section>

      {/* Visit */}
      <section id="visit" className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
        <div>
          <h2 className={`${serif} text-4xl font-semibold sm:text-5xl`}>Come by</h2>
          <p className="mt-5 flex gap-3" style={{ color: C.soft }}><MapPin size={20} className="mt-0.5 shrink-0" /> 14, 2nd Main Road, Gandhi Nagar, Adyar, Chennai 600020</p>
          <p className="mt-3 flex gap-3" style={{ color: C.soft }}><Phone size={20} className="mt-0.5 shrink-0" /> +91 98xxx xxxxx (sample)</p>
          <table className="mt-8 w-full max-w-sm text-[0.95rem]">
            <caption className="mb-3 flex items-center gap-2 text-left font-semibold"><Clock size={18} /> Opening hours</caption>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 0].map((d) => (
                <tr key={d} className="border-b" style={{ borderColor: C.line, fontWeight: now?.getDay() === d ? 700 : 400 }}>
                  <td className="py-2">{DAY[d]}</td>
                  <td className="py-2 text-right">{fmt(HOURS[d][0])} – {fmt(HOURS[d][1])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Stylised map: blocks and a pin, no third-party embed. */}
        <div aria-label="Map showing the café near Adyar" role="img" className="relative min-h-72 overflow-hidden rounded-3xl" style={{ background: "#e8dccb" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute h-full w-3" style={{ left: `${10 + i * 16}%`, background: "#f6efe4" }} />
          ))}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="absolute h-3 w-full" style={{ top: `${15 + i * 22}%`, background: "#f6efe4" }} />
          ))}
          <div className="absolute bottom-0 left-0 h-1/4 w-full" style={{ background: "#b9d4d6" }} />
          <div className="absolute left-[46%] top-[38%] -translate-x-1/2 -translate-y-full">
            <div className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg" style={{ background: C.accent }}>Kettle &amp; Crumb</div>
            <div className="mx-auto h-3 w-0.5" style={{ background: C.accent }} />
          </div>
        </div>
      </section>

      {/* Booking */}
      <section id="book" style={{ background: C.ink, color: "#fbf6ef" }}>
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1fr_1.2fr] md:py-24">
          <div>
            <h2 className={`${serif} text-4xl font-semibold sm:text-5xl`}>Book a table</h2>
            <p className="mt-4 max-w-sm leading-relaxed opacity-80">Weekends fill up by Friday. We&apos;ll hold your table for 15 minutes.</p>
          </div>
          {done ? (
            <div className="rounded-3xl p-8" style={{ background: "#fbf6ef", color: C.ink }} aria-live="polite">
              <p className="text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: C.accent }}>Request received</p>
              <p className={`${serif} mt-3 text-3xl font-semibold`}>See you soon, {done.name.split(" ")[0]}!</p>
              <p className="mt-3" style={{ color: C.soft }}>
                Table for {done.guests} on {new Date(done.date + "T00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })} at {done.time}. Reference <strong>{done.ref}</strong>. In a live site you&apos;d get an SMS or WhatsApp confirmation.
              </p>
              <button onClick={() => setDone(null)} className="mt-6 rounded-full px-5 py-2.5 font-semibold text-white" style={{ background: C.accent }}>Make another booking</button>
            </div>
          ) : (
            <form onSubmit={book} className="grid gap-4 rounded-3xl p-6 sm:grid-cols-2 sm:p-8" style={{ background: "#fbf6ef", color: C.ink }} noValidate>
              <label className="sm:col-span-2 text-sm font-medium">Name<input name="name" autoComplete="name" className={field} style={fieldStyle} /></label>
              <label className="text-sm font-medium">Mobile<input name="phone" inputMode="tel" autoComplete="tel" placeholder="98765 43210" className={field} style={fieldStyle} /></label>
              <label className="text-sm font-medium">Guests
                <select name="guests" defaultValue="2" className={field} style={fieldStyle}>
                  {[1, 2, 3, 4, 5, 6, 8].map((n) => <option key={n}>{n}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium">Date<input name="date" type="date" min={minDate} className={field} style={fieldStyle} /></label>
              <label className="text-sm font-medium">Time
                <select name="time" defaultValue="" className={field} style={fieldStyle}>
                  <option value="" disabled>Choose</option>
                  {["8:00 am", "9:30 am", "11:00 am", "1:00 pm", "4:30 pm", "6:00 pm", "7:30 pm"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              {err && <p className="sm:col-span-2 text-sm font-medium text-[#b91c1c]" role="alert">{err}</p>}
              <button className="sm:col-span-2 rounded-full py-3.5 font-semibold text-white" style={{ background: C.accent }}>Request booking</button>
            </form>
          )}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-5 py-10 text-sm sm:px-8" style={{ color: C.soft }}>
        <p className={`${serif} italic`}>Kettle &amp; Crumb</p>
        <p>© {now?.getFullYear() ?? ""} · A fictional café</p>
      </footer>
    </div>
  );
}
