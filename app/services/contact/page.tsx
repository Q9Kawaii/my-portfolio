import type { Metadata } from "next";
import { SERVICES_CONTACT as C } from "@/lib/services";
import { PolicyPage } from "../PolicyPage";

export const metadata: Metadata = { title: "Contact", alternates: { canonical: "/services/contact" } };

export default function ServicesContactPage() {
  return (
    <PolicyPage title="Contact">
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3">
        <dt className="text-sm text-text">Name</dt>
        <dd>{C.name}</dd>
        <dt className="text-sm text-text">Email</dt>
        <dd>
          <a href={`mailto:${C.email}`}>{C.email}</a>
        </dd>
        <dt className="text-sm text-text">Location</dt>
        <dd>{C.location}</dd>
      </dl>
      <p>For payment issues, include the Razorpay payment ID from your receipt email.</p>
    </PolicyPage>
  );
}
