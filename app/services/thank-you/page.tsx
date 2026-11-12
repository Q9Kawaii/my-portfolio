import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { WRAP } from "@/components/site/ui";
import { SERVICES_CONTACT as C } from "@/lib/services";

export const metadata: Metadata = { title: "Payment received", robots: { index: false, follow: false } };

export default function ThankYouPage() {
  return (
    <section className={`${WRAP} py-24 md:py-32`}>
      <div className="card mx-auto max-w-xl p-8 text-center">
        <CheckCircle2 className="mx-auto text-accent" size={40} aria-hidden />
        <h1 className="mt-4 text-2xl font-semibold text-text">Payment received. Thank you!</h1>
        <p className="mt-3 leading-relaxed text-muted">
          Razorpay has emailed you a receipt. I&apos;ll confirm by email and get started as agreed. Questions? Write to{" "}
          <a href={`mailto:${C.email}`} className="text-accent underline underline-offset-4">
            {C.email}
          </a>
          .
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn btn-primary">
            Back to portfolio
          </Link>
          <Link href="/services" className="btn btn-ghost">
            Services
          </Link>
        </div>
      </div>
    </section>
  );
}
