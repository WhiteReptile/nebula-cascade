export const LEGAL_CONTACT_EMAIL = "enrique.catalan.hoeflich@gmail.com";
export const LEGAL_EFFECTIVE_DATE = "September 26, 2026";
export const LEGAL_ENTITY_NOTE =
  "YourTruths is operated as a Mexican-owned AI evaluation platform offering services to users internationally, including in the United States.";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDoc = {
  title: string;
  slug: string;
  intro: string;
  sections: LegalSection[];
};

export const FOOTER_LINKS = [
  { href: "/terms", label: "Terms of Service" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refunds", label: "Refund & Cancellation Policy" },
  { href: "/ai-disclaimer", label: "AI Disclaimer" },
  { href: "/content-policy", label: "User Content & Copyright Policy" },
  { href: "/contact", label: "Contact" },
] as const;

export const TERMS_OF_SERVICE: LegalDoc = {
  title: "Terms of Service",
  slug: "terms",
  intro:
    "These Terms of Service (“Terms”) govern your access to and use of YourTruths, including our website, applications, and related services (collectively, the “Service”). By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.",
  sections: [
    {
      heading: "1. About YourTruths",
      paragraphs: [
        LEGAL_ENTITY_NOTE,
        "YourTruths provides AI-assisted evaluations and, for certain categories such as music and video, human-assisted reviews that may be rewritten or structured by AI. The Service produces opinions and analysis. It does not guarantee business, artistic, financial, professional, legal, medical, or other outcomes.",
      ],
    },
    {
      heading: "2. Eligibility",
      paragraphs: [
        "You must be legally able to enter into a binding agreement to use the Service. If you use the Service on behalf of an organization, you represent that you have authority to bind that organization to these Terms.",
        "You are responsible for complying with the laws that apply to you in your jurisdiction when using the Service.",
      ],
    },
    {
      heading: "3. Accounts and authentication",
      paragraphs: [
        "Some features may require an account or sign-in (for example, Google authentication when enabled). You are responsible for maintaining the confidentiality of your login credentials and for activity under your account.",
        "You agree to provide accurate information and to notify us promptly of any unauthorized use of your account.",
      ],
    },
    {
      heading: "4. Free and paid services",
      paragraphs: [
        "YourTruths may offer free AI evaluations subject to usage limits, as described on the Service (for example, daily free AI opinions for supported categories).",
        "Paid offerings may include human + AI review credits for music and video and other paid packages described on the Pricing page. Features, limits, and pricing may change. Displayed pricing and packaging control what is offered at the time of purchase.",
      ],
    },
    {
      heading: "5. Credits, purchases, and subscriptions",
      paragraphs: [
        "If you purchase credits or other paid packages, those purchases are subject to these Terms and our Refund & Cancellation Policy.",
        "Credits are generally for personal or authorized organizational use of the Service and are not transferable unless we expressly allow it. Unused credits do not create an ownership interest in YourTruths.",
        "Payment processing, when enabled, may be handled by third-party providers (such as Stripe). Their terms may also apply to the payment transaction.",
      ],
    },
    {
      heading: "6. Human + AI reviews",
      paragraphs: [
        "For eligible music and video submissions, a human reviewer may experience your work and provide notes or reactions. YourTruths AI may then rewrite or structure those notes into a formal evaluation.",
        "Human reviewers provide individual perspectives. Their views are not a universal consensus, professional certification, or guarantee of quality, market success, or audience response.",
        "Review timing may vary. Estimated wait times shown in the Service are approximate and not guarantees.",
      ],
    },
    {
      heading: "7. User responsibilities",
      paragraphs: [
        "You are responsible for the content you submit, the decisions you make based on evaluations, and your compliance with these Terms and applicable law.",
        "You must have the rights necessary to upload and request evaluation of any material you submit, including rights in music, video, images, text, and other works.",
      ],
    },
    {
      heading: "8. Prohibited content and conduct",
      paragraphs: [
        "You may not use the Service to submit or promote content that is unlawful, infringing, harmful, abusive, exploitative of minors, or that violates the rights of others. You may not attempt to disrupt the Service, reverse engineer non-public systems in unauthorized ways, bypass usage limits, or misuse admin or review workflows.",
        "We may refuse, remove, or limit submissions or access when we reasonably believe these Terms or the law have been violated.",
      ],
      bullets: [
        "Illegal content or content that facilitates crime",
        "Copyrighted material uploaded without authorization",
        "Malware, phishing, or deceptive technical content",
        "Harassment, hate content intended to threaten or abuse, or sexual content involving minors",
        "Attempts to scrape, overload, or interfere with the Service",
      ],
    },
    {
      heading: "9. Intellectual property",
      paragraphs: [
        "YourTruths and its branding, software, UI, prompts, evaluation frameworks, and related materials are owned by YourTruths or its licensors and are protected by intellectual property laws.",
        "These Terms do not transfer ownership of YourTruths IP to you. You may use the Service as offered; you may not copy, resell, or exploit the platform itself except as expressly permitted.",
      ],
    },
    {
      heading: "10. User-uploaded content",
      paragraphs: [
        "You retain ownership of the content you upload. You grant YourTruths a limited license to host, process, transmit, display, and otherwise use that content solely as needed to provide the Service you request (including AI processing and, where applicable, human review).",
        "Additional details appear in our User Content & Copyright Policy and Privacy Policy.",
      ],
    },
    {
      heading: "11. Third-party AI and service providers",
      paragraphs: [
        "The Service may rely on third-party providers for AI inference, hosting, authentication, analytics, email, or payments. Your content and account data may be processed by those providers as needed to operate the Service, subject to their terms and our Privacy Policy.",
        "We do not control third-party services and are not responsible for their outages, errors, or policy changes beyond what applicable law requires.",
      ],
    },
    {
      heading: "12. Service availability",
      paragraphs: [
        "We aim to keep the Service available but do not guarantee uninterrupted, error-free, or always-available operation. Features may be added, changed, suspended, or discontinued.",
        "AI capacity, human reviewer availability, and free-tier limits may constrain usage at any time.",
      ],
    },
    {
      heading: "13. Disclaimer of guarantees",
      paragraphs: [
        "THE SERVICE AND ALL EVALUATIONS, SCORES, VERDICTS, AND RELATED OUTPUTS ARE PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY LAW, YOURTRUTHS DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.",
        "YourTruths does not guarantee that any evaluation is accurate, complete, unbiased, or suitable for any particular purpose, or that following an evaluation will produce any result.",
      ],
    },
    {
      heading: "14. Limitation of liability",
      paragraphs: [
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, YOURTRUTHS AND ITS OPERATORS, CONTRIBUTORS, AND SUPPLIERS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, LOST REVENUE, LOST DATA, OR BUSINESS INTERRUPTION, ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE OR RELIANCE ON ANY EVALUATION.",
        "TO THE MAXIMUM EXTENT PERMITTED BY LAW, OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF OR RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNTS YOU PAID TO YOURTRUTHS FOR THE SERVICE IN THE THREE MONTHS BEFORE THE EVENT GIVING RISE TO LIABILITY, OR (B) USD $50 IF YOU HAVE NOT PAID ANY AMOUNTS.",
        "Some jurisdictions do not allow certain limitations; in those cases, our liability is limited to the fullest extent permitted by law.",
      ],
    },
    {
      heading: "15. Termination",
      paragraphs: [
        "You may stop using the Service at any time. We may suspend or terminate access if you violate these Terms, if required by law, or if we discontinue the Service.",
        "Sections that by their nature should survive termination (including IP, disclaimers, limitations of liability, and governing law) will survive.",
      ],
    },
    {
      heading: "16. Governing law and jurisdiction",
      paragraphs: [
        "These Terms are governed by the laws of the United Mexican States (Mexico), without regard to conflict-of-law principles, except where mandatory consumer protections in your country of residence cannot be waived.",
        "Subject to applicable mandatory law, courts located in Mexico shall have jurisdiction over disputes arising out of or relating to these Terms or the Service. If you are a consumer in a jurisdiction that requires local courts or protections, those mandatory rights remain available to you.",
      ],
    },
    {
      heading: "17. Changes to the Terms",
      paragraphs: [
        "We may update these Terms from time to time. The “Effective date” at the top of the page will be revised when changes are posted. Continued use of the Service after changes become effective constitutes acceptance of the updated Terms, except where applicable law requires additional consent.",
      ],
    },
    {
      heading: "18. Contact",
      paragraphs: [
        `Questions about these Terms: ${LEGAL_CONTACT_EMAIL}. You may also use the Contact page on the Service.`,
      ],
    },
  ],
};

export const PRIVACY_POLICY: LegalDoc = {
  title: "Privacy Policy",
  slug: "privacy",
  intro:
    "This Privacy Policy explains how YourTruths collects, uses, stores, and shares information when you use the Service. It is written for international users, including users in Mexico and the United States.",
  sections: [
    {
      heading: "1. Who we are",
      paragraphs: [
        LEGAL_ENTITY_NOTE,
        `Privacy requests: ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
    {
      heading: "2. Information we collect",
      paragraphs: [
        "Depending on how you use the Service, we may collect the following categories of information.",
      ],
      bullets: [
        "Account information (when authentication is enabled): name, email address, and identifiers provided by your sign-in provider (for example, Google).",
        "Submitted content: text, PDFs, images, descriptions, music, video, and related notes you upload or paste for evaluation.",
        "Evaluation outputs: scores, verdicts, strengths/weaknesses, review notes, and related result metadata.",
        "Payment information: when paid checkout is enabled, payment details are typically processed by a payment provider (such as Stripe). We may receive limited billing metadata (for example, purchase status, pack type, or transaction identifiers), not your full card number.",
        "Usage and technical information: IP address, device/browser type, pages viewed, approximate timestamps, error logs, and similar diagnostics needed to operate and secure the Service.",
        "Communications: messages you send us for support, privacy, or legal requests.",
      ],
    },
    {
      heading: "3. Uploaded files and content",
      paragraphs: [
        "When you submit content for evaluation, that content is processed to generate an opinion or queue a human review.",
        "For music and video human-review workflows, the product is designed to delete the uploaded media file after the evaluation result is saved. Metadata and the evaluation result may be retained so you can view history and so we can operate the Service.",
        "Free AI evaluations and related results may be stored so the Service can display results and history. Exact retention depends on how the Service is deployed and configured.",
        "We do not claim that all content is never stored, never transmitted, or instantly deleted in every case. Retention and deletion follow the operational design of the Service and the requirements of our providers.",
      ],
    },
    {
      heading: "4. How we use information",
      paragraphs: [
        "We use information to provide, maintain, secure, and improve the Service; to generate AI evaluations; to facilitate human review where applicable; to manage accounts, credits, and purchases when enabled; to communicate with you; to prevent abuse; and to comply with law.",
      ],
    },
    {
      heading: "5. AI processing",
      paragraphs: [
        "Submitted content and related prompts may be sent to third-party AI providers (for example, LLM APIs) to generate or rewrite evaluations. Those providers process data according to their own terms and privacy policies.",
        "AI outputs can be inaccurate or incomplete. See our AI Disclaimer.",
      ],
    },
    {
      heading: "6. Human review processing",
      paragraphs: [
        "For eligible human + AI reviews, authorized reviewers may access the submitted media and context necessary to form an opinion. Reviewer access is intended for performing the review, not for unrelated personal use.",
        "Human notes may be stored with the job and used to produce the final structured evaluation.",
      ],
    },
    {
      heading: "7. Model training",
      paragraphs: [
        "YourTruths does not currently operate a program that uses your uploads to train a proprietary YourTruths foundation model.",
        "However, content processed by third-party AI or infrastructure providers may be handled under those providers’ policies, which can differ. We do not claim that no provider ever logs, retains, or uses data beyond our control. Review the relevant provider policies for details, and contact us if you need clarification about our current configuration.",
      ],
    },
    {
      heading: "8. File retention and deletion",
      paragraphs: [
        "Where the Service implements temporary uploads for human review, media files are intended to be removed after the opinion is finalized. Evaluation results, scores, and related records may remain available in history or server storage.",
        "Backups, logs, and provider-side retention may persist for a limited period after deletion from primary application storage. We do not promise irreversible immediate deletion from every system in every case.",
      ],
    },
    {
      heading: "9. Third-party service providers",
      paragraphs: [
        "We may use providers for hosting, AI inference, authentication, payments, email delivery, security, and analytics. These providers process data only as needed to perform services for us, subject to their agreements and policies.",
      ],
    },
    {
      heading: "10. Data security",
      paragraphs: [
        "We take reasonable administrative and technical measures appropriate to the nature of the Service. No method of transmission or storage is completely secure, and we cannot guarantee absolute security.",
      ],
    },
    {
      heading: "11. International users and transfers",
      paragraphs: [
        "YourTruths is Mexican-owned and may serve users internationally, including in the United States. Information may be processed in Mexico, the United States, or other countries where we or our providers operate.",
        "Where required, we rely on appropriate transfer mechanisms and contractual protections available under applicable law.",
      ],
    },
    {
      heading: "12. Privacy rights",
      paragraphs: [
        "Depending on where you live, you may have rights to access, correct, delete, or restrict certain personal data, or to object to certain processing, subject to legal exceptions.",
      ],
    },
    {
      heading: "13. Mexican ARCO rights",
      paragraphs: [
        "If you are in Mexico, you may have ARCO rights (Access, Rectification, Cancellation, and Opposition) under applicable Mexican data-protection law, as well as related rights regarding consent and processing.",
        `To exercise ARCO or related Mexican privacy rights, contact ${LEGAL_CONTACT_EMAIL} with sufficient detail to verify your request. We will respond in accordance with applicable law.`,
      ],
    },
    {
      heading: "14. California and U.S. privacy rights",
      paragraphs: [
        "If you are a U.S. resident, including in California, you may have rights under applicable state privacy laws, such as rights to know/access, delete, correct, or opt out of certain data practices, subject to eligibility and exceptions.",
        "YourTruths is not designed to sell personal information. If that practice ever changes, we will update this Policy and provide required opt-out mechanisms.",
        `To make a U.S. privacy request, email ${LEGAL_CONTACT_EMAIL}. We may need to verify your identity before fulfilling the request.`,
      ],
    },
    {
      heading: "15. Children",
      paragraphs: [
        "The Service is not directed to children under 13 (or the higher age required in your jurisdiction). Do not use the Service if you are under the applicable age. Contact us if you believe we have collected personal information from a child.",
      ],
    },
    {
      heading: "16. Changes to this Policy",
      paragraphs: [
        "We may update this Privacy Policy from time to time. The effective date will be updated when changes are posted.",
      ],
    },
    {
      heading: "17. Contact / privacy requests",
      paragraphs: [
        `Email: ${LEGAL_CONTACT_EMAIL}. You may also use the Contact page.`,
      ],
    },
  ],
};

export const REFUND_POLICY: LegalDoc = {
  title: "Refund & Cancellation Policy",
  slug: "refunds",
  intro:
    "This Refund & Cancellation Policy explains how free usage and paid purchases are handled on YourTruths. It is designed to match what the product can actually support. Do not assume automated refunds exist unless checkout and refund tooling are enabled.",
  sections: [
    {
      heading: "1. Free AI usage",
      paragraphs: [
        "Free AI opinions (for supported categories such as text, PDFs, images, and physical appearance, subject to daily or other limits) are provided at no charge. Free usage is not a paid purchase and is not refundable.",
      ],
    },
    {
      heading: "2. Human + AI credits",
      paragraphs: [
        "Human + AI packages (for example, a set number of music and video human reviews) are credit-based offerings described on the Pricing page.",
        "Once a credit is consumed to submit a human-review job, that credit is generally considered used, even if you later dislike the opinion, because reviewer time and processing have been allocated.",
      ],
    },
    {
      heading: "3. Pro credits",
      paragraphs: [
        "Higher-tier packages (for example, HUMAN + AI PRO) may include additional credits, priority handling, longer media support, or privacy-related features as described at purchase.",
        "The same general rule applies: unused credits may be eligible for review under the conditions below; consumed credits are ordinarily non-refundable.",
      ],
    },
    {
      heading: "4. When purchases become non-refundable",
      paragraphs: [
        "Unless required by applicable law or expressly agreed by us in writing:",
      ],
      bullets: [
        "Purchases are non-refundable after credits have been used.",
        "Purchases may be non-refundable after a reasonable period following purchase even if unused, once paid checkout is live—check the purchase confirmation for any stated window.",
        "Dissatisfaction with an opinion, score, or artistic disagreement is not by itself grounds for a refund.",
      ],
    },
    {
      heading: "5. Failed or duplicate payments",
      paragraphs: [
        "If a payment fails, you generally should not be charged. If you are charged in error, or charged twice for the same purchase, contact us promptly with the transaction details so we can investigate with our payment provider.",
        "Resolution of failed/duplicate charges depends on payment-provider records and applicable card-network or banking processes.",
      ],
    },
    {
      heading: "6. Service issues",
      paragraphs: [
        "If a paid human-review job cannot be completed due to a clear Service failure on our side (for example, the submission is accepted as paid but permanently cannot be reviewed because of an internal fault), contact us. We may, at our discretion, restore a credit, provide a replacement review, or issue a refund where payments and refund tooling support it.",
        "We do not promise refunds for outages of third-party AI providers, your local device issues, or content we refuse because it violates our Terms or Content Policy.",
      ],
    },
    {
      heading: "7. Cancellations",
      paragraphs: [
        "YourTruths currently emphasizes one-time credit packs rather than automatically renewing subscriptions. If a subscription product is introduced later, cancellation terms will be described at signup and in an updated version of this Policy.",
        "Stopping use of the Service does not automatically refund unused credits unless we approve a refund request.",
      ],
    },
    {
      heading: "8. How to request a refund",
      paragraphs: [
        `Email ${LEGAL_CONTACT_EMAIL} with: your account email (if any), purchase date, approximate amount, pack type, and a short description of the issue.`,
        "We will review eligible requests in good faith. Response times may vary. This Policy does not create an automatic right to a refund where the Service and payment systems do not support one, except where mandatory law requires otherwise.",
      ],
    },
  ],
};

export const AI_DISCLAIMER: LegalDoc = {
  title: "AI Disclaimer",
  slug: "ai-disclaimer",
  intro:
    "Please read this disclaimer carefully before relying on any YourTruths evaluation, score, or verdict.",
  sections: [
    {
      heading: "1. AI-assisted evaluations",
      paragraphs: [
        "YourTruths generates AI-assisted evaluations. For some submissions, AI processes your content directly. For music and video human + AI reviews, AI may rewrite or structure a human reviewer’s notes into a finished opinion.",
      ],
    },
    {
      heading: "2. Opinions and analysis — not objective truth",
      paragraphs: [
        "Evaluations are opinions and analytical outputs. They are not statements of objective truth, certification, appraisal, or professional endorsement.",
      ],
    },
    {
      heading: "3. AI can be wrong",
      paragraphs: [
        "AI systems can be incorrect, incomplete, inconsistent, or biased. They may miss context, misunderstand creative intent, or produce uneven results across languages, genres, or formats.",
      ],
    },
    {
      heading: "4. Scores are not professional advice",
      paragraphs: [
        "YourTruths scores (including 0–100 rankings) and written verdicts should not be treated as legal, financial, medical, therapeutic, investment, career, or other professional advice.",
        "Do not use an evaluation as the sole basis for high-stakes decisions.",
      ],
    },
    {
      heading: "5. Your responsibility",
      paragraphs: [
        "You remain solely responsible for decisions you make based on any evaluation, including creative, business, publishing, release, hiring, or personal choices.",
      ],
    },
    {
      heading: "6. Human reviews are individual perspectives",
      paragraphs: [
        "When a human reviewer participates, their reaction is an individual perspective—not a universal audience consensus, market forecast, or guarantee of reception.",
        "Different reviewers may disagree. Priority or “best reviewer” labeling, if offered, does not convert an opinion into an objective standard.",
      ],
    },
    {
      heading: "7. No outcome guarantees",
      paragraphs: [
        "YourTruths does not guarantee artistic success, business results, virality, grades, employment outcomes, or any other result from using the Service or following an evaluation.",
      ],
    },
  ],
};

export const CONTENT_POLICY: LegalDoc = {
  title: "User Content & Copyright Policy",
  slug: "content-policy",
  intro:
    "This Policy explains ownership of user content, the limited permissions you grant YourTruths, copyright rules, and how human reviewers may access submissions.",
  sections: [
    {
      heading: "1. You retain ownership",
      paragraphs: [
        "You retain ownership of the original work you upload or submit to YourTruths, subject to third-party rights that already apply to that work.",
      ],
    },
    {
      heading: "2. Limited license to operate the Service",
      paragraphs: [
        "By submitting content, you grant YourTruths a worldwide, non-exclusive license to host, process, transmit, reproduce, adapt (for formatting or AI restructuring), display, and otherwise use the content only as reasonably necessary to provide the evaluation or review you requested, to operate and secure the Service, and to comply with law.",
        "This license is not a transfer of ownership and is not a grant for YourTruths to exploit your work as a commercial catalog unrelated to providing the Service.",
      ],
    },
    {
      heading: "3. Rights you must have",
      paragraphs: [
        "You represent that you have all rights, licenses, and permissions needed to submit the content and to authorize the processing described in these policies—including rights from collaborators, labels, clients, or licensors where required.",
      ],
    },
    {
      heading: "4. Copyright infringement prohibited",
      paragraphs: [
        "You may not upload content that infringes copyright or other IP rights. We may remove or disable access to material we reasonably believe is infringing and may suspend accounts that repeatedly infringe.",
      ],
    },
    {
      heading: "5. Reporting copyright concerns",
      paragraphs: [
        `If you believe content on YourTruths infringes your copyright, email ${LEGAL_CONTACT_EMAIL} with:`,
      ],
      bullets: [
        "Your contact name and email",
        "Description of the copyrighted work",
        "Location/URL or job identifier of the allegedly infringing material (if available)",
        "A statement that you have a good-faith belief the use is not authorized",
        "A statement that the information is accurate and, under penalty of perjury where applicable, that you are the owner or authorized to act",
        "Your physical or electronic signature (typing your full name can suffice for email)",
      ],
    },
    {
      heading: "6. Human reviewer access",
      paragraphs: [
        "Human reviewers only access content necessary to perform the requested review (for example, the audio/video file and related context). Reviewers are expected to use that access solely for evaluation purposes.",
      ],
    },
    {
      heading: "7. Confidentiality",
      paragraphs: [
        "We treat user submissions as confidential operational data of the Service and do not sell user uploads as a content library.",
        "Confidentiality is not absolute: content is processed by systems and providers as described in the Privacy Policy; reviewers see what they need to review; and we may disclose information if required by law or to protect rights, safety, and security.",
        "If a package is labeled private or similar, we will take reasonable steps consistent with that offering to avoid featuring the opinion in public/shared feeds, subject to technical limits and legal requirements.",
      ],
    },
    {
      heading: "8. Sharing and public features",
      paragraphs: [
        "If you choose sharing options or if the Service displays anonymized/public examples, follow the in-product controls. Do not submit material you are unwilling to have processed under the Privacy Policy and these Terms.",
      ],
    },
    {
      heading: "9. Contact",
      paragraphs: [
        `Content and copyright questions: ${LEGAL_CONTACT_EMAIL}.`,
      ],
    },
  ],
};

export const CONTACT_PAGE = {
  title: "Contact",
  intro:
    "For support, privacy requests, refund questions, copyright notices, and legal inquiries, reach YourTruths using the details below.",
  email: LEGAL_CONTACT_EMAIL,
  notes: [
    "Please include enough detail for us to help (account email if any, page URL, job/result ID if relevant, and a clear description).",
    "For privacy or ARCO requests, state the type of request and the email tied to your use of the Service.",
    "For copyright notices, include the information listed in the User Content & Copyright Policy.",
    "We aim to respond in a reasonable time, but response times may vary.",
  ],
} as const;

export function getLegalDoc(slug: string): LegalDoc | null {
  const docs = [TERMS_OF_SERVICE, PRIVACY_POLICY, REFUND_POLICY, AI_DISCLAIMER, CONTENT_POLICY];
  return docs.find((doc) => doc.slug === slug) ?? null;
}
