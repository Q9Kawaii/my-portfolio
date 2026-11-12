import type { Metadata } from "next";
import ExhibitFrame from "@/components/lab/ExhibitFrame";
import JwtInspector from "@/components/lab/JwtInspector";
import { labExhibit } from "@/lib/lab/exhibits";

const ex = labExhibit("jwt");

export const metadata: Metadata = {
  title: `${ex.title} · Security Lab`,
  description: ex.summary,
  alternates: { canonical: `/lab/${ex.slug}` },
};

export default function JwtPage() {
  return (
    <ExhibitFrame
      ex={ex}
      notes={
        <>
          <p>
            A <strong>JSON Web Token</strong> is how many apps remember you after login. It carries claims (who you are, your
            role, when it expires) plus a signature that proves the server issued it. The claims are only base64-encoded, so
            anyone can read them, which is why this tool can decode a token without any key.
          </p>
          <p>
            Most JWT bugs are in how servers <em>check</em> tokens: accepting <code>alg: none</code>, not verifying the
            signature, ignoring <code>exp</code>, or not pinning <code>iss</code> and <code>aud</code>. The fix is to verify
            with a well-maintained library, pin the expected algorithm, keep access tokens short-lived and keep secrets out of
            the payload.
          </p>
        </>
      }
    >
      <JwtInspector />
    </ExhibitFrame>
  );
}
