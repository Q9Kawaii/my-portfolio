import type { Metadata } from "next";
import { SERVICES_CONTACT as C } from "@/lib/services";
import { P, PolicyPage } from "../PolicyPage";

export const metadata: Metadata = { title: "Terms and Conditions", alternates: { canonical: "/services/terms" } };

export default function TermsPage() {
  return (
    <PolicyPage title="Terms and Conditions">
      <p>
        These Terms are between {C.name} (&quot;I&quot;, &quot;me&quot;) and you (&quot;Client&quot;). By paying for or using my
        freelance services you agree to them. I may update these Terms; the version on this page applies. Last updated:{" "}
        {C.updated}.
      </p>
      <P h="1. Services">
        I offer software and web development services. Payments made through this website are only for services agreed with
        me directly, based on a written quote or agreement that sets out the scope, price and timeline.
      </P>
      <P h="2. Payments">
        Payments are processed by Razorpay through UPI, cards, netbanking or wallets. I do not see or store your card or bank
        details. Please pay only after we have agreed on the scope in writing, and only from funds you are legally allowed to
        use.
      </P>
      <P h="3. Your responsibilities">
        You agree to give accurate details needed for the project and the payment, to provide content and feedback on time,
        and not to misuse this website or attempt fraud.
      </P>
      <P h="4. Ownership">
        Once the full agreed amount is paid, you own the delivered work, except third-party libraries and tools, which stay
        under their own licences. I may show the project in my portfolio unless you ask me not to.
      </P>
      <P h="5. Limitation of liability">
        I am not liable for payment failures or delays caused by banks, payment providers or networks. If a delivery does not
        match what was agreed, your remedy is the process in the Refund Policy.
      </P>
      <P h="6. Governing law">These Terms are governed by the laws of India, and courts in India have jurisdiction.</P>
      <P h="7. Contact">
        For questions or complaints (including double debits or unauthorised transactions), email{" "}
        <a href={`mailto:${C.email}`}>{C.email}</a>.
      </P>
    </PolicyPage>
  );
}
