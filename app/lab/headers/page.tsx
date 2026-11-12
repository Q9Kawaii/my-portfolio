import type { Metadata } from "next";
import ExhibitFrame from "@/components/lab/ExhibitFrame";
import HeadersChecker from "@/components/lab/HeadersChecker";
import { labExhibit } from "@/lib/lab/exhibits";

const ex = labExhibit("headers");

export const metadata: Metadata = {
  title: `${ex.title} · Security Lab`,
  description: ex.summary,
  alternates: { canonical: `/lab/${ex.slug}` },
};

export default function HeadersPage() {
  return (
    <ExhibitFrame
      ex={ex}
      notes={
        <>
          <p>
            Security headers are instructions a server sends with every page. They cost nothing to add and close whole
            classes of attack: <strong>HSTS</strong> forces HTTPS, <strong>CSP</strong> limits which scripts may run, and{" "}
            <strong>X-Frame-Options</strong> stops clickjacking.
          </p>
          <p>
            Letting a server fetch any URL a visitor types is itself risky (server-side request forgery). This checker
            resolves the domain first and refuses private, loopback, link-local and cloud-metadata addresses. It re-checks
            every redirect, allows only ports 80 and 443, gives up after 8 seconds, never reads the page body, and limits
            each visitor to 10 checks per 10 minutes.
          </p>
        </>
      }
    >
      <HeadersChecker />
    </ExhibitFrame>
  );
}
