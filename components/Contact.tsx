"use client";
import { useState } from "react";
import { Mail, Phone, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("✅ Message sent successfully!");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("❌ Failed to send. Please try again.");
      }
    } catch (err) {
      setStatus("⚠️ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="w-full bg-[--color-section-dark] text-white py-16 px-6 md:px-20"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-12">
        {/* LEFT SIDE — CONTACT INFO */}
        <div className="w-full md:w-1/2 space-y-8">
          <h2 className="text-4xl font-bold mb-4 text-[--color-accent]">
            Contact Me
          </h2>

          <p className="text-gray-300 max-w-md">
            Have a question or want to collaborate? Feel free to reach out — I’d
            love to connect!
          </p>

          <div className="space-y-5 text-gray-300">
            {/* Email */}
            <div className="flex items-center gap-4">
              <Mail className="text-[var(--color-hehe)]" size={20} />
              <span className="text-base">yashdingar17@gmail.com</span>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4">
              <Phone className="text-[var(--color-hehe)]" size={20} />
              <span className="text-base">7007651602</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-6 text-xl mt-6">
            <a
              href="https://www.instagram.com/q9kawaii/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[--color-accent] transition"
            >
              <Instagram size={22} />
            </a>
            <a
              href="https://x.com/q9kawaii"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[--color-accent] transition"
            >
              <Twitter size={22} />
            </a>
            <a
              href="https://www.linkedin.com/in/yash-dingar-946688276/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[--color-accent] transition"
            >
              <Linkedin size={22} />
            </a>
          </div>
          {/* Download CV Button */}
            {/* <a
              href="/images/stock/cv.pdf"
              download
              className="inline-block mt-8 bg-[white]/[0.3] text-black font-semibold px-6 py-3 rounded-md hover:bg-[var(--color-hehe)] transition"
            >
              Download CV
            </a> */}

        </div>

        {/* RIGHT SIDE — CONTACT FORM */}
        <div className="w-full md:w-1/2 bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block mb-2 text-sm font-semibold">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-md bg-black/40 border border-white/10 focus:outline-none focus:border-[--color-accent] transition"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-md bg-black/40 border border-white/10 focus:outline-none focus:border-[--color-accent] transition"
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-semibold">Message</label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-md bg-black/40 border border-white/10 focus:outline-none focus:border-[--color-accent] transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[var(--color-hehe)]/[0.2] text-white font-semibold rounded-md hover:bg-[--color-accent-light] transition"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

            {status && (
              <p
                className={`text-center text-sm ${
                  status.startsWith("✅")
                    ? "text-green-400"
                    : status.startsWith("⚠️")
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {status}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
