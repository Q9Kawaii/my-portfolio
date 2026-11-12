import type { Metadata } from "next";
import ExhibitFrame from "@/components/lab/ExhibitFrame";
import PasswordCheck from "@/components/lab/PasswordCheck";
import { labExhibit } from "@/lib/lab/exhibits";

const ex = labExhibit("password");

export const metadata: Metadata = {
  title: `${ex.title} · Security Lab`,
  description: ex.summary,
  alternates: { canonical: `/lab/${ex.slug}` },
};

export default function PasswordPage() {
  return (
    <ExhibitFrame
      ex={ex}
      notes={
        <>
          <p>
            <strong>How the breach check stays private:</strong> your browser hashes the password with SHA-1 and sends only the
            first 5 characters of the hash. The service replies with every leaked hash that starts the same way (hundreds of
            them), and the match is found here. The service never learns your password or even its full hash. This is called{" "}
            <strong>k-anonymity</strong>.
          </p>
          <p>
            <strong>On the strength meter:</strong> it estimates guessing effort from length and character variety, then
            subtracts for the patterns cracking tools try first: common words, keyboard runs, years and the Word123! shape.
            For real accounts, use a password manager and a passphrase of four or more random words.
          </p>
        </>
      }
    >
      <PasswordCheck />
    </ExhibitFrame>
  );
}
