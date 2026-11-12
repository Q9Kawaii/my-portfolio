import type { Metadata } from "next";
import { SERVICES_CONTACT as C } from "@/lib/services";
import { P, PolicyPage } from "../PolicyPage";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/services/privacy" } };

export default function PrivacyPage() {
  return (
    <PolicyPage title="Privacy Policy">
      <p>
        This policy explains how {C.name} (&quot;I&quot;, &quot;me&quot;) collects and uses your information when you contact me or
        pay for my services. Last updated: {C.updated}.
      </p>
      <P h="1. Information I collect">
        Your name, email address, phone number and project details that you share with me. Payment details (UPI ID, card or
        bank details) are handled by Razorpay and your bank; I do not store them.
      </P>
      <P h="2. How I use it">
        Only to reply to enquiries, prepare quotes, deliver the agreed work, confirm payments, process refunds and meet legal
        or tax obligations.
      </P>
      <P h="3. Sharing">
        I do not sell or rent your information. It is shared only with the payment provider needed to complete a
        transaction, or when required by law.
      </P>
      <P h="4. Cookies">
        This website does not use advertising cookies. The hosting provider may keep basic technical logs (such as IP
        address) for security.
      </P>
      <P h="5. Retention and security">
        I keep your information only as long as needed for these purposes or as required by law, and take reasonable steps
        to protect it.
      </P>
      <P h="6. Your rights">
        You can ask me to access, correct or delete your information by emailing{" "}
        <a href={`mailto:${C.email}`}>{C.email}</a>. This policy is governed by the laws of India.
      </P>
    </PolicyPage>
  );
}
