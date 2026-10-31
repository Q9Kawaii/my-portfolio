"use client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Loader2, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdmin } from "@/components/admin/useAdmin";
import { auth } from "@/lib/firebase";

export default function AdminLogin() {
  const router = useRouter();
  const state = useAdmin();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (state.status === "admin") router.replace("/admin/dashboard");
    if (state.status === "denied") setError("This account is not authorised to manage the site.");
  }, [state, router]);

  const signIn = async () => {
    setError("");
    setBusy(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== "auth/popup-closed-by-user") setError("Sign-in failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-accent text-bg">
          <LockKeyhole size={22} aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-2xl font-semibold text-text">Portfolio admin</h1>
        <p className="mt-2 text-muted">Sign in with the authorised Google account to manage the site.</p>
        <button
          type="button"
          onClick={signIn}
          disabled={busy || state.status === "loading"}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 font-semibold text-bg transition hover:brightness-110 disabled:opacity-70"
        >
          {(busy || state.status === "loading") && <Loader2 size={18} className="animate-spin" aria-hidden />}
          Sign in with Google
        </button>
        <p role="alert" className="mt-4 min-h-6 text-danger">
          {error}
        </p>
        <Link href="/" className="text-sm text-text underline-offset-4 hover:underline">
          ← Back to site
        </Link>
      </div>
    </main>
  );
}
