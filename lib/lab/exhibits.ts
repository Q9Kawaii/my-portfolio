export type LabExhibit = {
  slug: string;
  letter: string;
  title: string;
  summary: string;
  /** What runs where, in one line, so visitors know it's safe. */
  safety: string;
  tags: string[];
};

export const LAB_EXHIBITS: LabExhibit[] = [
  {
    slug: "headers",
    letter: "A",
    title: "Security headers check",
    summary: "Enter your site's address and get a graded report of its HTTP security headers, with a fix for each gap.",
    safety: "One ordinary GET request, the same a browser makes. Private and internal addresses are refused.",
    tags: ["HSTS", "CSP", "Clickjacking", "SSRF-safe"],
  },
  {
    slug: "password",
    letter: "B",
    title: "Password breach check",
    summary: "See how strong a password is and whether it has appeared in a known data breach.",
    safety: "Your password never leaves the browser. Only the first 5 characters of its SHA-1 hash are sent (k-anonymity).",
    tags: ["k-Anonymity", "SHA-1", "HIBP"],
  },
  {
    slug: "access",
    letter: "C",
    title: "Access-control playground",
    summary: "Act as a student, faculty advisor or admin in a SHINE-style portal and watch each request get allowed or denied.",
    safety: "A simulation in your browser. The rules mirror the Firestore security rules I write for real projects.",
    tags: ["RBAC", "Least privilege", "Firestore rules"],
  },
  {
    slug: "injection",
    letter: "D",
    title: "Vulnerable vs. fixed",
    summary: "Run SQL injection and XSS payloads against a deliberately broken login and comment box, then against the fixed versions.",
    safety: "The database is a fake one in your browser, and XSS runs inside a sandboxed frame that can't touch this site.",
    tags: ["SQL injection", "XSS", "OWASP Top 10"],
  },
  {
    slug: "jwt",
    letter: "E",
    title: "Login token inspector",
    summary: "Paste a JWT to decode it and flag common mistakes: alg none, missing expiry, long lifetimes and leaked secrets.",
    safety: "Decoded entirely in your browser. Nothing is sent anywhere or stored.",
    tags: ["JWT", "Authentication", "Session security"],
  },
];

export const labExhibit = (slug: string) => LAB_EXHIBITS.find((e) => e.slug === slug)!;
