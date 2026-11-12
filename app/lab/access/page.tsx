import type { Metadata } from "next";
import AccessPlayground from "@/components/lab/AccessPlayground";
import ExhibitFrame from "@/components/lab/ExhibitFrame";
import { labExhibit } from "@/lib/lab/exhibits";

const ex = labExhibit("access");

export const metadata: Metadata = {
  title: `${ex.title} · Security Lab`,
  description: ex.summary,
  alternates: { canonical: `/lab/${ex.slug}` },
};

export default function AccessPage() {
  return (
    <ExhibitFrame
      ex={ex}
      notes={
        <>
          <p>
            <strong>Role-based access control</strong> decides what each user may do from who they are and how they relate to
            the data. Checking only the role isn&apos;t enough: a faculty member should see <em>their</em> advisees, not every
            student. That relationship check is where many real apps leak data.
          </p>
          <p>
            Two details matter most. Rules must run on the <strong>server</strong> (here, Firestore security rules), because
            anything enforced only in the UI can be bypassed with a direct API call. And updates must be checked{" "}
            <strong>field by field</strong>, so a user who may edit their own name can&apos;t also set <code>role: &apos;admin&apos;</code>{" "}
            in the same request. Try that one as Aarav.
          </p>
        </>
      }
    >
      <AccessPlayground />
    </ExhibitFrame>
  );
}
