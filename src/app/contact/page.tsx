import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
import { Contour, Eyebrow } from "@/components/primitives";
import { site } from "@/lib/site";
import { withSeo } from "@/lib/seo";

export const metadata: Metadata = withSeo("/contact", {
  title: "Contact",
  description: "Reach the team in Moshi by email, phone or WhatsApp.",
});

const label = "label mb-2 block text-scree";

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-16 px-6 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
      <div>
        <Contour className="mb-5" />
        <Eyebrow>Contact</Eyebrow>
        <h1 className="font-display text-5xl">Talk to Moshi.</h1>
        <p className="mt-4 font-display text-2xl text-tanzanite">
          Ready to live the dream and experience the magic of adventure?
        </p>
        <p className="mt-5 max-w-md text-base leading-relaxed text-scree">
          The office replies within one working day. Tanzania is on EAT — three
          hours ahead of London, eight ahead of New York. If you need an answer
          faster than that, use WhatsApp.
        </p>

        <dl className="mt-12 space-y-7">
          <div>
            <dt className={label}>Sales and bookings</dt>
            <dd className="text-lg">
              <a href={`mailto:${site.contact.email}`} className="hover:text-tanzanite">
                {site.contact.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className={label}>Phone and WhatsApp</dt>
            <dd className="metric text-lg">
              <a href={`tel:${site.contact.phone}`} className="hover:text-tanzanite">
                {site.contact.phone}
              </a>
            </dd>
          </div>
          <div>
            <dt className={label}>Office</dt>
            <dd className="text-lg">{site.contact.address}</dd>
          </div>
          <div>
            <dt className={label}>We guide in</dt>
            <dd className="text-lg">{site.languages.join(", ")}</dd>
          </div>
        </dl>
      </div>

      <div className="h-fit rounded-[10px] border border-mist bg-frost p-8 shadow-[0_10px_25px_0_rgba(74,85,104,0.10)]">
        <EnquiryForm kind="contact" submitLabel="Send message" />
        <p className="mt-5 text-xs leading-relaxed text-scree">
          In a hurry? Use the{" "}
          <a href="/plan" className="text-tanzanite hover:underline">trip planner</a>{" "}
          instead — it prices a climb or safari without waiting for us. Or message
          the office on{" "}
          <a href={site.whatsappUrl} rel="noopener noreferrer" className="text-tanzanite hover:underline">
            WhatsApp
          </a>.
        </p>
      </div>
    </div>
  );
}
