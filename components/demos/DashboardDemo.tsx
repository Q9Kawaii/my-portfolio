"use client";
import { AlertTriangle, Boxes, Download, FileText, IndianRupee, LayoutGrid, Minus, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useHydrated, useLocalStore } from "@/lib/useClientStore";

const C = { bg: "#f6f7f9", card: "#ffffff", ink: "#111827", soft: "#6b7280", line: "#e5e7eb", accent: "#4f46e5", warn: "#b45309", bad: "#b91c1c", good: "#047857" };

type Product = { sku: string; name: string; cat: string; stock: number; reorder: number; price: number };
const SEED: Product[] = [
  { sku: "RC-005", name: "Basmati Rice 5 kg", cat: "Grocery", stock: 42, reorder: 20, price: 640 },
  { sku: "AT-010", name: "Chakki Atta 10 kg", cat: "Grocery", stock: 18, reorder: 20, price: 520 },
  { sku: "TD-001", name: "Toor Dal 1 kg", cat: "Grocery", stock: 65, reorder: 30, price: 165 },
  { sku: "SO-005", name: "Sunflower Oil 5 L", cat: "Grocery", stock: 9, reorder: 15, price: 790 },
  { sku: "SG-001", name: "Sugar 1 kg", cat: "Grocery", stock: 120, reorder: 40, price: 48 },
  { sku: "TE-500", name: "Assam Tea 500 g", cat: "Beverages", stock: 31, reorder: 15, price: 275 },
  { sku: "CF-200", name: "Filter Coffee 200 g", cat: "Beverages", stock: 6, reorder: 12, price: 180 },
  { sku: "DT-1KG", name: "Detergent Powder 1 kg", cat: "Household", stock: 54, reorder: 25, price: 120 },
  { sku: "DW-500", name: "Dishwash Gel 500 ml", cat: "Household", stock: 23, reorder: 20, price: 99 },
  { sku: "SP-4PK", name: "Bath Soap (4-pack)", cat: "Personal care", stock: 14, reorder: 18, price: 160 },
  { sku: "TP-150", name: "Toothpaste 150 g", cat: "Personal care", stock: 47, reorder: 20, price: 95 },
  { sku: "SH-340", name: "Shampoo 340 ml", cat: "Personal care", stock: 28, reorder: 12, price: 310 },
];
const INVOICES = [
  { no: "INV-1042", customer: "Lakshmi Stores", days: 1, amount: 18450, status: "Due" },
  { no: "INV-1041", customer: "Hotel Saravana", days: 2, amount: 42300, status: "Paid" },
  { no: "INV-1040", customer: "Green Mart", days: 4, amount: 9870, status: "Paid" },
  { no: "INV-1039", customer: "Anand Provisions", days: 9, amount: 26100, status: "Overdue" },
  { no: "INV-1038", customer: "Sri Murugan Traders", days: 11, amount: 15400, status: "Paid" },
  { no: "INV-1037", customer: "Hotel Saravana", days: 16, amount: 38900, status: "Overdue" },
] as const;
// Daily sales for the last 14 days (oldest first), in rupees.
const SALES = [21400, 18600, 24800, 26100, 19900, 31200, 35800, 22300, 20700, 27400, 29800, 24100, 33900, 38200];
const KEY = "demo-dashboard-products";
const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function DashboardDemo({ font }: { font: string }) {
  const [stored, persist] = useLocalStore<Product[]>(KEY, SEED);
  const products = Array.isArray(stored) && stored.length ? stored : SEED;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [lowOnly, setLowOnly] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const today = useHydrated() ? new Date() : null;

  const cats = ["All", ...Array.from(new Set(SEED.map((p) => p.cat)))];
  const low = products.filter((p) => p.stock < p.reorder);
  const shown = useMemo(
    () =>
      products.filter(
        (p) =>
          (cat === "All" || p.cat === cat) &&
          (!lowOnly || p.stock < p.reorder) &&
          (p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())),
      ),
    [products, q, cat, lowOnly],
  );
  const total = SALES.reduce((a, b) => a + b, 0);
  const due = INVOICES.filter((i) => i.status !== "Paid").reduce((a, b) => a + b.amount, 0);
  const max = Math.max(...SALES);

  const adjust = (sku: string, by: number) => persist(products.map((p) => (p.sku === sku ? { ...p, stock: Math.max(0, p.stock + by) } : p)));

  function exportCsv() {
    const rows = [["SKU", "Product", "Category", "Stock", "Reorder level", "Price (INR)"], ...shown.map((p) => [p.sku, p.name, p.cat, p.stock, p.reorder, p.price])];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "sharma-traders-inventory.csv" });
    a.click();
    URL.revokeObjectURL(url);
  }

  const day = (offset: number) => {
    if (!today) return "";
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };
  const box = "rounded-xl border bg-white";

  return (
    <div className={`${font} min-h-screen text-[0.92rem]`} style={{ background: C.bg, color: C.ink }}>
      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar */}
        <aside className="sticky top-8 hidden h-[calc(100vh-2rem)] w-56 shrink-0 flex-col gap-1 border-r px-4 py-6 lg:flex" style={{ borderColor: C.line, background: C.card }}>
          <p className="mb-6 flex items-center gap-2 px-2 text-base font-bold">
            <span className="grid size-8 place-items-center rounded-lg text-white" style={{ background: C.accent }}>ST</span> Sharma Traders
          </p>
          {[["Overview", LayoutGrid, "#overview"], ["Inventory", Boxes, "#inventory"], ["Invoices", FileText, "#invoices"]].map(([l, Icon, h]) => {
            const I = Icon as typeof LayoutGrid;
            return (
              <a key={l as string} href={h as string} className="flex items-center gap-2.5 rounded-lg px-3 py-2 font-medium hover:bg-[#eef2ff]" style={{ color: C.soft }}>
                <I size={17} /> {l as string}
              </a>
            );
          })}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-8 sm:px-8">
          <div id="overview" className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm" style={{ color: C.soft }}>Wholesale grocery · Tambaram</p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Good {!today || today.getHours() < 12 ? "morning" : today.getHours() < 17 ? "afternoon" : "evening"}, Mr. Sharma</h1>
            </div>
            <p className="text-sm" style={{ color: C.soft }}>Last 14 days</p>
          </div>

          {/* KPIs */}
          <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
            {[
              { k: "Sales", v: inr(total), sub: "+12% vs previous 14 days", Icon: IndianRupee, color: C.good },
              { k: "Unpaid invoices", v: inr(due), sub: `${INVOICES.filter((i) => i.status === "Overdue").length} overdue`, Icon: FileText, color: C.bad },
              { k: "Low stock", v: String(low.length), sub: "below reorder level", Icon: AlertTriangle, color: C.warn },
              { k: "Products", v: String(products.length), sub: `${products.reduce((a, p) => a + p.stock, 0)} units in stock`, Icon: Boxes, color: C.accent },
            ].map(({ k, v, sub, Icon, color }) => (
              <div key={k} className={`${box} p-4 sm:p-5`} style={{ borderColor: C.line }}>
                <p className="flex items-center justify-between text-sm font-medium" style={{ color: C.soft }}>{k} <Icon size={17} style={{ color }} /></p>
                <p className="mt-2 text-xl font-bold sm:text-2xl">{v}</p>
                <p className="mt-1 text-xs" style={{ color }}>{sub}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            {/* Chart */}
            <section className={`${box} p-5`} style={{ borderColor: C.line }} aria-label="Daily sales chart">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">Daily sales</h2>
                <p className="text-sm font-semibold" style={{ color: C.accent }}>{hover !== null ? `${day(SALES.length - 1 - hover)}: ${inr(SALES[hover])}` : `Avg ${inr(Math.round(total / SALES.length))}/day`}</p>
              </div>
              <div className="mt-5 flex h-48 items-end gap-1.5 sm:gap-2" onMouseLeave={() => setHover(null)}>
                {SALES.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`${day(SALES.length - 1 - i) || `Day ${i + 1}`}: ${inr(s)}`}
                    onMouseEnter={() => setHover(i)}
                    onFocus={() => setHover(i)}
                    className="flex-1 rounded-t-md transition-colors"
                    style={{ height: `${(s / max) * 100}%`, background: hover === i ? C.accent : "#c7d2fe" }}
                  />
                ))}
              </div>
              <div className="mt-2 flex justify-between text-xs" style={{ color: C.soft }}>
                <span>{day(13)}</span>
                <span>{day(0)}</span>
              </div>
            </section>

            {/* Low stock */}
            <section className={`${box} p-5`} style={{ borderColor: C.line }}>
              <h2 className="flex items-center gap-2 font-bold"><AlertTriangle size={17} style={{ color: C.warn }} /> Reorder soon</h2>
              <ul className="mt-4 space-y-3">
                {low.map((p) => (
                  <li key={p.sku}>
                    <div className="flex justify-between text-sm"><span className="font-medium">{p.name}</span><span style={{ color: C.warn }}>{p.stock} / {p.reorder}</span></div>
                    <div className="mt-1.5 h-1.5 rounded-full" style={{ background: C.line }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.min(100, (p.stock / p.reorder) * 100)}%`, background: p.stock < p.reorder / 2 ? C.bad : C.warn }} />
                    </div>
                  </li>
                ))}
                {!low.length && <li className="text-sm" style={{ color: C.good }}>Everything is above its reorder level.</li>}
              </ul>
            </section>
          </div>

          {/* Inventory */}
          <section id="inventory" className={`${box} mt-6`} style={{ borderColor: C.line }}>
            <div className="flex flex-wrap items-center gap-3 border-b p-4" style={{ borderColor: C.line }}>
              <h2 className="mr-auto font-bold">Inventory</h2>
              <label className="flex items-center gap-2 rounded-lg border px-3" style={{ borderColor: C.line }}>
                <Search size={16} style={{ color: C.soft }} />
                <span className="sr-only">Search products</span>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU" className="w-40 py-2 outline-none sm:w-52" />
              </label>
              <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-lg border px-3 py-2" style={{ borderColor: C.line }} aria-label="Category">
                {cats.map((c) => <option key={c}>{c}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={lowOnly} onChange={(e) => setLowOnly(e.target.checked)} className="accent-[#4f46e5]" /> Low stock only</label>
              <button onClick={exportCsv} className="flex items-center gap-2 rounded-lg px-3.5 py-2 font-semibold text-white" style={{ background: C.accent }}><Download size={16} /> CSV</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left">
                <thead className="text-xs uppercase tracking-wide" style={{ color: C.soft }}>
                  <tr>{["SKU", "Product", "Category", "Price", "Stock", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {shown.map((p) => {
                    const isLow = p.stock < p.reorder;
                    return (
                      <tr key={p.sku} className="border-t" style={{ borderColor: C.line }}>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: C.soft }}>{p.sku}</td>
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3" style={{ color: C.soft }}>{p.cat}</td>
                        <td className="px-4 py-3">{inr(p.price)}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-md px-2 py-0.5 text-sm font-semibold" style={isLow ? { background: "#fef3c7", color: C.warn } : { background: "#ecfdf5", color: C.good }}>{p.stock}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex justify-end gap-1">
                            <button onClick={() => adjust(p.sku, -1)} aria-label={`Remove one ${p.name}`} className="rounded-md border p-1.5 hover:bg-gray-50" style={{ borderColor: C.line }}><Minus size={14} /></button>
                            <button onClick={() => adjust(p.sku, 10)} aria-label={`Add ten ${p.name}`} className="rounded-md border px-2 py-1.5 text-xs font-semibold hover:bg-gray-50" style={{ borderColor: C.line }}><Plus size={12} className="inline" />10</button>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {!shown.length && <tr><td colSpan={6} className="px-4 py-10 text-center" style={{ color: C.soft }}>No products match.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          {/* Invoices */}
          <section id="invoices" className={`${box} mt-6 overflow-x-auto`} style={{ borderColor: C.line }}>
            <h2 className="border-b p-4 font-bold" style={{ borderColor: C.line }}>Recent invoices</h2>
            <table className="w-full min-w-[34rem] text-left">
              <tbody>
                {INVOICES.map((i) => (
                  <tr key={i.no} className="border-t first:border-0" style={{ borderColor: C.line }}>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: C.soft }}>{i.no}</td>
                    <td className="px-4 py-3 font-medium">{i.customer}</td>
                    <td className="px-4 py-3" style={{ color: C.soft }}>{day(i.days)}</td>
                    <td className="px-4 py-3 font-semibold">{inr(i.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={i.status === "Paid" ? { background: "#ecfdf5", color: C.good } : i.status === "Due" ? { background: "#eef2ff", color: C.accent } : { background: "#fef2f2", color: C.bad }}>{i.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
          <p className="mt-6 text-xs" style={{ color: C.soft }}>Stock changes are saved in this browser only. Sample data for a fictional business.</p>
        </main>
      </div>
    </div>
  );
}
