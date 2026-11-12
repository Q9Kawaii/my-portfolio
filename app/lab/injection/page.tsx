import type { Metadata } from "next";
import ExhibitFrame from "@/components/lab/ExhibitFrame";
import InjectionLab from "@/components/lab/InjectionLab";
import { labExhibit } from "@/lib/lab/exhibits";

const ex = labExhibit("injection");

export const metadata: Metadata = {
  title: `${ex.title} · Security Lab`,
  description: ex.summary,
  alternates: { canonical: `/lab/${ex.slug}` },
};

export default function InjectionPage() {
  return (
    <ExhibitFrame
      ex={ex}
      notes={
        <>
          <p>
            Both bugs have the same root cause: <strong>user input is mixed into code</strong>. With SQL injection, a quote in the
            username ends the string early, so <code>{"' OR '1'='1' --"}</code> turns the login check into &quot;match every user&quot;,
            and <code>--</code> comments out the password test. With XSS, a comment containing HTML tags becomes part of the page,
            and its scripts run as if the site wrote them.
          </p>
          <p>
            The fixes keep input as data. <strong>Parameterised queries</strong> send the SQL and the values separately, so the
            database never parses input as SQL. <strong>Output escaping</strong> turns <code>&lt;</code> into{" "}
            <code>&amp;lt;</code>, so the browser shows tags as text. A Content-Security-Policy adds a second layer in case
            something slips through. In a real app, passwords would also be stored as slow salted hashes (bcrypt or Argon2),
            never as plain text like this demo table.
          </p>
        </>
      }
    >
      <InjectionLab />
    </ExhibitFrame>
  );
}
