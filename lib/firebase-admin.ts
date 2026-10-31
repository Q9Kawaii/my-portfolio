import "server-only";
import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

/**
 * Admin SDK for server-only writes (e.g. contact messages), which bypass
 * Firestore rules. Credentials come from FIREBASE_SERVICE_ACCOUNT_KEY: the
 * service-account JSON, either raw or base64-encoded. Returns null when it
 * isn't configured so callers can degrade gracefully.
 */
export function getAdminDb(): Firestore | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
  if (!raw) return null;
  if (!getApps().length) {
    try {
      const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
      const sa = JSON.parse(json) as ServiceAccount & { private_key?: string };
      initializeApp({ credential: cert(sa) });
    } catch (err) {
      console.error("[firebase-admin] invalid FIREBASE_SERVICE_ACCOUNT_KEY:", err instanceof Error ? err.message : err);
      return null;
    }
  }
  return getFirestore();
}
