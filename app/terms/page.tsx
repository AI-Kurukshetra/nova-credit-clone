import type { Metadata } from "next";
import type { JSX } from "react";

import { LegalDocumentPage } from "@/app/legal-document-page";
import { termsOfService } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Terms of Service | CreditBridge",
  description:
    "Placeholder terms of service for the CreditBridge demo landing page.",
};

export default function TermsPage(): JSX.Element {
  return (
    <LegalDocumentPage
      document={termsOfService}
      siblingHref="/privacy"
      siblingLabel="View Privacy Policy"
    />
  );
}
