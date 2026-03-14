import type { Metadata } from "next";
import type { JSX } from "react";

import { LegalDocumentPage } from "@/app/legal-document-page";
import { privacyPolicy } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: "Privacy Policy | CreditBridge",
  description:
    "Placeholder privacy policy for the CreditBridge demo landing page.",
};

export default function PrivacyPage(): JSX.Element {
  return (
    <LegalDocumentPage
      document={privacyPolicy}
      siblingHref="/terms"
      siblingLabel="View Terms"
    />
  );
}
