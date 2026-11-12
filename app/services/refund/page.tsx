import type { Metadata } from "next";
import { SERVICES_CONTACT as C } from "@/lib/services";
import { P, PolicyPage } from "../PolicyPage";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy",
  alternates: { canonical: "/services/refund" },
};

export default function RefundPage() {
  return (
    <PolicyPage title="Refund and Cancellation Policy">
      <P h="Cancellation">
        You can cancel before work on the agreed service has started by emailing{" "}
        <a href={`mailto:${C.email}`}>{C.email}</a> with your payment details, and you will get a full refund. Once work has
        begun, cancellation is at my discretion and any refund may be partial, based on the work already done.
      </P>
      <P h="Refunds">
        You can request a refund if the delivered service does not match what was agreed in writing. Email me within 3 days
        of delivery with the reason and any proof. Payments made in error (for example a duplicate payment or wrong amount)
        are refunded in full.
      </P>
      <P h="Processing">
        Approved refunds go back to the original payment method within 5–7 working days. I may ask for more details before
        approving a request.
      </P>
    </PolicyPage>
  );
}
