export type LegalSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocument = {
  label: string;
  title: string;
  description: string;
  lastUpdated: string;
  highlights: string[];
  sections: LegalSection[];
};

export const privacyPolicy: LegalDocument = {
  label: "Privacy Policy",
  title: "How CreditBridge handles personal and credit-profile information.",
  description:
    "This is placeholder legal copy for the demo landing experience. It explains how a cross-border credit platform could collect, use, store, and protect applicant and lender data.",
  lastUpdated: "March 14, 2026",
  highlights: [
    "Collects only the information needed to assess onboarding, identity, and credit portability.",
    "Uses mock bureau integrations and demo workflows only; no live third-party bureau pulls occur in this environment.",
    "Limits internal access to role-based teams and applies retention windows to profile records and support interactions.",
  ],
  sections: [
    {
      title: "1. Scope",
      paragraphs: [
        "CreditBridge is a demo SaaS platform that helps consumers present international credit histories to US lenders and screening partners. This Privacy Policy describes how we handle information when visitors browse the site, submit interest forms, create accounts, or review translated credit insights.",
        "Because this environment is intended for product demonstration, some datasets, eligibility outputs, and report artifacts may be simulated. Even so, we treat user-submitted information as confidential and design flows to mirror a production-grade privacy posture.",
      ],
    },
    {
      title: "2. Information We Collect",
      paragraphs: [
        "We may collect identifying details such as name, email address, country of origin, intended credit product, account credentials, uploaded supporting documents, and communications sent through the platform.",
        "We may also collect technical and behavioral data such as browser type, device identifiers, approximate location derived from IP address, session timestamps, feature interactions, and audit trail events needed to secure the service.",
      ],
      bullets: [
        "Profile data: name, email, country, onboarding responses, and product intent.",
        "Verification data: document metadata, account status, and completion milestones.",
        "Usage data: page views, clicks, API access logs, and fraud-prevention signals.",
      ],
    },
    {
      title: "3. How We Use Information",
      paragraphs: [
        "We use collected information to operate the platform, personalize onboarding, generate translated credit views, respond to support requests, improve product performance, and detect misuse or unauthorized access attempts.",
        "If you join a waitlist, request a demo, or begin onboarding, we may use your contact details to send transactional messages, application status updates, product announcements, or lender-readiness guidance related to the service.",
      ],
    },
    {
      title: "4. Sharing and Disclosure",
      paragraphs: [
        "We may share information with infrastructure providers, analytics vendors, customer support tools, and compliance advisors that help us run CreditBridge. These parties are expected to process data under confidentiality and security obligations.",
        "We may also disclose information when reasonably necessary to comply with law, enforce platform rules, investigate abuse, protect users, or support a financing institution review that you explicitly request through the product.",
      ],
      bullets: [
        "We do not sell personal information to data brokers.",
        "We do not expose full applicant records to lenders unless the workflow calls for a reviewed, permissioned share.",
        "We avoid storing raw API keys in plaintext and minimize access to sensitive operational secrets.",
      ],
    },
    {
      title: "5. International Data Handling",
      paragraphs: [
        "CreditBridge is built for cross-border credit portability, so data may be transferred between regions where users reside, where lenders operate, and where our service providers host systems. We use contractual safeguards and access controls intended to protect those transfers.",
        "Users should understand that privacy rights and enforcement mechanisms can vary by jurisdiction. We aim to apply a consistent baseline standard even when local legal requirements differ.",
      ],
    },
    {
      title: "6. Data Retention",
      paragraphs: [
        "We retain data only for as long as needed to provide the service, fulfill legitimate business or compliance requirements, resolve disputes, and maintain security logs. Retention periods may differ depending on whether the record relates to an account, application workflow, support request, or audit event.",
        "When information is no longer required, we may delete, anonymize, or aggregate it so it can no longer reasonably identify a person.",
      ],
    },
    {
      title: "7. Security Measures",
      paragraphs: [
        "We use administrative, technical, and organizational measures designed to reduce unauthorized access, disclosure, alteration, or loss. These measures may include encryption in transit, role-based access controls, audit logging, secret management, and periodic access review.",
        "No internet service can guarantee absolute security. Users remain responsible for protecting their credentials and promptly reporting any suspected compromise.",
      ],
    },
    {
      title: "8. Your Choices",
      paragraphs: [
        "You may request access to, correction of, or deletion of certain information associated with your account, subject to legal and operational limits. You may also opt out of non-essential communications using the unsubscribe controls provided in those messages.",
        "Where required, we will ask for consent before using information for materially different purposes than those described in this policy.",
      ],
    },
    {
      title: "9. Contact",
      paragraphs: [
        "Questions about this Privacy Policy can be directed to the CreditBridge privacy team through the support channels referenced in the application. For the demo environment, this text is illustrative and should be replaced with counsel-approved legal language before public launch.",
      ],
    },
  ],
};

export const termsOfService: LegalDocument = {
  label: "Terms of Service",
  title: "Rules for using the CreditBridge product, demo tools, and lender workflows.",
  description:
    "This is placeholder legal copy for the demo landing experience. It outlines usage terms, service limits, acceptable conduct, and disclaimers for a cross-border credit intelligence platform.",
  lastUpdated: "March 14, 2026",
  highlights: [
    "CreditBridge is offered as a demo product environment and may contain simulated scores, reports, and lender outcomes.",
    "Users must provide accurate information and may not misuse the service to scrape data, test fraud patterns, or impersonate others.",
    "Service availability, translated score outputs, and eligibility indicators are provided on an as-is basis pending production launch.",
  ],
  sections: [
    {
      title: "1. Acceptance of Terms",
      paragraphs: [
        "By accessing or using CreditBridge, you agree to these Terms of Service and any policies incorporated by reference. If you do not agree, you should not use the site, onboarding flow, dashboards, or related APIs.",
        "These terms apply to both consumer users and lender users, although certain product capabilities may differ by account type, environment, or approval status.",
      ],
    },
    {
      title: "2. Service Description",
      paragraphs: [
        "CreditBridge helps translate foreign credit history into lender-readable signals for the US market. The platform may include onboarding experiences, dashboards, document handling, reporting views, API endpoints, and lender-facing search tools.",
        "In this demo build, some reports, alerts, recommendations, and eligibility outcomes are illustrative only. They are not guaranteed underwriting decisions and should not be relied upon as financial, legal, or regulatory advice.",
      ],
    },
    {
      title: "3. Account Responsibilities",
      paragraphs: [
        "You are responsible for maintaining the confidentiality of your credentials, restricting access to your account, and ensuring that information you submit is accurate, current, and lawfully provided.",
        "If you are using CreditBridge on behalf of an organization, you represent that you are authorized to bind that organization to these terms and to act within the permissions granted to your role.",
      ],
    },
    {
      title: "4. Acceptable Use",
      paragraphs: [
        "You may not use the service to violate law, infringe privacy rights, reverse engineer protected features, overload infrastructure, distribute malware, or attempt to gain unauthorized access to any account, dataset, or secret.",
        "You may not use consumer information surfaced through the platform for discriminatory, unlawful, or unapproved lending practices.",
      ],
      bullets: [
        "No scraping or bulk extraction of user or lender data.",
        "No false identity submissions or fraudulent document uploads.",
        "No probing for security weaknesses except through approved disclosure channels.",
      ],
    },
    {
      title: "5. Demo Data and Product Limits",
      paragraphs: [
        "CreditBridge may present sample records, mock API responses, synthetic bureau mappings, or estimated risk categories to demonstrate product behavior. Those outputs may not reflect actual creditworthiness or real bureau positions.",
        "We may modify, suspend, or remove features at any time, including during testing, maintenance, or launch preparation.",
      ],
    },
    {
      title: "6. Intellectual Property",
      paragraphs: [
        "The CreditBridge name, product design, translated scoring logic, visual assets, software, and documentation remain the property of CreditBridge or its licensors, except where third-party rights apply.",
        "Subject to these terms, we grant you a limited, non-exclusive, non-transferable right to access and use the service for its intended purpose.",
      ],
    },
    {
      title: "7. Fees and Access",
      paragraphs: [
        "If paid plans, API quotas, or enterprise contracts are introduced later, additional commercial terms may apply. Until then, any demo or pilot access is provided under the specific invitation, onboarding, or testing arrangement communicated to you.",
      ],
    },
    {
      title: "8. Termination",
      paragraphs: [
        "We may suspend or terminate access if we believe a user has breached these terms, created security or legal risk, or misused the platform. Users may stop using the service at any time.",
        "Provisions relating to ownership, disclaimers, limitations of liability, and dispute handling will survive termination to the extent legally permitted.",
      ],
    },
    {
      title: "9. Disclaimers and Liability",
      paragraphs: [
        "The service is provided on an as-is and as-available basis without warranties of uninterrupted operation, merchantability, fitness for a particular purpose, or non-infringement, except where such disclaimers are not permitted by law.",
        "To the maximum extent permitted by law, CreditBridge will not be liable for indirect, incidental, consequential, special, exemplary, or punitive damages arising from or related to your use of the service.",
      ],
    },
    {
      title: "10. Changes to These Terms",
      paragraphs: [
        "We may update these terms from time to time. Material changes may be communicated through the site, product notices, or direct contact where appropriate. Continued use after an update takes effect means you accept the revised terms.",
        "Because this text is a placeholder for demonstration purposes, it should be reviewed and replaced with final legal language before public release.",
      ],
    },
  ],
};
