import type { Metadata } from "next";
import { SERVICES_CONTACT as C } from "@/lib/services";
import { P, PolicyPage } from "../PolicyPage";

export const metadata: Metadata = {
  title: "Shipping and Delivery Policy",
  alternates: { canonical: "/services/delivery" },
};

export default function DeliveryPage() {
  return (
    <PolicyPage title="Shipping and Delivery Policy">
      <P h="Digital services only">I provide digital services only. No physical goods are shipped.</P>
      <P h="Delivery">
        Work is delivered digitally (by email, shared files, a repository or a live link) within the timeline in your
        written quote. Timelines are estimates unless a fixed date is agreed in writing.
      </P>
      <P h="Delays">
        If you have not received your delivery by the agreed date, email <a href={`mailto:${C.email}`}>{C.email}</a>.
      </P>
    </PolicyPage>
  );
}
