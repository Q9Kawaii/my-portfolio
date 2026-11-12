import type { Metadata } from "next";
import SubPageShell from "@/components/site/SubPageShell";
import TestimonialForm from "@/components/site/TestimonialForm";
import { WRAP } from "@/components/site/ui";

// Shared directly with clients after a project; not meant to be found through search.
export const metadata: Metadata = {
  title: "Leave a testimonial",
  robots: { index: false, follow: false },
};

export default function TestimonialPage() {
  return (
    <SubPageShell section="Testimonial">
      <section className={`${WRAP} py-14 md:py-20`}>
        <div className="flex items-center gap-4">
          <p className="label shrink-0">Case notes</p>
          <span aria-hidden className="h-px flex-1 bg-line" />
        </div>
        <h1 className="h2 mt-7 text-[2.6rem] text-text sm:text-6xl">Worked with me? Leave a note</h1>
        <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-muted">
          A few honest sentences about the project help the next person decide. I read every submission before it goes on
          the site, and I only publish it with your permission.
        </p>
        <div className="mt-10 max-w-3xl">
          <TestimonialForm />
        </div>
      </section>
    </SubPageShell>
  );
}
