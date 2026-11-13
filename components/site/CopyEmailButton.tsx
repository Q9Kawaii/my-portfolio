"use client";
import { Check, Copy, Mail } from "lucide-react";
import { useEffect, useState } from "react";

/** Button showing an email address; clicking copies it. Falls back to opening the mail app if copying is blocked. */
export default function CopyEmailButton({ email, className = "btn btn-primary" }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  }

  return (
    <button type="button" onClick={copy} className={`group ${className}`} title="Click to copy">
      {copied ? <Check size={16} aria-hidden /> : <Mail size={16} aria-hidden className="group-hover:hidden" />}
      {!copied && <Copy size={16} aria-hidden className="hidden group-hover:block" />}
      <span aria-live="polite">{copied ? "Email copied!" : email}</span>
    </button>
  );
}
